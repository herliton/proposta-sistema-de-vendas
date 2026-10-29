import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { prisma } from '../config/database.js';
import { normalizeRole } from './permissionsController.js';
import { created, notFound, ok } from '../utils/response.js';
import { storeScope } from '../utils/storeScope.js';
import { sendTemporaryAccessEmail } from '../utils/email.js';

const vendedorScope = (user) => {
  const role = normalizeRole(user?.perfil || user?.role);
  const store = storeScope(user);
  if (role === 'MANAGER') return { AND: [store, { usuario: { gerenteId: Number(user.id) } }] };
  if (role === 'SELLER') return { AND: [store, { usuarioId: Number(user.id) }] };
  return store;
};

const canManageTeam = (user) => ['ADMIN', 'MANAGER'].includes(normalizeRole(user?.perfil || user?.role));

export const listVendedores = async (req, res) => {
  const rows = await prisma.vendedor.findMany({
    where: vendedorScope(req.user),
    include: { usuario: { select: { id: true, status: true, gerenteId: true } } },
    orderBy: { nome: 'asc' },
  });
  return ok(res, rows, 'Vendedores carregados com sucesso');
};

export const getVendedorById = async (req, res) => {
  const row = await prisma.vendedor.findFirst({
    where: { AND: [vendedorScope(req.user), { id: Number(req.params.id) }] },
  });
  if (!row) return notFound(res, 'Vendedor não encontrado');
  return ok(res, row, 'Vendedor encontrado');
};

export const createVendedor = async (req, res) => {
  const nome = String(req.body.nome || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const telefone = String(req.body.telefone || '').trim() || null;
  const role = normalizeRole(req.user?.perfil || req.user?.role);
  if (!canManageTeam(req.user)) return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Somente administradores e gerentes podem cadastrar vendedores.' });
  if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Informe nome e e-mail válido.' });
  if (telefone && telefone.replace(/\D/g, '').length < 10) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Informe um telefone válido com DDD.' });

  const [existingUser, existingSeller] = await Promise.all([
    prisma.usuario.findUnique({ where: { email }, select: { id: true } }),
    prisma.vendedor.findUnique({ where: { email }, select: { id: true } }),
  ]);
  if (existingUser || existingSeller) return res.status(409).json({ success: false, error: 'EMAIL_EXISTS', message: 'Este e-mail já está em uso.' });

  let gerenteId = null;
  let lojaId = Number(req.user?.lojaId) || 1;
  if (role === 'MANAGER') {
    gerenteId = Number(req.user.id);
    const manager = await prisma.usuario.findFirst({
      where: { id: gerenteId, perfil: 'MANAGER', status: 'ativo' },
      select: { id: true, nome: true, lojaId: true },
    });
    if (!manager) return res.status(403).json({ success: false, error: 'INACTIVE_MANAGER', message: 'A conta de gerente está inativa ou não foi encontrada.' });
    lojaId = manager.lojaId;
  } else if (req.body.lojaId !== undefined) {
    lojaId = Number(req.body.lojaId);
  }

  if (!Number.isInteger(lojaId) || !await prisma.loja.findFirst({ where: { id: lojaId, status: 'ativo' }, select: { id: true } })) {
    return res.status(400).json({ success: false, error: 'INVALID_STORE', message: 'Selecione uma loja ativa para o vendedor.' });
  }

  if (role === 'ADMIN' && req.body.gerenteId !== undefined && req.body.gerenteId !== null && req.body.gerenteId !== '') {
    gerenteId = Number(req.body.gerenteId);
    if (!Number.isInteger(gerenteId) || !await prisma.usuario.findFirst({
      where: { id: gerenteId, perfil: 'MANAGER', status: 'ativo', lojaId },
      select: { id: true },
    })) return res.status(400).json({ success: false, error: 'INVALID_MANAGER', message: 'Selecione um gerente ativo da mesma loja.' });
  }

  const temporaryPassword = `TmpA1${randomBytes(12).toString('hex')}`;
  try {
    await sendTemporaryAccessEmail({ nome, email, temporaryPassword });
  } catch (error) {
    const message = error.code === 'SMTP_NOT_CONFIGURED'
      ? error.message
      : error.code === 'EAUTH'
        ? 'O servidor SMTP recusou a autenticação. Confira as configurações de e-mail.'
        : error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION'
          ? 'Não foi possível conectar ao servidor SMTP.'
          : 'Não foi possível enviar as instruções de acesso. Nenhum cadastro foi criado.';
    if (error.code !== 'SMTP_NOT_CONFIGURED') console.error('Falha ao enviar acesso do vendedor:', error.code || 'UNKNOWN', error.responseCode || '');
    return res.status(error.code === 'SMTP_NOT_CONFIGURED' ? 503 : 502).json({ success: false, error: error.code || 'EMAIL_DELIVERY_FAILED', message });
  }

  try {
    const seller = await prisma.$transaction(async (tx) => {
      let team = gerenteId ? await tx.equipe.findFirst({
        where: { gerenteId, lojaId, status: 'ativo', deletedAt: null },
        select: { id: true },
      }) : null;
      if (team) {
        await tx.$queryRaw`SELECT id FROM Equipe WHERE id = ${team.id} FOR UPDATE`;
        team = await tx.equipe.findFirst({ where: { id: team.id, status: 'ativo', deletedAt: null }, select: { id: true } });
      }
      const user = await tx.usuario.create({
        data: {
          nome,
          email,
          telefone,
          perfil: 'SELLER',
          status: 'ativo',
          firstAccess: true,
          senhaHash: await bcrypt.hash(temporaryPassword, 10),
          gerenteId,
          equipeId: team?.id || null,
          lojaId,
        },
      });
      const createdSeller = await tx.vendedor.create({
        data: { nome, email, telefone, cargo: 'Vendedor', equipe: null, status: 'ativo', usuarioId: user.id, lojaId },
        include: { usuario: { select: { id: true, status: true, gerenteId: true } } },
      });
      if (team) {
        const now = new Date();
        await tx.$executeRaw`
          INSERT INTO EquipeVinculo (vendedorId, equipeId, iniciadoEm, atribuidoPorId, createdAt)
          VALUES (${user.id}, ${team.id}, ${now}, ${Number(req.user.id)}, ${now})
        `;
      }
      await tx.auditLog.create({
        data: { actorId: Number(req.user.id), action: 'TEAM_SELLER_CREATED', details: { vendedorId: createdSeller.id, usuarioId: user.id, lojaId } },
      });
      return createdSeller;
    });
    return created(res, { ...seller, emailSent: true }, 'Vendedor cadastrado. As instruções de acesso foram enviadas por e-mail.');
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ success: false, error: 'EMAIL_EXISTS', message: 'Este e-mail já está em uso.' });
    throw error;
  }
};

