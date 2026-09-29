import { prisma } from '../config/database.js';
import { created, notFound, ok } from '../utils/response.js';
import { ensureContractAndCommissions } from '../services/commissionService.js';

const roleOf = (user) => String(user?.perfil || user?.role || '').toUpperCase();
const contractInclude = { cliente: true, vendedor: true, proposta: true };
const contractScope = async (user) => {
  const role = roleOf(user);
  if (['ADMIN', 'SUPPORT'].includes(role)) return {};
  const seller = await prisma.vendedor.findFirst({ where: { usuarioId: Number(user.id) } });
  if (role === 'MANAGER') return { OR: [{ vendedorId: seller?.id ?? -1 }, { vendedor: { usuario: { gerenteId: Number(user.id) } } }] };
  return { vendedorId: seller?.id ?? -1 };
};
const present = (item) => ({ ...item, valorTotal: Number(item.valorTotal || 0) });

export const listContratos = async (req, res) => {
  const where = await contractScope(req.user);
  const rows = await prisma.contrato.findMany({ where: { deletedAt: null, ...where }, include: contractInclude, orderBy: { createdAt: 'desc' } });
  return ok(res, rows.map(present), 'Contratos carregados com sucesso');
};

export const getContratoById = async (req, res) => {
  const where = await contractScope(req.user);
  const row = await prisma.contrato.findFirst({ where: { id: Number(req.params.id), deletedAt: null, ...where }, include: contractInclude });
  if (!row) return notFound(res, 'Contrato não encontrado');
  return ok(res, present(row), 'Contrato encontrado');
};

export const createContrato = async (req, res) => {
  const proposalId = Number(req.body.propostaId);
  const proposal = await prisma.proposta.findUnique({ where: { id: proposalId }, include: { contrato: true } });
  if (!proposal) return notFound(res, 'Proposta informada não existe');
  if (proposal.contrato) return res.status(409).json({ success: false, error: 'CONTRACT_EXISTS', message: 'Já existe um contrato para esta proposta.' });
  if (proposal.status !== 'CONTRACT_EFFECTIVE') return res.status(409).json({ success: false, error: 'PROPOSAL_NOT_APPROVED', message: 'Somente uma proposta aprovada pode gerar contrato.' });
  const contract = await prisma.$transaction(async (tx) => ensureContractAndCommissions(tx, proposalId));
  const row = await prisma.contrato.findUnique({ where: { id: contract.id }, include: contractInclude });
  return created(res, present(row), 'Contrato e comissões registrados com sucesso');
};

export const updateStatusContrato = async (req, res) => {
  const id = Number(req.params.id);
  const where = await contractScope(req.user);
  const existing = await prisma.contrato.findFirst({ where: { id, deletedAt: null, ...where } });
  if (!existing) return notFound(res, 'Contrato não encontrado');
  const allowed = ['ativo', 'inativo', 'cancelado', 'efetivado'];
  const status = String(req.body.status || '').trim().toLowerCase();
  if (!allowed.includes(status)) return res.status(400).json({ success: false, error: 'INVALID_STATUS', message: 'Status de contrato inválido.' });
  const row = await prisma.contrato.update({ where: { id }, data: { status, updatedAt: new Date() }, include: contractInclude });
  return ok(res, present(row), 'Status do contrato atualizado com sucesso');
};
