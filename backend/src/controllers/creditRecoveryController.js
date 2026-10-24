import { prisma } from '../config/database.js';
import { created, notFound, ok } from '../utils/response.js';

import { storeScope, writeStoreId } from '../utils/storeScope.js';

const roleOf = (user) => String(user?.perfil || user?.role || '').toUpperCase();
const userId = (user) => Number(user?.id);
const sellerForUser = async (user) => prisma.vendedor.findFirst({ where: { usuarioId: userId(user) } });
const scopeFor = async (user) => {
  const role = roleOf(user);
  if (['ADMIN', 'SUPPORT'].includes(role)) return storeScope(user);
  if (role === 'MANAGER') return { AND: [{ OR: [{ responsavelId: userId(user) }, { responsavel: { gerenteId: userId(user) } }] }, storeScope(user)] };
  return { responsavelId: userId(user), ...storeScope(user) };
};
const include = { cliente: { select: { id: true, nome: true, telefone: true, email: true } }, proposta: { include: { veiculo: { select: { marca: true, modelo: true } } } }, responsavel: { select: { id: true, nome: true } } };
const validTypes = ['REANALISE_CREDITO', 'TROCA_VEICULO', 'AUMENTO_ENTRADA', 'CONSORCIO', 'OUTRO'];
const validStatuses = ['ABERTA', 'EM_CONTATO', 'EM_NEGOCIACAO', 'CONVERTIDA', 'SEM_INTERESSE'];
const parseDate = (value) => value ? new Date(`${value}T12:00:00.000Z`) : null;

export const listCreditOpportunities = async (req, res) => {
  const status = String(req.query.status || '').toUpperCase();
  const rows = await prisma.oportunidadeCredito.findMany({ where: { ...await scopeFor(req.user), ...(validStatuses.includes(status) ? { status } : {}) }, include, orderBy: [{ proximoContatoEm: 'asc' }, { updatedAt: 'desc' }] });
  return ok(res, rows, 'Oportunidades de recuperação carregadas.');
};

export const createCreditOpportunity = async (req, res) => {
  const clienteId = Number(req.body.clienteId);
  const tipo = String(req.body.tipo || 'REANALISE_CREDITO').toUpperCase();
  if (!Number.isInteger(clienteId) || !validTypes.includes(tipo)) return res.status(400).json({ success: false, error: 'INVALID_OPPORTUNITY', message: 'Informe um cliente e uma modalidade válidos.' });
  const cliente = await prisma.cliente.findFirst({ where: { id: clienteId, deletedAt: null, ...storeScope(req.user) } });
  if (!cliente) return notFound(res, 'Cliente não encontrado.');
  const role = roleOf(req.user);
  if (!['ADMIN', 'SUPPORT'].includes(role)) {
    const scope = role === 'MANAGER' ? { OR: [{ gerenteId: userId(req.user) }, { vendedor: { usuario: { gerenteId: userId(req.user) } } }] } : { vendedorId: (await sellerForUser(req.user))?.id ?? -1 };
    if (!await prisma.cliente.findFirst({ where: { id: clienteId, ...scope } })) return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Este cliente não pertence à sua carteira.' });
  }
  const lojaId = writeStoreId(req.user, req.body.lojaId) || cliente.lojaId;
  const propostaId = req.body.propostaId ? Number(req.body.propostaId) : null;
  let responsavelId = userId(req.user);
  if (propostaId) {
    const proposal = await prisma.proposta.findFirst({ where: { id: propostaId, clienteId }, include: { vendedor: { include: { usuario: true } } } });
    if (!proposal) return res.status(400).json({ success: false, error: 'INVALID_PROPOSAL', message: 'A proposta informada não corresponde ao cliente.' });
    responsavelId = proposal.vendedor.usuarioId || responsavelId;
  }
  const row = await prisma.oportunidadeCredito.create({ data: { clienteId, lojaId, propostaId, responsavelId, tipo, motivo: String(req.body.motivo || '').trim() || null, proximoContatoEm: parseDate(req.body.proximoContatoEm), observacoes: String(req.body.observacoes || '').trim() || null }, include });
  return created(res, row, 'Oportunidade registrada.');
};

