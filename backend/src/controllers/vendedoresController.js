import { prisma } from '../config/database.js';
import { normalizeRole } from './permissionsController.js';
import { created, notFound, ok } from '../utils/response.js';
import { storeScope } from '../utils/storeScope.js';

const vendedorScope = (user) => {
  const role = normalizeRole(user?.perfil || user?.role);
  const store = storeScope(user);
  if (role === 'MANAGER') return { AND: [store, { usuario: { gerenteId: Number(user.id) } }] };
  if (role === 'SELLER') return { AND: [store, { usuarioId: Number(user.id) }] };
  return store;
};

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
  if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Informe nome e e-mail válido.' });
  const duplicate = await prisma.vendedor.findUnique({ where: { email } });
  if (duplicate) return res.status(409).json({ success: false, error: 'EMAIL_EXISTS', message: 'Já existe um vendedor com este e-mail.' });
  const row = await prisma.vendedor.create({ data: { nome, email, telefone: req.body.telefone || null, cargo: req.body.cargo || null, equipe: req.body.equipe || null, status: req.body.status || 'ativo', usuarioId: req.body.usuarioId ? Number(req.body.usuarioId) : null } });
  return created(res, row, 'Vendedor criado com sucesso');
};

export const updateVendedor = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.vendedor.findFirst({
    where: { AND: [vendedorScope(req.user), { id }] },
  });
  if (!existing) return notFound(res, 'Vendedor não encontrado');
  const data = {};
  if (req.body.status !== undefined && !['ativo', 'inativo'].includes(req.body.status)) {
    return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'O status deve ser ativo ou inativo.' });
  }
  for (const key of ['nome', 'telefone', 'cargo', 'equipe', 'status']) if (req.body[key] !== undefined) data[key] = req.body[key];
  if (req.body.email !== undefined) {
    const email = String(req.body.email).trim().toLowerCase();
    const conflict = await prisma.vendedor.findFirst({ where: { email, id: { not: id } } });
    if (conflict) return res.status(409).json({ success: false, error: 'EMAIL_EXISTS', message: 'Já existe um vendedor com este e-mail.' });
    data.email = email;
  }
  const row = await prisma.$transaction(async (tx) => {
    const updated = await tx.vendedor.update({ where: { id }, data });
    if (data.status && existing.usuarioId) {
      await tx.usuario.update({ where: { id: existing.usuarioId }, data: { status: data.status } });
    }
    return updated;
  });
  return ok(res, row, 'Vendedor atualizado com sucesso');
};

export const deleteVendedor = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.vendedor.findFirst({
    where: { AND: [vendedorScope(req.user), { id }] },
  });
  if (!existing) return notFound(res, 'Vendedor não encontrado');
  await prisma.$transaction(async (tx) => {
    await tx.vendedor.update({ where: { id }, data: { status: 'inativo' } });
    if (existing.usuarioId) {
      await tx.usuario.update({ where: { id: existing.usuarioId }, data: { status: 'inativo' } });
    }
  });
  return ok(res, null, 'Vendedor inativado; o histórico comercial foi preservado.');
};
