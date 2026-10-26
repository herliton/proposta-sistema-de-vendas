import { ensureFichaFromRejection } from './fichaRecuperacaoController.js';
import { prisma } from '../config/database.js';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'node:url';
import { created, notFound, ok } from '../utils/response.js';
import { ensureContractAndCommissions } from '../services/commissionService.js';
import { getProposalSettings } from '../utils/proposalSettings.js';
import { storeScope } from '../utils/storeScope.js';

const rolesWithGlobalView = ['ADMIN', 'SUPPORT'];
const activeStatuses = ['pendente', 'em análise', 'em analise', 'aguardando', 'simulation', 'proposal', 'simulacao', 'proposta'];
const roleAliases = { ADMINISTRADOR: 'ADMIN', GERENTE: 'MANAGER', VENDEDOR: 'SELLER', SUPORTE: 'SUPPORT' };
const roleOf = (user) => {
  const role = String(user?.perfil || user?.role || '').trim().toUpperCase();
  return roleAliases[role] || role;
};
const proposalInclude = { cliente: true, vendedor: { include: { usuario: { select: { id: true, nome: true } } } }, veiculo: true, beneficios: { select: { id: true, beneficioId: true, nome: true, descricao: true }, orderBy: { id: 'asc' } } };
const presentProposal = (proposal) => ({ ...proposal, valorProposta: Number(proposal.valorProposta), entrada: Number(proposal.entrada || 0), taxaJuros: Number(proposal.taxaJuros || 0), valorParcela: Number(proposal.valorParcela || 0), totalFinanciado: Number(proposal.totalFinanciado || 0), vendedor: proposal.vendedor ? { ...proposal.vendedor, nome: proposal.vendedor.usuario?.nome || proposal.vendedor.nome } : null, veiculo: proposal.veiculo ? { ...proposal.veiculo, precoSugerido: Number(proposal.veiculo.precoSugerido || 0), precoMinimo: Number(proposal.veiculo.precoMinimo || 0), valorFipe: Number(proposal.veiculo.valorFipe || 0), fotos: { right: proposal.veiculo.fotoDireita || '', left: proposal.veiculo.fotoEsquerda || '', front: proposal.veiculo.fotoFrente || '', rear: proposal.veiculo.fotoTraseira || '', interior: proposal.veiculo.fotoInterior || '' } } : null });
const sellerForUser = (id) => prisma.vendedor.findFirst({ where: { usuarioId: Number(id), status: 'ativo', usuario: { status: 'ativo' } } });
const visibleWhere = async (user) => {
  const role = roleOf(user);
  if (rolesWithGlobalView.includes(role)) return { deletedAt: null, ...storeScope(user) };
  const seller = await sellerForUser(user.id);
  if (role === 'MANAGER') return { AND: [{ deletedAt: null }, { OR: [{ vendedorId: seller?.id ?? -1 }, { vendedor: { usuario: { gerenteId: Number(user.id) } } }] }, storeScope(user)] };
  return { deletedAt: null, vendedorId: seller?.id ?? -1, ...storeScope(user) };
};

