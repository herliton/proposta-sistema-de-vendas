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
  firstAccess: Boolean(user.firstAccess), lojaId: user.lojaId ?? 1, lojaNome: user.loja?.nome || '',
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
  status: body.status === 'inativo' ? 'inativo' : 'ativo',
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

export const listUsers = async (_req, res) => {
  const users = await prisma.usuario.findMany({ include: { vendedores: { take: 1 }, loja: true }, orderBy: { nome: 'asc' } });
  return ok(res, users.map(userResponse), 'Usuários carregados com sucesso');
};

export const createUser = async (req, res) => {
  const fields = profileFields(req.body);
  const email = normalizedEmail(req.body.email);
  if (!fields.nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Nome e e-mail válido são obrigatórios', error: 'BAD_REQUEST' });
  if (!roles.includes(fields.perfil)) return res.status(400).json({ success: false, message: 'Perfil inválido', error: 'BAD_REQUEST' });
  if (await conflictEmail(email)) return res.status(409).json({ success: false, message: 'Este e-mail já está em uso', error: 'USER_EXISTS' });
  const lojaId = Number(req.body.lojaId || req.user?.lojaId || 1);
  if (!await prisma.loja.findFirst({ where: { id: lojaId, status: 'ativo' } })) return res.status(400).json({ success: false, error: 'INVALID_STORE', message: 'Selecione uma loja ativa para o usuário.' });
  const temporaryPassword = `TmpA1${randomBytes(12).toString('hex')}`;
  try { await sendTemporaryAccessEmail({ nome: fields.nome, email, temporaryPassword }); }
  catch (error) { const mapped = mailError(error); if (error.code !== 'SMTP_NOT_CONFIGURED') console.error('Falha no SMTP:', error.code || 'UNKNOWN', error.responseCode || ''); return res.status(mapped.status).json({ success: false, error: error.code || 'EMAIL_DELIVERY_FAILED', message: mapped.message }); }
  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.usuario.create({ data: { ...fields, email, lojaId, senhaHash: await bcrypt.hash(temporaryPassword, 10), firstAccess: true } });
    if (['SELLER', 'MANAGER'].includes(fields.perfil)) await tx.vendedor.create({ data: { nome: fields.nome, email, telefone: fields.telefone, cargo: fields.perfil === 'MANAGER' ? 'Gerente' : 'Vendedor', status: fields.status, usuarioId: createdUser.id, lojaId } });
    return tx.usuario.findUnique({ where: { id: createdUser.id }, include: { vendedores: { take: 1 }, loja: true } });
  });
  return created(res, { ...userResponse(user), emailSent: true }, 'Usuário criado. As instruções de acesso foram enviadas por e-mail.');
};

export const updateUser = async (req, res) => {
  const id = Number(req.params.id);
  const current = await prisma.usuario.findUnique({ where: { id }, include: { vendedores: { take: 1 }, loja: true } });
  if (!current) return res.status(404).json({ success: false, message: 'Usuário não encontrado', error: 'NOT_FOUND' });
  const fields = profileFields({ ...current, ...req.body });
  if (!fields.nome) return res.status(400).json({ success: false, message: 'Nome é obrigatório', error: 'BAD_REQUEST' });
  if (!roles.includes(fields.perfil)) return res.status(400).json({ success: false, message: 'Perfil inválido', error: 'BAD_REQUEST' });
  const lojaId = Number(req.body.lojaId || current.lojaId);
  if (!await prisma.loja.findFirst({ where: { id: lojaId, status: 'ativo' } })) return res.status(400).json({ success: false, error: 'INVALID_STORE', message: 'Selecione uma loja ativa para o usuário.' });
  const temporaryPassword = `TmpA1${randomBytes(12).toString('hex')}`;
  try { await sendTemporaryAccessEmail({ nome: fields.nome, email: current.email, temporaryPassword }); }
  catch (error) { const mapped = mailError(error); if (error.code !== 'SMTP_NOT_CONFIGURED') console.error('Falha no SMTP:', error.code || 'UNKNOWN', error.responseCode || ''); return res.status(mapped.status).json({ success: false, error: error.code || 'EMAIL_DELIVERY_FAILED', message: mapped.message }); }
  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.usuario.update({ where: { id }, data: { ...fields, email: current.email, lojaId, senhaHash: await bcrypt.hash(temporaryPassword, 10), firstAccess: true, updatedAt: new Date() } });
    const seller = await tx.vendedor.findFirst({ where: { usuarioId: id } });
    if (seller) await tx.vendedor.update({ where: { id: seller.id }, data: { nome: fields.nome, telefone: fields.telefone, status: fields.status, lojaId, cargo: fields.perfil === 'MANAGER' ? 'Gerente' : fields.perfil === 'SELLER' ? 'Vendedor' : seller.cargo } });
    else if (['SELLER', 'MANAGER'].includes(fields.perfil)) await tx.vendedor.create({ data: { nome: fields.nome, email: current.email, telefone: fields.telefone, cargo: fields.perfil === 'MANAGER' ? 'Gerente' : 'Vendedor', status: fields.status, usuarioId: id, lojaId } });
    return tx.usuario.findUnique({ where: { id: updated.id }, include: { vendedores: { take: 1 }, loja: true } });
  });
  return ok(res, { ...userResponse(user), emailSent: true }, 'Usuário atualizado. As instruções de acesso foram enviadas por e-mail.');
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