export const updateCreditOpportunity = async (req, res) => {
  const id = Number(req.params.id);
  const row = await prisma.oportunidadeCredito.findFirst({ where: { id, ...await scopeFor(req.user) } });
  if (!row) return notFound(res, 'Oportunidade não encontrada.');
  const status = String(req.body.status || row.status).toUpperCase();
  const tipo = String(req.body.tipo || row.tipo).toUpperCase();
  if (!validStatuses.includes(status) || !validTypes.includes(tipo)) return res.status(400).json({ success: false, error: 'INVALID_OPPORTUNITY', message: 'Status ou modalidade inválidos.' });
  const updated = await prisma.oportunidadeCredito.update({ where: { id }, data: { status, tipo, motivo: req.body.motivo === undefined ? row.motivo : String(req.body.motivo).trim() || null, observacoes: req.body.observacoes === undefined ? row.observacoes : String(req.body.observacoes).trim() || null, proximoContatoEm: req.body.proximoContatoEm === undefined ? row.proximoContatoEm : parseDate(req.body.proximoContatoEm), encerradaEm: ['CONVERTIDA', 'SEM_INTERESSE'].includes(status) ? new Date() : null }, include });
  return ok(res, updated, 'Oportunidade atualizada.');
};

export const registerCreditConsultancy = async (req, res) => {
  const proposalId = Number(req.params.id);
  const valor = Number(req.body.valorConsultoria);
  if (!Number.isInteger(proposalId) || !Number.isFinite(valor) || valor <= 0) return res.status(400).json({ success: false, error: 'INVALID_CONSULTANCY', message: 'Informe uma proposta válida e um valor de consultoria maior que zero.' });
  const proposal = await prisma.proposta.findUnique({ where: { id: proposalId, ...storeScope(req.user) }, include: { contrato: true, cliente: true, vendedor: { include: { usuario: true } } } });
  if (!proposal) return notFound(res, 'Proposta não encontrada.');
  const role = roleOf(req.user);
  if (!['ADMIN', 'SUPPORT'].includes(role)) {
    const seller = await sellerForUser(req.user);
    const where = role === 'MANAGER' ? { OR: [{ vendedorId: seller?.id ?? -1 }, { vendedor: { usuario: { gerenteId: userId(req.user) } } }] } : { vendedorId: seller?.id ?? -1 };
    if (!await prisma.proposta.findFirst({ where: { id: proposalId, ...where } })) return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Esta proposta não pertence à sua carteira ou equipe.' });
  }
  if (proposal.status !== 'CREDIT_REJECTED') return res.status(409).json({ success: false, error: 'PROPOSAL_NOT_REJECTED', message: 'A consultoria de recuperação deve partir de uma proposta com crédito recusado.' });
  if (proposal.contrato) return res.status(409).json({ success: false, error: 'CONTRACT_EXISTS', message: 'Esta proposta já possui contrato vinculado.' });
  const rulesRecord = await prisma.configuracao.findUnique({ where: { chave: 'commissionRules' } });
  const rules = rulesRecord?.valor || {};
  const sellerPercent = Number(rules.sellerPercent ?? 1.5);
  const managerPercent = Number(rules.managerPercent ?? 0.5);
  const sellerUserId = proposal.vendedor.usuarioId;
  const managerUserId = proposal.vendedor.usuario?.gerenteId || null;
  const contract = await prisma.$transaction(async (tx) => {
    const createdContract = await tx.contrato.create({ data: { propostaId: proposal.id, clienteId: proposal.clienteId, vendedorId: proposal.vendedorId, lojaId: proposal.lojaId, tipo: 'CREDIT_CONSULTANCY', valorTotal: valor, status: 'ativo', dataAssinatura: new Date() } });
    const ledger = [{ propostaId: proposal.id, vendedorId: proposal.vendedorId, usuarioId: sellerUserId, tipo: 'CONSULTORIA_CREDITO_VENDEDOR', valor: valor * sellerPercent / 100 }];
    if (managerUserId && managerUserId !== sellerUserId) ledger.push({ propostaId: proposal.id, vendedorId: proposal.vendedorId, usuarioId: managerUserId, tipo: 'CONSULTORIA_CREDITO_GERENTE', valor: valor * managerPercent / 100 });
    await tx.comissao.createMany({ data: ledger });
    await tx.oportunidadeCredito.updateMany({ where: { propostaId: proposal.id }, data: { status: 'CONVERTIDA', encerradaEm: new Date() } });
    await tx.auditLog.create({ data: { actorId: userId(req.user), action: 'CREDIT_CONSULTANCY_CONTRACT_CREATED', details: { contratoId: createdContract.id, propostaId: proposal.id, valor } } });
    return createdContract;
  });
  return created(res, contract, 'Contrato de consultoria de crédito efetivado com comissões registradas.');
};
