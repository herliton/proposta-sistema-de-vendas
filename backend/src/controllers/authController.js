import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { created, ok } from '../utils/response.js';
import { prisma } from '../config/database.js';
import { sendTemporaryAccessEmail, sendPasswordResetEmail } from '../utils/email.js';

const roles = ['ADMIN', 'MANAGER', 'SELLER', 'SUPPORT'];
const normalizedEmail = (value) => String(value || '').trim().toLowerCase();
const userResponse = (user) => ({
  id: user.id, nome: user.nome, email: user.email, perfil: user.perfil, status: user.status || 'ativo',
  telefone: user.telefone || user.vendedores?.[0]?.telefone || '', cep: user.cep || '', logradouro: user.logradouro || '',
  numero: user.numero || '', complemento: user.complemento || '', bairro: user.bairro || '', cidade: user.cidade || '', estado: user.estado || '',
  firstAccess: Boolean(user.firstAccess), lojaId: user.lojaId ?? 1, lojaNome: user.loja?.nome || '', gerenteId: user.gerenteId ?? null, equipeId: user.equipeId ?? null,
});
const tokenFor = (user, firstAccess) => jwt.sign({ id: user.id, email: user.email, perfil: user.perfil, firstAccess, lojaId: user.lojaId ?? 1 }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
const mailError = (error) => {
  if (error.code === 'SMTP_NOT_CONFIGURED') return { status: 503, message: error.message };
  if (error.code === 'EAUTH') return { status: 502, message: 'O Titan recusou a autenticação SMTP. Confira o endereço e a senha da caixa postal e habilite o acesso de aplicativos.' };
  if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') return { status: 502, message: 'Não foi possível conectar ao SMTP Titan. Confira host/porta ou liberação de saída na rede.' };
  return { status: 502, message: 'O envio por e-mail falhou. Nenhuma alteração foi salva.' };
};
const conflictEmail = async (email, excludeId) => {
  const [user, seller] = await Promise.all([
    prisma.usuario.findFirst({ where: { email, ...(excludeId ? { id: { not: excludeId } } : {}) } }),
    prisma.vendedor.findUnique({ where: { email } }),
  ]);
  return Boolean(user || seller);
};
const profileFields = (body) => ({
  nome: String(body.nome || '').trim(), perfil: String(body.perfil || 'SELLER').toUpperCase(),
  telefone: String(body.telefone || '').trim() || null, cep: String(body.cep || '').trim() || null,
  logradouro: String(body.logradouro || '').trim() || null, numero: String(body.numero || '').trim() || null,
  complemento: String(body.complemento || '').trim() || null, bairro: String(body.bairro || '').trim() || null,
  cidade: String(body.cidade || '').trim() || null, estado: String(body.estado || '').trim().toUpperCase() || null,
  status: String(body.status || 'ativo').trim().toLowerCase(),
});
export const register = async (req, res) => {
  const nome = String(req.body.nome || '').trim();
  const email = normalizedEmail(req.body.email);
  const senha = String(req.body.senha || '');
  if (!nome || !email || !senha) return res.status(400).json({ success: false, message: 'Nome, email e senha são obrigatórios', error: 'BAD_REQUEST' });
  if (await conflictEmail(email)) return res.status(409).json({ success: false, message: 'Usuário com este e-mail já existe', error: 'USER_EXISTS' });
  const user = await prisma.usuario.create({ data: { nome, email, senhaHash: await bcrypt.hash(senha, 10), perfil: 'SELLER', firstAccess: true, status: 'ativo' } });
  const firstAccess = true;
  return created(res, { user: userResponse(user), token: tokenFor(user, firstAccess) }, 'Usuário criado com sucesso');
};

export const login = async (req, res) => {
  const email = normalizedEmail(req.body.email);
  const senha = String(req.body.senha || '');
  if (!email || !senha) return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios', error: 'BAD_REQUEST' });
  const user = await prisma.usuario.findFirst({ where: { email, status: { not: 'inativo' } }, include: { vendedores: { take: 1 }, loja: true } });
  if (!user || !(await bcrypt.compare(senha, user.senhaHash))) return res.status(401).json({ success: false, message: 'Credenciais inválidas', error: 'INVALID_CREDENTIALS' });
  const firstAccess = Boolean(user.firstAccess);
  return ok(res, { user: userResponse(user), token: tokenFor(user, firstAccess) }, 'Login realizado com sucesso');
};

const userSortFields = { name: 'nome', nome: 'nome', email: 'email', profile: 'perfil', perfil: 'perfil', status: 'status', createdAt: 'createdAt' };
const activeAdminProfiles = ['ADMIN', 'ADMINISTRADOR'];
const validateUserId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};
const protectLastAdmin = async (tx, current, nextProfile, nextStatus) => {
  const currentIsActiveAdmin = activeAdminProfiles.includes(current.perfil) && current.status !== 'inativo';
  const remainsActiveAdmin = activeAdminProfiles.includes(nextProfile) && nextStatus !== 'inativo';
  if (!currentIsActiveAdmin || remainsActiveAdmin) return;
  const activeAdmins = await tx.$queryRaw`SELECT id FROM Usuario WHERE perfil IN ('ADMIN', 'ADMINISTRADOR') AND status <> 'inativo' FOR UPDATE`;
  if (activeAdmins.length <= 1) {
    const error = new Error('Não é permitido desativar ou rebaixar o último administrador ativo.');
    error.code = 'LAST_ACTIVE_ADMIN';
    throw error;
  }
};

