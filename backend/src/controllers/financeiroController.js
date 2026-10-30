import { prisma } from '../config/database.js';
import { created, notFound, ok } from '../utils/response.js';

const roleOf = (user) => String(user?.perfil || user?.role || '').toUpperCase();
const scopeWhere = async (user) => {
  const role = roleOf(user);
  if (['ADMIN', 'SUPPORT'].includes(role)) return {};
  const seller = await prisma.vendedor.findFirst({ where: { usuarioId: Number(user.id) } });
  if (role === 'MANAGER') return { contrato: { OR: [{ vendedorId: seller?.id ?? -1 }, { vendedor: { usuario: { gerenteId: Number(user.id) } } }] } };
  return { contrato: { vendedorId: seller?.id ?? -1 } };
};
const present = (row) => ({ ...row, valor: Number(row.valor), contrato: row.contrato ? { ...row.contrato, valorTotal: Number(row.contrato.valorTotal) } : null });

export const listFinanceiro = async (req, res) => {
  const scope = await scopeWhere(req.user);
  const rows = await prisma.financeiro.findMany({ where: scope, include: { contrato: true }, orderBy: { createdAt: 'desc' } });
  return ok(res, rows.map(present), 'Financeiro carregado com sucesso');
};

export const getFinanceiroById = async (req, res) => {
  const scope = await scopeWhere(req.user);
  const row = await prisma.financeiro.findFirst({ where: { id: Number(req.params.id), ...scope }, include: { contrato: true } });
  if (!row) return notFound(res, 'Registro financeiro não encontrado');
  return ok(res, present(row), 'Registro financeiro encontrado');
};

export const createFinanceiro = async (req, res) => {
  const contratoId = Number(req.body.contratoId);
  const valor = Number(req.body.valor);
  if (!Number.isInteger(contratoId) || !Number.isFinite(valor) || valor <= 0 || !String(req.body.tipo || '').trim()) return res.status(400).json({ success: false, error: 'INVALID_FINANCIAL_ENTRY', message: 'Informe contrato, tipo e valor positivo.' });
  const scope = await scopeWhere(req.user);
  const contract = await prisma.contrato.findFirst({ where: { id: contratoId, ...Object.fromEntries(Object.entries(scope).map(([key, value]) => [key.replace('contrato.', ''), value])) } });
  if (!contract) return notFound(res, 'Contrato não encontrado');
  const row = await prisma.financeiro.create({ data: { contratoId, tipo: String(req.body.tipo).trim(), valor, status: 'pendente', dataVencimento: req.body.dataVencimento ? new Date(req.body.dataVencimento) : null, observacoes: String(req.body.observacoes || '').trim() || null }, include: { contrato: true } });
  return created(res, present(row), 'Registro financeiro criado com sucesso');
};

export const updateFinanceiro = async (req, res) => {
  const id = Number(req.params.id);
  const scope = await scopeWhere(req.user);
  const existing = await prisma.financeiro.findFirst({ where: { id, ...scope } });
  if (!existing) return notFound(res, 'Registro financeiro não encontrado');
  const data = {};
  if (req.body.tipo !== undefined) data.tipo = String(req.body.tipo).trim();
  if (req.body.valor !== undefined) { const amount = Number(req.body.valor); if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, error: 'INVALID_AMOUNT', message: 'Informe um valor positivo.' }); data.valor = amount; }
  if (req.body.dataVencimento !== undefined) data.dataVencimento = req.body.dataVencimento ? new Date(req.body.dataVencimento) : null;
  if (req.body.observacoes !== undefined) data.observacoes = String(req.body.observacoes || '').trim() || null;
  const row = await prisma.financeiro.update({ where: { id }, data, include: { contrato: true } });
  return ok(res, present(row), 'Registro financeiro atualizado com sucesso');
};

export const updateStatusFinanceiro = async (req, res) => {
  const id = Number(req.params.id);
  const status = String(req.body.status || '').trim().toLowerCase();
  if (!['pendente', 'pago', 'cancelado', 'atrasado'].includes(status)) return res.status(400).json({ success: false, error: 'INVALID_STATUS', message: 'Status financeiro inválido.' });
  const scope = await scopeWhere(req.user);
  const existing = await prisma.financeiro.findFirst({ where: { id, ...scope } });
  if (!existing) return notFound(res, 'Registro financeiro não encontrado');
  const row = await prisma.financeiro.update({ where: { id }, data: { status }, include: { contrato: true } });
  return ok(res, present(row), 'Status do financeiro atualizado com sucesso');
};