export const listPropostas = async (req, res) => {
  const baseWhere = await visibleWhere(req.user);
  const search = String(req.query.search || req.query.q || '').trim();
  if (search.length > 191) return res.status(400).json({ success: false, error: 'SEARCH_TOO_LONG', message: 'A busca deve ter no máximo 191 caracteres.' });
  const status = String(req.query.status || '').trim();
  const customerId = req.query.clienteId === undefined ? undefined : Number(req.query.clienteId);
  const vehicleId = req.query.veiculoId === undefined ? undefined : Number(req.query.veiculoId);
  const sellerId = req.query.vendedorId === undefined ? undefined : Number(req.query.vendedorId);
  const startDateValue = String(req.query.startDate || '');
  const endDateValue = String(req.query.endDate || '');
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
  if ([customerId, vehicleId, sellerId].some((id) => id !== undefined && (!Number.isSafeInteger(id) || id < 1))) return res.status(400).json({ success: false, error: 'INVALID_FILTER', message: 'Um identificador de filtro é inválido.' });
  if (status && ![...activeStatuses, 'CREDIT_REJECTED', 'CONTRACT_EFFECTIVE', 'CANCELLED', 'REJECTED'].includes(status)) return res.status(400).json({ success: false, error: 'INVALID_STATUS', message: 'O status do filtro é inválido.' });
  if (Boolean(startDateValue) !== Boolean(endDateValue) || startDateValue && (!dateOnly.test(startDateValue) || !dateOnly.test(endDateValue))) return res.status(400).json({ success: false, error: 'INVALID_DATE_RANGE', message: 'Informe início e fim do período no formato AAAA-MM-DD.' });
  let dateFilter;
  if (startDateValue) {
    const start = new Date(`${startDateValue}T00:00:00.000Z`);
    const end = new Date(`${endDateValue}T23:59:59.999Z`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start.toISOString().slice(0, 10) !== startDateValue || end.toISOString().slice(0, 10) !== endDateValue || end < start || end.getTime() - start.getTime() > 366 * 24 * 60 * 60 * 1000) return res.status(400).json({ success: false, error: 'INVALID_DATE_RANGE', message: 'O período informado é inválido ou superior a um ano.' });
    dateFilter = { createdAt: { gte: start, lte: end } };
  }
  const paginated = req.query.page !== undefined || req.query.pageSize !== undefined;
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const pageSize = req.query.pageSize === undefined ? 25 : Number(req.query.pageSize);
  if (paginated && (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100 || !Number.isSafeInteger((page - 1) * pageSize))) return res.status(400).json({ success: false, error: 'INVALID_PAGINATION', message: 'A página deve ser positiva e o tamanho deve estar entre 1 e 100.' });
  const sortFields = { createdAt: 'createdAt', status: 'status', amount: 'valorProposta', valorProposta: 'valorProposta' };
  const sortField = sortFields[String(req.query.sortBy || 'createdAt')];
  const sortOrder = String(req.query.sortOrder || 'desc').toLowerCase();
  if (!sortField || !['asc', 'desc'].includes(sortOrder)) return res.status(400).json({ success: false, error: 'INVALID_SORT', message: 'A ordenação solicitada não é permitida.' });
  const where = {
    ...baseWhere,
    ...(status ? { status } : {}),
    ...(customerId ? { clienteId: customerId } : {}),
    ...(vehicleId ? { veiculoId: vehicleId } : {}),
    ...(sellerId ? { vendedorId: sellerId } : {}),
    ...dateFilter,
    ...(search ? { OR: [
      { cliente: { nome: { contains: search } } },
      { cliente: { documento: { contains: search.replace(/\D/g, '') || search } } },
      { veiculo: { marca: { contains: search } } },
      { veiculo: { modelo: { contains: search } } },
      { vendedor: { nome: { contains: search } } },
    ] } : {}),
  };
  const [proposals, total] = await Promise.all([
    prisma.proposta.findMany({
      where,
      include: proposalInclude,
      orderBy: [{ [sortField]: sortOrder }, { id: 'desc' }],
      ...(paginated ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
    }),
    paginated ? prisma.proposta.count({ where }) : Promise.resolve(null),
  ]);
  const records = proposals.map(presentProposal);
  if (!paginated) return ok(res, records, 'Propostas carregadas com sucesso');
  return ok(res, { items: records, pagination: { page, pageSize, total: total || 0, totalPages: Math.ceil((total || 0) / pageSize) } }, 'Propostas carregadas com sucesso');
};

export const getPropostaById = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ success: false, error: 'INVALID_PROPOSAL_ID', message: 'Identificador de proposta inválido.' });
  const where = await visibleWhere(req.user);
  const proposal = await prisma.proposta.findFirst({ where: { id, ...where }, include: proposalInclude });
  if (!proposal) return notFound(res, 'Proposta não encontrada');
  return ok(res, presentProposal(proposal), 'Proposta encontrada');
};