export const listUsers = async (req, res) => {
  const search = String(req.query.search || req.query.q || '').trim();
  if (search.length > 191) return res.status(400).json({ success: false, error: 'SEARCH_TOO_LONG', message: 'A busca deve ter no máximo 191 caracteres.' });
  const profile = String(req.query.perfil || '').trim().toUpperCase();
  if (profile && !roles.includes(profile)) return res.status(400).json({ success: false, error: 'INVALID_PROFILE', message: 'O perfil informado é inválido.' });
  const status = String(req.query.status || '').trim().toLowerCase();
  if (status && !['ativo', 'inativo'].includes(status)) return res.status(400).json({ success: false, error: 'INVALID_STATUS', message: 'O status deve ser ativo ou inativo.' });
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const pageSize = req.query.pageSize === undefined ? 25 : Number(req.query.pageSize);
  const paginated = req.query.page !== undefined || req.query.pageSize !== undefined;
  if (paginated && (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100 || !Number.isSafeInteger((page - 1) * pageSize))) return res.status(400).json({ success: false, error: 'INVALID_PAGINATION', message: 'A página deve ser positiva e o tamanho deve estar entre 1 e 100.' });
  const storeId = req.query.lojaId === undefined ? undefined : validateUserId(req.query.lojaId);
  const teamId = req.query.equipeId === undefined ? undefined : validateUserId(req.query.equipeId);
  if (req.query.lojaId !== undefined && storeId === null || req.query.equipeId !== undefined && teamId === null) return res.status(400).json({ success: false, error: 'INVALID_FILTER', message: 'O filtro de loja ou equipe é inválido.' });
  const sortField = userSortFields[String(req.query.sortBy || 'name')];
  const sortOrder = String(req.query.sortOrder || 'asc').toLowerCase();
  if (!sortField || !['asc', 'desc'].includes(sortOrder)) return res.status(400).json({ success: false, error: 'INVALID_SORT', message: 'A ordenação solicitada não é permitida.' });
  const where = {
    ...(profile ? { perfil: profile } : {}),
    ...(status ? { status } : {}),
    ...(storeId !== undefined ? { lojaId: storeId } : {}),
    ...(teamId !== undefined ? { equipeId: teamId } : {}),
    ...(search ? { OR: [{ nome: { contains: search } }, { email: { contains: search } }] } : {}),
  };
  const [users, total] = await Promise.all([
    prisma.usuario.findMany({
      where,
      include: { vendedores: { take: 1 }, loja: true },
      orderBy: [{ [sortField]: sortOrder }, { id: 'asc' }],
      ...(paginated ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
    }),
    paginated ? prisma.usuario.count({ where }) : Promise.resolve(null),
  ]);
  const records = users.map(userResponse);
  return ok(res, paginated ? { items: records, pagination: { page, pageSize, total: total || 0, totalPages: Math.ceil((total || 0) / pageSize) } } : records, 'Usuários carregados com sucesso');
};

export const getUserById = async (req, res) => {
  const id = validateUserId(req.params.id);
  if (!id) return res.status(400).json({ success: false, error: 'INVALID_USER_ID', message: 'Identificador de usuário inválido.' });
  const user = await prisma.usuario.findUnique({ where: { id }, include: { vendedores: { take: 1 }, loja: true, equipeComercial: true } });
  if (!user) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Usuário não encontrado.' });
  return ok(res, { ...userResponse(user), equipeNome: user.equipeComercial?.nome || '' }, 'Usuário carregado com sucesso');
};

export const createUser = async (req, res) => {
  const fields = profileFields(req.body);
  const email = normalizedEmail(req.body.email);
  if (!fields.nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Nome e e-mail válido são obrigatórios', error: 'BAD_REQUEST' });
  if (fields.nome.length > 191 || email.length > 191 || fields.telefone?.length > 191) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Nome, e-mail e telefone devem ter no máximo 191 caracteres.' });
  if (req.body.status !== undefined && !['ativo', 'inativo'].includes(String(req.body.status).toLowerCase())) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'O status deve ser ativo ou inativo.' });
  if (!roles.includes(fields.perfil)) return res.status(400).json({ success: false, message: 'Perfil inválido', error: 'BAD_REQUEST' });
  if (await conflictEmail(email)) return res.status(409).json({ success: false, message: 'Este e-mail já está em uso', error: 'USER_EXISTS' });
  const lojaId = Number(req.body.lojaId || req.user?.lojaId || 1);
  if (!Number.isSafeInteger(lojaId) || lojaId < 1) return res.status(400).json({ success: false, error: 'INVALID_STORE', message: 'Selecione uma loja válida para o usuário.' });
  if (!await prisma.loja.findFirst({ where: { id: lojaId, status: 'ativo' } })) return res.status(400).json({ success: false, error: 'INVALID_STORE', message: 'Selecione uma loja ativa para o usuário.' });
  const temporaryPassword = `TmpA1${randomBytes(12).toString('hex')}`;
  try { await sendTemporaryAccessEmail({ nome: fields.nome, email, temporaryPassword }); }
  catch (error) { const mapped = mailError(error); if (error.code !== 'SMTP_NOT_CONFIGURED') console.error('Falha no SMTP:', error.code || 'UNKNOWN', error.responseCode || ''); return res.status(mapped.status).json({ success: false, error: error.code || 'EMAIL_DELIVERY_FAILED', message: mapped.message }); }
  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.usuario.create({ data: { ...fields, email, lojaId, senhaHash: await bcrypt.hash(temporaryPassword, 10), firstAccess: true } });
    if (['SELLER', 'MANAGER'].includes(fields.perfil)) await tx.vendedor.create({ data: { nome: fields.nome, email, telefone: fields.telefone, cargo: fields.perfil === 'MANAGER' ? 'Gerente' : 'Vendedor', status: fields.status, usuarioId: createdUser.id, lojaId } });
    await tx.auditLog.create({ data: { actorId: Number(req.user.id), action: 'USER_CREATED', details: { usuarioId: createdUser.id, perfil: fields.perfil, lojaId } } });
    return tx.usuario.findUnique({ where: { id: createdUser.id }, include: { vendedores: { take: 1 }, loja: true } });
  });
  return created(res, { ...userResponse(user), emailSent: true }, 'Usuário criado. As instruções de acesso foram enviadas por e-mail.');
};

