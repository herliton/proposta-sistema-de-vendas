import { prisma } from '../config/database.js';
import { created, notFound, ok } from '../utils/response.js';

export const listVendedores = async (_req, res) => {
  const rows = await prisma.vendedor.findMany({ orderBy: { nome: 'asc' } });
  return ok(res, rows, 'Vendedores carregados com sucesso');
};

export const getVendedorById = async (req, res) => {
  const row = await prisma.vendedor.findUnique({ where: { id: Number(req.params.id) } });
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
  const existing = await prisma.vendedor.findUnique({ where: { id } });
  if (!existing) return notFound(res, 'Vendedor não encontrado');
  const data = {};
  for (const key of ['nome', 'telefone', 'cargo', 'equipe', 'status']) if (req.body[key] !== undefined) data[key] = req.body[key];
  if (req.body.email !== undefined) {
    const email = String(req.body.email).trim().toLowerCase();
    const conflict = await prisma.vendedor.findFirst({ where: { email, id: { not: id } } });
    if (conflict) return res.status(409).json({ success: false, error: 'EMAIL_EXISTS', message: 'Já existe um vendedor com este e-mail.' });
    data.email = email;
  }
  const row = await prisma.vendedor.update({ where: { id }, data });
  return ok(res, row, 'Vendedor atualizado com sucesso');
};

export const deleteVendedor = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.vendedor.findUnique({ where: { id } });
  if (!existing) return notFound(res, 'Vendedor não encontrado');
  await prisma.vendedor.update({ where: { id }, data: { status: 'inativo' } });
  return ok(res, null, 'Vendedor inativado; o histórico comercial foi preservado.');
};