export const getPropostaHistory = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ success: false, error: 'INVALID_PROPOSAL_ID', message: 'Identificador de proposta inválido.' });
  const where = await visibleWhere(req.user);
  const proposal = await prisma.proposta.findFirst({ where: { id, ...where }, select: { id: true } });
  if (!proposal) return notFound(res, 'Proposta não encontrada');
  const events = await prisma.aprovacao.findMany({
    where: { entidade: 'PROPOSTA', entidadeId: id },
    select: { id: true, acao: true, observacao: true, createdAt: true, usuario: { select: { id: true, nome: true } } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
  return ok(res, events, 'Histórico da proposta carregado com sucesso');
};

export const createProposta = async (req, res) => {
  const clienteId = Number(req.body.clienteId);
  const veiculoId = Number(req.body.veiculoId);
  if (![clienteId, veiculoId].every((id) => Number.isSafeInteger(id) && id > 0)) return res.status(400).json({ success: false, error: 'INVALID_REFERENCE', message: 'Selecione um cliente e um veículo válidos.' });
  const [cliente, veiculo] = await Promise.all([
    prisma.cliente.findFirst({ where: { id: clienteId, deletedAt: null, status: 'ativo', ...storeScope(req.user) } }),
    prisma.veiculo.findFirst({ where: { id: veiculoId, deletedAt: null, ...storeScope(req.user) } }),
  ]);
  if (!cliente) return res.status(400).json({ success: false, error: 'CUSTOMER_NOT_FOUND', message: 'Selecione um cliente ativo.' });
  if (!veiculo) return res.status(400).json({ success: false, error: 'VEHICLE_NOT_FOUND', message: 'Selecione um veículo ativo.' });
  const negotiatedPrice = Number(req.body.valorProposta ?? req.body.negotiatedPrice);
  const minPrice = Number(veiculo.precoMinimo || 0);
  const suggestedPrice = Number(veiculo.precoSugerido || 0);
  if (!Number.isFinite(negotiatedPrice) || negotiatedPrice <= 0) return res.status(400).json({ success: false, error: 'INVALID_PRICE', message: 'Informe um preço negociado válido.' });
  if (minPrice > 0 && negotiatedPrice < minPrice) return res.status(400).json({ success: false, error: 'BELOW_MINIMUM_PRICE', message: 'O preço negociado não pode ser inferior ao preço mínimo autorizado.' });
  if (suggestedPrice > 0 && negotiatedPrice > suggestedPrice * 1.5) return res.status(400).json({ success: false, error: 'PRICE_OUT_OF_RANGE', message: 'O preço negociado excede o limite permitido para este veículo.' });
  if (String(veiculo.status).toLowerCase() === 'vendido' || String(veiculo.status).toUpperCase() === 'SOLD') return res.status(409).json({ success: false, error: 'VEHICLE_SOLD', message: 'Este veículo já foi vendido.' });

  const role = roleOf(req.user);
  let seller = await sellerForUser(req.user.id);
  if (['ADMIN', 'SUPPORT'].includes(role) && req.body.vendedorId) {
    const requestedSellerId = Number(req.body.vendedorId);
    seller = Number.isSafeInteger(requestedSellerId) && requestedSellerId > 0
      ? await prisma.vendedor.findFirst({ where: { id: requestedSellerId, status: 'ativo', usuario: { status: 'ativo' } } })
      : null;
  }
  if (!seller) return res.status(409).json({ success: false, error: 'SELLER_PROFILE_MISSING', message: 'Não há vendedor vinculado a esta sessão. Associe um vendedor à proposta.' });
  if (seller.lojaId !== cliente.lojaId || seller.lojaId !== veiculo.lojaId) return res.status(409).json({ success: false, error: 'CROSS_STORE_DEAL', message: 'Cliente, vendedor e veículo precisam pertencer à mesma loja.' });
  if (!['ADMIN', 'SUPPORT'].includes(role) && cliente.vendedorId && cliente.vendedorId !== seller.id) return res.status(409).json({ success: false, error: 'CUSTOMER_OWNED', message: 'Este cliente está sendo atendido por outro vendedor. Solicite a transferência ao gerente.' });
  if (!['ADMIN', 'SUPPORT'].includes(role)) {
    const existing = await prisma.proposta.findFirst({ where: { clienteId, status: { in: activeStatuses }, vendedorId: { not: seller.id } } });
    if (existing) return res.status(409).json({ success: false, error: 'CUSTOMER_OWNED', message: 'Este cliente está sendo atendido por outro vendedor. Solicite a transferência ao gerente.' });
  }
  const installments = Number(req.body.parcelas ?? req.body.installments ?? 48);
  const downPayment = Number(req.body.entrada ?? req.body.downPayment ?? 0);
  const interestRate = Number(req.body.taxaJuros ?? req.body.interestRate ?? 0);
  if (!Number.isInteger(installments) || installments < 1 || installments > 120 || !Number.isFinite(downPayment) || downPayment < 0 || downPayment > negotiatedPrice || !Number.isFinite(interestRate) || interestRate < 0 || interestRate > 100) return res.status(400).json({ success: false, error: 'INVALID_FINANCING', message: 'Confira entrada, prazo e taxa do financiamento.' });
  if (interestRate > 0) {
    const today = new Date(new Date().toISOString().slice(0, 10));
    const table = await prisma.tabelaFinanciamento.findFirst({ where: { deletedAt: null, status: 'ativo', taxa: interestRate, parcelasMin: { lte: installments }, parcelasMax: { gte: installments }, vigenciaInicio: { lte: today }, OR: [{ vigenciaFim: null }, { vigenciaFim: { gte: today } }] }, select: { id: true } });
    if (!table) return res.status(400).json({ success: false, error: 'RATE_NOT_AVAILABLE', message: 'A taxa e o número de parcelas informados não constam em uma tabela de financiamento vigente.' });
  }
  const principal = negotiatedPrice - downPayment;
  const rate = interestRate / 100;
  const installmentValue = rate ? principal * (rate * (1 + rate) ** installments) / ((1 + rate) ** installments - 1) : principal / installments;
  if (String(req.body.observacoes || '').length > 191) return res.status(400).json({ success: false, error: 'INVALID_NOTES', message: 'As observações devem ter no máximo 191 caracteres.' });
  const rawBenefitIds = req.body.beneficioIds ?? [];
  if (!Array.isArray(rawBenefitIds) || rawBenefitIds.length > 20) return res.status(400).json({ success: false, error: 'INVALID_BENEFITS', message: 'Benefícios inválidos.' });
  const benefitIds = [...new Set(rawBenefitIds.map(Number))];
  if (benefitIds.some((id) => !Number.isInteger(id) || id < 1)) return res.status(400).json({ success: false, error: 'INVALID_BENEFITS', message: 'Benefícios inválidos.' });
  const selectedBenefits = benefitIds.length ? await prisma.beneficio.findMany({ where: { id: { in: benefitIds }, deletedAt: null, status: 'ativo' } }) : [];
  if (selectedBenefits.length !== benefitIds.length) return res.status(400).json({ success: false, error: 'INVALID_BENEFITS', message: 'Um ou mais benefícios não estão ativos.' });
  let proposal;
  try {
    proposal = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM Veiculo WHERE id = ${veiculoId} FOR UPDATE`;
      const lockedVehicle = await tx.veiculo.findFirst({ where: { id: veiculoId, deletedAt: null, lojaId: veiculo.lojaId } });
      const activeCustomer = await tx.cliente.findFirst({ where: { id: clienteId, deletedAt: null, status: 'ativo', lojaId: veiculo.lojaId }, select: { id: true } });
      const activeSeller = await tx.vendedor.findFirst({ where: { id: seller.id, status: 'ativo', lojaId: veiculo.lojaId, usuario: { status: 'ativo' } }, select: { id: true } });
      if (!lockedVehicle || !activeCustomer || !activeSeller) {
        const conflict = new Error('Cliente, vendedor ou veículo deixou de estar disponível.');
        conflict.code = 'DEAL_REFERENCE_UNAVAILABLE';
        throw conflict;
      }
      if (['vendido', 'SOLD'].includes(String(lockedVehicle.status))) {
        const conflict = new Error('Este veículo já foi vendido.');
        conflict.code = 'VEHICLE_SOLD';
        throw conflict;
      }
      if (negotiatedPrice < Number(lockedVehicle.precoMinimo || 0)) {
        const conflict = new Error('O preço negociado não pode ser inferior ao preço mínimo autorizado.');
        conflict.code = 'BELOW_MINIMUM_PRICE';
        throw conflict;
      }
      const createdProposal = await tx.proposta.create({ data: {
        clienteId, vendedorId: seller.id, veiculoId, lojaId: lockedVehicle.lojaId, valorProposta: negotiatedPrice, entrada: downPayment, parcelas: installments,
        taxaJuros: interestRate, valorParcela: Math.round(installmentValue * 100) / 100,
        totalFinanciado: Math.round(installmentValue * installments * 100) / 100,
        status: 'pendente', observacoes: String(req.body.observacoes || '').trim() || null,
      } });
      if (selectedBenefits.length) await tx.propostaBeneficio.createMany({ data: selectedBenefits.map((item) => ({ propostaId: createdProposal.id, beneficioId: item.id, nome: item.nome, descricao: item.descricao })) });
      if (lockedVehicle.status !== 'em_negociacao') await tx.veiculo.update({ where: { id: veiculoId }, data: { status: 'em_negociacao' } });
      await tx.aprovacao.create({ data: { entidade: 'PROPOSTA', entidadeId: createdProposal.id, usuarioId: Number(req.user.id), acao: 'CRIADA' } });
      return tx.proposta.findUnique({ where: { id: createdProposal.id }, include: proposalInclude });
    });
  } catch (error) {
    if (['DEAL_REFERENCE_UNAVAILABLE', 'VEHICLE_SOLD', 'BELOW_MINIMUM_PRICE'].includes(error.code)) {
      const response = { DEAL_REFERENCE_UNAVAILABLE: 409, VEHICLE_SOLD: 409, BELOW_MINIMUM_PRICE: 400 }[error.code];
      return res.status(response).json({ success: false, error: error.code, message: error.message });
    }
    throw error;
  }
  return created(res, presentProposal(proposal), 'Simulação criada e veículo reservado para negociação');
};

export const updateStatusProposta = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ success: false, error: 'INVALID_PROPOSAL_ID', message: 'Identificador de proposta inválido.' });
  const role = roleOf(req.user);
  const where = await visibleWhere(req.user);
  const statusInput = String(req.body.status || '').trim().toUpperCase();
  const nextStatus = ({ REJECTED: 'CREDIT_REJECTED', RECUSADA: 'CREDIT_REJECTED', CREDIT_REJECTED: 'CREDIT_REJECTED', APROVADA: 'CONTRACT_EFFECTIVE', APPROVED: 'CONTRACT_EFFECTIVE', CONTRACT_EFFECTIVE: 'CONTRACT_EFFECTIVE', CANCELLED: 'CANCELLED', CANCELADA: 'CANCELLED', PROPOSAL: 'proposal', PROPOSTA: 'proposal' })[statusInput];
  if (!nextStatus) return res.status(400).json({ success: false, error: 'INVALID_STATUS', message: 'Status de proposta inválido.' });
  if (nextStatus === 'CONTRACT_EFFECTIVE' && !['ADMIN', 'SUPPORT'].includes(role)) return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Somente suporte ou administrador pode efetivar o contrato.' });
  const initial = await prisma.proposta.findFirst({ where: { id, ...where }, select: { id: true, veiculoId: true } });
  if (!initial) return notFound(res, 'Proposta não encontrada');
  const reason = String(req.body.motivo || 'Proposta recusada').trim();
  if (nextStatus === 'CREDIT_REJECTED' && (!reason || reason.length > 191)) return res.status(400).json({ success: false, error: 'INVALID_REJECTION_REASON', message: 'Informe um motivo de recusa com até 191 caracteres.' });
  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM Veiculo WHERE id = ${initial.veiculoId} FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM Proposta WHERE id = ${id} FOR UPDATE`;
      const proposal = await tx.proposta.findFirst({ where: { id, ...where }, include: { veiculo: true, vendedor: { include: { usuario: true } } } });
      if (!proposal) {
        const error = new Error('Proposta não encontrada.');
        error.code = 'PROPOSAL_NOT_FOUND';
        throw error;
      }
      if (!activeStatuses.includes(String(proposal.status).toLowerCase())) {
        const error = new Error('Esta proposta já saiu de uma etapa ativa.');
        error.code = 'INVALID_TRANSITION';
        throw error;
      }
      if (nextStatus === 'CONTRACT_EFFECTIVE' && ['vendido', 'SOLD'].includes(String(proposal.veiculo.status))) {
        const error = new Error('Este veículo já foi vendido por outra proposta.');
        error.code = 'VEHICLE_ALREADY_SOLD';
        throw error;
      }
      if (nextStatus === 'CONTRACT_EFFECTIVE' && Number(proposal.valorProposta) < Number(proposal.veiculo.precoMinimo || 0)) {
        const error = new Error('A proposta está abaixo do preço mínimo vigente do veículo.');
        error.code = 'BELOW_MINIMUM_PRICE';
        throw error;
      }
      const changed = await tx.proposta.update({
        where: { id },
        data: { status: nextStatus, updatedAt: new Date(), ...(nextStatus === 'CREDIT_REJECTED' ? { motivoRecusa: reason } : {}) },
      });
      if (nextStatus === 'CONTRACT_EFFECTIVE') {
        await tx.veiculo.update({ where: { id: proposal.veiculoId }, data: { status: 'vendido' } });
        const otherProposals = await tx.proposta.findMany({
          where: { veiculoId: proposal.veiculoId, id: { not: id }, status: { in: activeStatuses } },
          select: { id: true },
        });
        await tx.proposta.updateMany({
          where: { id: { in: otherProposals.map((item) => item.id) } },
          data: { status: 'REJECTED', motivoRecusa: 'Veículo vendido', updatedAt: new Date() },
        });
        for (const other of otherProposals) {
          await tx.aprovacao.create({ data: { entidade: 'PROPOSTA', entidadeId: other.id, usuarioId: Number(req.user.id), acao: 'RECUSADA_VEICULO_VENDIDO' } });
        }
        await ensureContractAndCommissions(tx, id);
      } else if (['CREDIT_REJECTED', 'CANCELLED'].includes(nextStatus)) {
        const others = await tx.proposta.count({ where: { veiculoId: proposal.veiculoId, id: { not: id }, status: { in: activeStatuses } } });
        if (!others && !['vendido', 'SOLD'].includes(String(proposal.veiculo.status))) {
          await tx.veiculo.update({ where: { id: proposal.veiculoId }, data: { status: 'disponivel' } });
        }
        if (nextStatus === 'CREDIT_REJECTED') {
          const opportunity = await tx.oportunidadeCredito.upsert({
            where: { propostaId: id },
            create: { clienteId: proposal.clienteId, lojaId: proposal.lojaId, propostaId: id, responsavelId: proposal.vendedor.usuarioId, tipo: 'REANALISE_CREDITO', status: 'ABERTA', motivo: reason },
            update: {},
          });
          await ensureFichaFromRejection(tx, { proposal, oportunidadeId: opportunity.id });
        }
      }
      await tx.aprovacao.create({
        data: { entidade: 'PROPOSTA', entidadeId: id, usuarioId: Number(req.user.id), acao: nextStatus, observacao: nextStatus === 'CREDIT_REJECTED' ? reason : null },
      });
      return tx.proposta.findUnique({ where: { id: changed.id }, include: proposalInclude });
    });
    return ok(res, presentProposal(updated), 'Status da proposta atualizado com sucesso');
  } catch (error) {
    if (['PROPOSAL_NOT_FOUND', 'INVALID_TRANSITION', 'VEHICLE_ALREADY_SOLD', 'BELOW_MINIMUM_PRICE'].includes(error.code)) {
      const response = error.code === 'PROPOSAL_NOT_FOUND' ? 404 : error.code === 'BELOW_MINIMUM_PRICE' ? 400 : 409;
      return res.status(response).json({ success: false, error: error.code, message: error.message });
    }
    throw error;
  }
};