export const updateUser = async (req, res) => {
  const id = validateUserId(req.params.id);
  if (!id) return res.status(400).json({ success: false, error: 'INVALID_USER_ID', message: 'Identificador de usuário inválido.' });
  const current = await prisma.usuario.findUnique({ where: { id }, include: { vendedores: { take: 1 }, loja: true } });
  if (!current) return res.status(404).json({ success: false, message: 'Usuário não encontrado', error: 'NOT_FOUND' });
  const fields = profileFields({ ...current, ...req.body });
  if (!fields.nome || fields.nome.length > 191 || fields.telefone?.length > 191) return res.status(400).json({ success: false, message: 'Nome e telefone são obrigatórios e devem ter no máximo 191 caracteres.', error: 'BAD_REQUEST' });
  if (!roles.includes(fields.perfil)) return res.status(400).json({ success: false, message: 'Perfil inválido', error: 'BAD_REQUEST' });
  if (req.body.status !== undefined && !['ativo', 'inativo'].includes(String(req.body.status).toLowerCase())) return res.status(400).json({ success: false, error: 'INVALID_STATUS', message: 'O status deve ser ativo ou inativo.' });
  const lojaId = Number(req.body.lojaId ?? current.lojaId);
  if (!Number.isSafeInteger(lojaId) || lojaId < 1) return res.status(400).json({ success: false, error: 'INVALID_STORE', message: 'Selecione uma loja válida para o usuário.' });
  if (!await prisma.loja.findFirst({ where: { id: lojaId, status: 'ativo' } })) return res.status(400).json({ success: false, error: 'INVALID_STORE', message: 'Selecione uma loja ativa para o usuário.' });
  try {
    const user = await prisma.$transaction(async (tx) => {
      await protectLastAdmin(tx, current, fields.perfil, fields.status);
      const updated = await tx.usuario.update({
        where: { id },
        data: { ...fields, email: current.email, lojaId, updatedAt: new Date() },
      });
      const seller = await tx.vendedor.findFirst({ where: { usuarioId: id } });
      const sellerStatus = ['SELLER', 'MANAGER'].includes(fields.perfil) ? fields.status : 'inativo';
      if (seller) {
        await tx.vendedor.update({
          where: { id: seller.id },
          data: {
            nome: fields.nome,
            telefone: fields.telefone,
            status: sellerStatus,
            lojaId,
            cargo: fields.perfil === 'MANAGER' ? 'Gerente' : fields.perfil === 'SELLER' ? 'Vendedor' : seller.cargo,
          },
        });
      } else if (['SELLER', 'MANAGER'].includes(fields.perfil)) {
        await tx.vendedor.create({
          data: { nome: fields.nome, email: current.email, telefone: fields.telefone, cargo: fields.perfil === 'MANAGER' ? 'Gerente' : 'Vendedor', status: fields.status, usuarioId: id, lojaId },
        });
      }
      await tx.auditLog.create({
        data: { actorId: Number(req.user.id), action: 'USER_UPDATED', details: { usuarioId: id, perfil: fields.perfil, status: fields.status, lojaId } },
      });
      return tx.usuario.findUnique({ where: { id: updated.id }, include: { vendedores: { take: 1 }, loja: true } });
    });
    return ok(res, userResponse(user), 'Usuário atualizado com sucesso.');
  } catch (error) {
    if (error.code === 'LAST_ACTIVE_ADMIN') return res.status(409).json({ success: false, error: error.code, message: error.message });
    throw error;
  }
};