export const updateVendedor = async (req, res) => {
  const id = Number(req.params.id);
  if (!canManageTeam(req.user)) return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Somente administradores e gerentes podem atualizar vendedores.' });
  const existing = await prisma.vendedor.findFirst({
    where: { AND: [vendedorScope(req.user), { id }] },
    include: { usuario: { select: { id: true, nome: true, email: true, telefone: true, status: true } } },
  });
  if (!existing) return notFound(res, 'Vendedor não encontrado');
  const data = {};
  if (req.body.status !== undefined && !['ativo', 'inativo'].includes(req.body.status)) {
    return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'O status deve ser ativo ou inativo.' });
  }
  if (req.body.nome !== undefined) {
    data.nome = String(req.body.nome).trim();
    if (!data.nome) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'O nome do vendedor é obrigatório.' });
  }
  if (req.body.telefone !== undefined) {
    data.telefone = String(req.body.telefone).trim() || null;
    if (data.telefone && data.telefone.replace(/\D/g, '').length < 10) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Informe um telefone válido com DDD.' });
  }
  for (const key of ['cargo', 'equipe', 'status']) if (req.body[key] !== undefined) data[key] = req.body[key];
  if (req.body.email !== undefined) {
    const email = String(req.body.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Informe um e-mail válido.' });
    const [conflict, userConflict] = await Promise.all([
      prisma.vendedor.findFirst({ where: { email, id: { not: id } }, select: { id: true } }),
      existing.usuarioId
        ? prisma.usuario.findFirst({ where: { email, id: { not: existing.usuarioId } }, select: { id: true } })
        : prisma.usuario.findFirst({ where: { email }, select: { id: true } }),
    ]);
    if (conflict || userConflict) return res.status(409).json({ success: false, error: 'EMAIL_EXISTS', message: 'Este e-mail já está em uso.' });
    data.email = email;
  }
  try {
    const row = await prisma.$transaction(async (tx) => {
      const updated = await tx.vendedor.update({ where: { id }, data });
      if (existing.usuarioId) {
        const userData = {
          ...(data.nome !== undefined ? { nome: data.nome } : {}),
          ...(data.email !== undefined ? { email: data.email } : {}),
          ...(data.telefone !== undefined ? { telefone: data.telefone } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
        };
        if (Object.keys(userData).length) await tx.usuario.update({ where: { id: existing.usuarioId }, data: userData });
      }
      if (data.status && (data.status !== existing.status || data.status !== existing.usuario?.status)) {
        await tx.auditLog.create({
          data: { actorId: Number(req.user.id), action: 'TEAM_SELLER_STATUS_CHANGED', details: { vendedorId: id, before: { vendedor: existing.status, usuario: existing.usuario?.status || null }, after: data.status } },
        });
      }
      return updated;
    });
    return ok(res, row, 'Vendedor atualizado com sucesso');
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ success: false, error: 'EMAIL_EXISTS', message: 'Este e-mail já está em uso.' });
    throw error;
  }
};

export const deleteVendedor = async (req, res) => {
  const id = Number(req.params.id);
  if (!canManageTeam(req.user)) return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Somente administradores e gerentes podem inativar vendedores.' });
  const existing = await prisma.vendedor.findFirst({
    where: { AND: [vendedorScope(req.user), { id }] },
  });
  if (!existing) return notFound(res, 'Vendedor não encontrado');
  await prisma.$transaction(async (tx) => {
    await tx.vendedor.update({ where: { id }, data: { status: 'inativo' } });
    if (existing.usuarioId) {
      await tx.usuario.update({ where: { id: existing.usuarioId }, data: { status: 'inativo' } });
    }
    await tx.auditLog.create({
      data: { actorId: Number(req.user.id), action: 'TEAM_SELLER_STATUS_CHANGED', details: { vendedorId: id, before: existing.status, after: 'inativo' } },
    });
  });
  return ok(res, null, 'Vendedor inativado; o histórico comercial foi preservado.');
};