const pdfMoney = (amount) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(amount || 0));
const logoPath = fileURLToPath(new URL('../assets/vfc-logo.png', import.meta.url));
const joinParts = (parts, separator = ', ') => parts.map((part) => String(part ?? '').trim()).filter(Boolean).join(separator);
const formatCnpj = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 14 ? digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : String(value || '');
};
export const downloadPropostaPdf = async (req, res) => {
  if (!Number.isInteger(Number(req.params.id))) return notFound(res, 'Proposta não encontrada');
  const where = await visibleWhere(req.user);
  const proposal = await prisma.proposta.findFirst({ where: { id: Number(req.params.id), ...where }, include: { ...proposalInclude, loja: true } });
  if (!proposal) return notFound(res, 'Proposta não encontrada');
  const filename = `proposta-${proposal.id}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const doc = new PDFDocument({ size: 'A4', margin: 52, bufferPages: true, info: { Title: `Proposta comercial ${proposal.id}`, Author: 'VFC Multimarcas' } });
  doc.pipe(res);
  const client = proposal.cliente;
  const vehicle = proposal.veiculo;
  const store = proposal.loja;
  const settings = await getProposalSettings(proposal.lojaId);
  const left = 52; const right = 543; const width = right - left;
  const createdDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(proposal.createdAt);
  const validity = new Intl.DateTimeFormat('pt-BR').format(new Date(proposal.createdAt.getTime() + settings.validadeDias * 24 * 60 * 60 * 1000));
  const navy = '#102a43'; const muted = '#486581'; const line = '#d9e2ec';

  const ensureSpace = (height) => { if (doc.y + height > 780) doc.addPage(); };
  const sectionTitle = (number, title) => {
    ensureSpace(60);
    doc.moveDown(1.1);
    const top = doc.y;
    doc.rect(left, top, 4, 16).fill('#4b2a8a');
    doc.fillColor(navy).font('Helvetica-Bold').fontSize(13).text(`${number}. ${title}`, left + 12, top + 1, { width: width - 12 });
    doc.x = left; doc.moveDown(0.4);
  };
  const row = (label, value, bold = false) => {
    ensureSpace(24);
    const top = doc.y + 4;
    doc.moveTo(left, top).lineTo(right, top).strokeColor(line).lineWidth(0.5).stroke();
    doc.fillColor(muted).font('Helvetica').fontSize(10).text(label, left, top + 7, { width: 230 });
    const labelBottom = doc.y;
    doc.fillColor(navy).font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).text(String(value ?? '—'), left + 240, top + 7, { width: width - 240, align: 'right' });
    doc.x = left; doc.y = Math.max(labelBottom, doc.y) + 3;
  };
  const paragraph = (text) => {
    ensureSpace(40);
    doc.fillColor(muted).font('Helvetica').fontSize(10).text(text, left, doc.y + 4, { width, align: 'justify' });
    doc.x = left;
  };

  // 1. Cabeçalho
  doc.image(logoPath, left, 40, { fit: [96, 62] });
  const storeAddress = joinParts([joinParts([store?.logradouro, store?.numero], ', '), store?.complemento, store?.bairro]);
  const storeCity = joinParts([joinParts([store?.cidade, store?.estado], '/'), store?.cep ? `CEP ${store.cep}` : '']);
  doc.fillColor(navy).font('Helvetica-Bold').fontSize(11).text(store?.nome || 'VFC Multimarcas', 165, 42, { width: right - 165, align: 'right' });
  doc.fillColor(muted).font('Helvetica').fontSize(8.5);
  [store?.cnpj ? `CNPJ ${formatCnpj(store.cnpj)}` : '', storeAddress, storeCity, joinParts([store?.telefone, store?.email], '  •  ')].filter(Boolean)
    .forEach((item) => doc.text(item, 165, doc.y + 1, { width: right - 165, align: 'right' }));
  doc.moveTo(left, 112).lineTo(right, 112).strokeColor(navy).lineWidth(1.5).stroke();
  doc.fillColor(navy).font('Helvetica-Bold').fontSize(20).text('PROPOSTA COMERCIAL', left, 124, { width });
  doc.fillColor(muted).font('Helvetica').fontSize(10).text(`Nº ${String(proposal.id).padStart(5, '0')}   •   Emitida em ${createdDate}   •   Válida até ${validity}`, left, doc.y + 2, { width });
  doc.moveDown(0.3);
  doc.fillColor(navy).font('Helvetica-Bold').fontSize(11).text('Cliente', left, doc.y + 8);
  doc.fillColor(muted).font('Helvetica').fontSize(10).text(`${client?.nome || 'Cliente'}   |   ${String(client?.tipoPessoa || 'PF').toUpperCase()}: ${client?.documento || 'Não informado'}`, left, doc.y + 2, { width });
  const contact = joinParts([client?.telefone, client?.email], '  •  ');
  if (contact) doc.text(contact, left, doc.y + 1, { width });

  // 2. Especificação do veículo
  sectionTitle(2, 'Especificação do Veículo');
  row('Veículo', `${vehicle?.marca || ''} ${vehicle?.modelo || ''}`.trim() || '—', true);
  row('Ano fabricação/modelo', `${vehicle?.anoFabricacao || vehicle?.ano || '—'}/${vehicle?.anoModelo || '—'}`);
  row('Placa', vehicle?.placa || '—');
  row('Código FIPE', vehicle?.codigoFipe || '—');
  row('Valor de referência FIPE', vehicle?.valorFipe ? pdfMoney(vehicle.valorFipe) : '—');
  if (vehicle?.observacoes) { doc.moveDown(0.3); paragraph(`Observações do veículo: ${vehicle.observacoes}`); }

  // 3. Composição de preços e condições de pagamento
  sectionTitle(3, 'Composição de Preços e Condições de Pagamento');
  row('Preço negociado', pdfMoney(proposal.valorProposta), true);
  row('Entrada', pdfMoney(proposal.entrada));
  row('Saldo financiado', pdfMoney(Number(proposal.valorProposta) - Number(proposal.entrada || 0)));
  row(`Parcelamento${proposal.parcelas ? ` em ${proposal.parcelas}x` : ''}`, proposal.valorParcela ? `${proposal.parcelas}x de ${pdfMoney(proposal.valorParcela)}` : 'A definir');
  row('Taxa de juros mensal', proposal.taxaJuros ? `${Number(proposal.taxaJuros).toLocaleString('pt-BR')}% a.m.` : 'A definir');
  row('Total estimado das parcelas', pdfMoney(proposal.totalFinanciado));
  if (proposal.beneficios?.length) row('Benefícios incluídos', proposal.beneficios.map((item) => item.nome).join(', '));
  if (proposal.observacoes) { doc.moveDown(0.3); paragraph(`Observações: ${proposal.observacoes}`); }

  // 4. Prazos e logística
  sectionTitle(4, 'Prazos e Logística');
  row('Validade da proposta', validity);
  row('Entrega do veículo', settings.prazoEntrega);
  row('Documentação e transferência', settings.documentacaoTransferencia);
  paragraph(settings.textoPrazos);

  // 5. Garantia e pós-venda
  sectionTitle(5, 'Garantia e Pós-Venda');
  paragraph(settings.textoGarantia);

  // 6. Encerramento e aceite
  sectionTitle(6, 'Encerramento e Aceite');
  paragraph(`Esta proposta é válida até ${validity}. Valores e parcelas são estimativas e dependem da aprovação de crédito e das condições vigentes na data da contratação.`);
  ensureSpace(150);
  doc.fillColor(navy).font('Helvetica-Bold').fontSize(10).text(`Consultor responsável: ${proposal.vendedor?.nome || 'Equipe VFC Multimarcas'}`, left, doc.y + 14, { width });
  const signatureY = doc.y + 52;
  doc.moveTo(left, signatureY).lineTo(245, signatureY).strokeColor('#829ab1').lineWidth(0.8).stroke().moveTo(350, signatureY).lineTo(right, signatureY).stroke();
  doc.fillColor(muted).font('Helvetica').fontSize(9).text(store?.nome || 'VFC Multimarcas', left, signatureY + 6, { width: 193, align: 'center' });
  doc.text('Cliente (aceite)', 350, signatureY + 6, { width: 193, align: 'center' });
  doc.text('Local e data: ______________________________', left, signatureY + 30, { width });

  const range = doc.bufferedPageRange();
  for (let index = 0; index < range.count; index += 1) {
    doc.switchToPage(range.start + index);
    doc.page.margins.bottom = 0;
    doc.fillColor('#829ab1').font('Helvetica').fontSize(8).text(`VFC Multimarcas  •  Proposta ${String(proposal.id).padStart(5, '0')}  •  Página ${index + 1} de ${range.count}`, left, 800, { width, align: 'center', lineBreak: false });
  }
  doc.end();
};