export const deactivateUser = async (req, res) => {
  const id = validateUserId(req.params.id);
  if (!id) return res.status(400).json({ success: false, error: 'INVALID_USER_ID', message: 'Identificador de usuário inválido.' });
  const current = await prisma.usuario.findUnique({ where: { id } });
  if (!current) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Usuário não encontrado.' });
  try {
    await prisma.$transaction(async (tx) => {
      await protectLastAdmin(tx, current, current.perfil, 'inativo');
      await tx.usuario.update({
        where: { id },
        data: { status: 'inativo', resetPasswordTokenHash: null, resetPasswordExpires: null, updatedAt: new Date() },
      });
      await tx.vendedor.updateMany({ where: { usuarioId: id }, data: { status: 'inativo' } });
      await tx.auditLog.create({
        data: { actorId: Number(req.user.id), action: 'USER_DEACTIVATED', details: { usuarioId: id, email: current.email } },
      });
    });
    return ok(res, { id, status: 'inativo' }, 'Usuário desativado com sucesso.');
  } catch (error) {
    if (error.code === 'LAST_ACTIVE_ADMIN') return res.status(409).json({ success: false, error: error.code, message: error.message });
    throw error;
  }
};

export const forgotPassword = async (req, res) => {
  const genericMessage = 'Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha.';
  const email = normalizedEmail(req.body.email);
  if (!email || !email.includes('@')) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Informe um e-mail válido.' });
  const user = await prisma.usuario.findFirst({ where: { email, status: { not: 'inativo' } } });
  if (user) {
    const resetToken = randomBytes(32).toString('hex');
    await prisma.usuario.update({ where: { id: user.id }, data: { resetPasswordTokenHash: createHash('sha256').update(resetToken).digest('hex'), resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), updatedAt: new Date() } });
    try { await sendPasswordResetEmail({ nome: user.nome, email: user.email, resetToken }); }
    catch (error) { await prisma.usuario.update({ where: { id: user.id }, data: { resetPasswordTokenHash: null, resetPasswordExpires: null } }); console.error('Falha ao enviar recuperação de senha:', error.code || 'EMAIL_DELIVERY_FAILED'); }
  }
  return ok(res, { accepted: true }, genericMessage);
};

export const resetPassword = async (req, res) => {
  const token = String(req.body.token || '').trim();
  const password = String(req.body.senha || '');
  if (!token) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Link de recuperação inválido ou expirado.' });
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(password)) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'A senha deve ter ao menos 8 caracteres, com maiúscula, minúscula e número.' });
  const candidate = Buffer.from(createHash('sha256').update(token).digest('hex'), 'hex');
  const users = await prisma.usuario.findMany({ where: { resetPasswordTokenHash: { not: null }, resetPasswordExpires: { gt: new Date() } } });
  const user = users.find((item) => { const stored = Buffer.from(item.resetPasswordTokenHash, 'hex'); return stored.length === candidate.length && timingSafeEqual(stored, candidate); });
  if (!user) return res.status(400).json({ success: false, error: 'INVALID_OR_EXPIRED_TOKEN', message: 'Link de recuperação inválido ou expirado. Solicite um novo link.' });
  await prisma.usuario.update({ where: { id: user.id }, data: { senhaHash: await bcrypt.hash(password, 10), firstAccess: false, resetPasswordTokenHash: null, resetPasswordExpires: null, updatedAt: new Date() } });
  return ok(res, { user: { id: user.id, email: user.email } }, 'Senha alterada com sucesso. Faça login com a nova senha.');
};

export const firstAccessChange = async (req, res) => {
  const password = String(req.body.senha || '');
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(password)) return res.status(400).json({ success: false, message: 'A senha deve ter ao menos 8 caracteres, com maiúscula, minúscula e número', error: 'BAD_REQUEST' });
  const user = await prisma.usuario.findUnique({ where: { id: Number(req.user?.id) }, include: { vendedores: { take: 1 } } });
  if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado', error: 'NOT_FOUND' });
  if (!user.firstAccess) return res.status(409).json({ success: false, message: 'A troca obrigatória já foi concluída', error: 'FIRST_ACCESS_COMPLETE' });
  const updated = await prisma.usuario.update({ where: { id: user.id }, data: { senhaHash: await bcrypt.hash(password, 10), firstAccess: false, updatedAt: new Date() }, include: { vendedores: { take: 1 } } });
  return ok(res, { user: userResponse(updated) }, 'Senha alterada com sucesso');
};
