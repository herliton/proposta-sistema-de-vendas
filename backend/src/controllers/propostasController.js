import { prisma } from '../config/database.js';
import PDFDocument from 'pdfkit';
import { created, notFound, ok } from '../utils/response.js';
import { ensureContractAndCommissions } from '../services/commissionService.js';
import { storeScope } from '../utils/storeScope.js';

const rolesWithGlobalView = ['ADMIN', 'SUPPORT'];
const activeStatuses = ['pendente', 'em análise', 'em analise', 'aguardando', 'simulation', 'proposal', 'simulacao', 'proposta'];
const roleOf = (user) => String(user?.perfil || user?.role || '').toUpperCase();
const proposalInclude = { cliente: true, vendedor: { include: { usuario: { select: { id: true, nome: true } } } }, veiculo: true };
const presentProposal = (proposal) => ({ ...proposal, valorProposta: Number(proposal.valorProposta), entrada: Number(proposal.entrada || 0), taxaJuros: Number(proposal.taxaJuros || 0), valorParcela: Number(proposal.valorParcela || 0), totalFinanciado: Number(proposal.totalFinanciado || 0), vendedor: proposal.vendedor ? { ...proposal.vendedor, nome: proposal.vendedor.usuario?.nome || proposal.vendedor.nome } : null, veiculo: proposal.veiculo ? { ...proposal.veiculo, precoSugerido: Number(proposal.veiculo.precoSugerido || 0), precoMinimo: Number(proposal.veiculo.precoMinimo || 0), valorFipe: Number(proposal.veiculo.valorFipe || 0), fotos: { right: proposal.veiculo.fotoDireita || '', left: proposal.veiculo.fotoEsquerda || '', front: proposal.veiculo.fotoFrente || '', rear: proposal.veiculo.fotoTraseira || '', interior: proposal.veiculo.fotoInterior || '' } } : null });
const sellerForUser = (id) => prisma.vendedor.findFirst({ where: { usuarioId: Number(id) } });
const visibleWhere = async (user) => {
  const role = roleOf(user);
  if (rolesWithGlobalView.includes(role)) return storeScope(user);
  const seller = await sellerForUser(user.id);
  if (role === 'MANAGER') return { AND: [{ OR: [{ vendedorId: seller?.id ?? -1 }, { vendedor: { usuario: { gerenteId: Number(user.id) } } }] }, storeScope(user)] };
  return { vendedorId: seller?.id ?? -1, ...storeScope(user) };
};

export const listPropostas = async (req, res) => {
  const where = await visibleWhere(req.user);
  const proposals = await prisma.proposta.findMany({ where, include: proposalInclude, orderBy: { createdAt: 'desc' } });
  return ok(res, proposals.map(presentProposal), 'Propostas carregadas com sucesso');
};

export const getPropostaById = async (req, res) => {
  const where = await visibleWhere(req.user);
  const proposal = await prisma.proposta.findFirst({ where: { id: Number(req.params.id), ...where }, include: proposalInclude });
  if (!proposal) return notFound(res, 'Proposta não encontrada');
  return ok(res, presentProposal(proposal), 'Proposta encontrada');
};

export const createProposta = async (req, res) => {
  const clienteId = Number(req.body.clienteId);
  const veiculoId = Number(req.body.veiculoId);
  const [cliente, veiculo] = await Promise.all([
    prisma.cliente.findFirst({ where: { id: clienteId, deletedAt: null, ...storeScope(req.user) } }),
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
  if (['ADMIN', 'SUPPORT'].includes(role) && req.body.vendedorId) seller = await prisma.vendedor.findUnique({ where: { id: Number(req.body.vendedorId) } });
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
  const principal = negotiatedPrice - downPayment;
  const rate = interestRate / 100;
  const installmentValue = rate ? principal * (rate * (1 + rate) ** installments) / ((1 + rate) ** installments - 1) : principal / installments;
  const proposal = await prisma.$transaction(async (tx) => {
    const createdProposal = await tx.proposta.create({ data: {
      clienteId, vendedorId: seller.id, veiculoId, lojaId: veiculo.lojaId, valorProposta: negotiatedPrice, entrada: downPayment, parcelas: installments,
      taxaJuros: interestRate, valorParcela: Math.round(installmentValue * 100) / 100,
      totalFinanciado: Math.round(installmentValue * installments * 100) / 100,
      status: 'pendente', observacoes: String(req.body.observacoes || '').trim() || null,
    } });
    await tx.veiculo.update({ where: { id: veiculoId }, data: { status: 'em_negociacao' } });
    return tx.proposta.findUnique({ where: { id: createdProposal.id }, include: proposalInclude });
  });
  return created(res, presentProposal(proposal), 'Simulação criada e veículo reservado para negociação');
};

export const updateStatusProposta = async (req, res) => {
  const id = Number(req.params.id);
  const role = roleOf(req.user);
  const where = await visibleWhere(req.user);
  const proposal = await prisma.proposta.findFirst({ where: { id, ...where }, include: { veiculo: true, vendedor: { include: { usuario: true } } } });
  if (!proposal) return notFound(res, 'Proposta não encontrada');
  const statusInput = String(req.body.status || '').trim().toUpperCase();
  const nextStatus = ({ REJECTED: 'CREDIT_REJECTED', RECUSADA: 'CREDIT_REJECTED', CREDIT_REJECTED: 'CREDIT_REJECTED', APROVADA: 'CONTRACT_EFFECTIVE', APPROVED: 'CONTRACT_EFFECTIVE', CONTRACT_EFFECTIVE: 'CONTRACT_EFFECTIVE', CANCELLED: 'CANCELLED', CANCELADA: 'CANCELLED', PROPOSAL: 'proposal', PROPOSTA: 'proposal' })[statusInput];
  if (!nextStatus) return res.status(400).json({ success: false, error: 'INVALID_STATUS', message: 'Status de proposta inválido.' });
  if (nextStatus === 'CONTRACT_EFFECTIVE' && !['ADMIN', 'SUPPORT'].includes(role)) return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Somente suporte ou administrador pode efetivar o contrato.' });
  if (['CREDIT_REJECTED', 'CONTRACT_EFFECTIVE', 'CANCELLED'].includes(nextStatus) && !activeStatuses.includes(String(proposal.status).toLowerCase())) return res.status(409).json({ success: false, error: 'INVALID_TRANSITION', message: 'Esta proposta já saiu de uma etapa ativa.' });
  const updated = await prisma.$transaction(async (tx) => {
    const changed = await tx.proposta.update({ where: { id }, data: { status: nextStatus, updatedAt: new Date(), ...(nextStatus === 'CREDIT_REJECTED' ? { motivoRecusa: String(req.body.motivo || 'Proposta recusada') } : {}) } });
    if (nextStatus === 'CONTRACT_EFFECTIVE') {
      await tx.veiculo.update({ where: { id: proposal.veiculoId }, data: { status: 'vendido' } });
      await tx.proposta.updateMany({ where: { veiculoId: proposal.veiculoId, id: { not: id }, status: { in: activeStatuses } }, data: { status: 'REJECTED', motivoRecusa: 'Veículo vendido', updatedAt: new Date() } });
      await ensureContractAndCommissions(tx, id);
    } else if (['CREDIT_REJECTED', 'CANCELLED'].includes(nextStatus)) {
      const others = await tx.proposta.count({ where: { veiculoId: proposal.veiculoId, id: { not: id }, status: { in: activeStatuses } } });
      if (!others) await tx.veiculo.update({ where: { id: proposal.veiculoId }, data: { status: 'disponivel' } });
      if (nextStatus === 'CREDIT_REJECTED') {
        await tx.oportunidadeCredito.upsert({
          where: { propostaId: id },
          create: { clienteId: proposal.clienteId, lojaId: proposal.lojaId, propostaId: id, responsavelId: proposal.vendedor.usuarioId, tipo: 'REANALISE_CREDITO', status: 'ABERTA', motivo: proposal.motivoRecusa || String(req.body.motivo || '').trim() || null },
          update: {},
        });
      }
    }
    return tx.proposta.findUnique({ where: { id: changed.id }, include: proposalInclude });
  });
  return ok(res, presentProposal(updated), 'Status da proposta atualizado com sucesso');
};


const pdfMoney = (amount) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(amount || 0));
export const downloadPropostaPdf = async (req, res) => {
  const where = await visibleWhere(req.user);
  const proposal = await prisma.proposta.findFirst({ where: { id: Number(req.params.id), ...where }, include: proposalInclude });
  if (!proposal) return notFound(res, 'Proposta não encontrada');
  const filename = `proposta-${proposal.id}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const doc = new PDFDocument({ size: 'A4', margin: 52, info: { Title: `Proposta comercial ${proposal.id}`, Author: 'VFC Multimarcas' } });
  doc.pipe(res);
  const client = proposal.cliente;
  const vehicle = proposal.veiculo;
  const createdDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(proposal.createdAt);
  const validity = new Intl.DateTimeFormat('pt-BR').format(new Date(proposal.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000));
  doc.rect(0, 0, 595.28, 116).fill('#102a43');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text('VFC MULTIMARCAS', 52, 36, { characterSpacing: 1.2 });
  doc.fontSize(25).text('PROPOSTA COMERCIAL', 52, 57);
  doc.font('Helvetica').fontSize(10).text(`Nº ${String(proposal.id).padStart(5, '0')}     Emitida em ${createdDate}`, 52, 89);
  doc.fillColor('#102a43').font('Helvetica-Bold').fontSize(15).text('Cliente', 52, 142);
  doc.moveDown(0.5).fillColor('#243b53').font('Helvetica-Bold').fontSize(12).text(client?.nome || 'Cliente');
  doc.font('Helvetica').fontSize(10).text(`Tipo: ${String(client?.tipoPessoa || 'PF').toUpperCase()}    Documento: ${client?.documento || 'Não informado'}`);
  if (client?.telefone) doc.text(`Telefone: ${client.telefone}`);
  if (client?.email) doc.text(`E-mail: ${client.email}`);
  doc.moveDown(1).fillColor('#102a43').font('Helvetica-Bold').fontSize(15).text('Veículo');
  doc.moveDown(0.5).fillColor('#243b53').fontSize(12).text(`${vehicle?.marca || ''} ${vehicle?.modelo || ''}`.trim());
  doc.font('Helvetica').fontSize(10).text(`Ano fabricação/modelo: ${vehicle?.anoFabricacao || vehicle?.ano || '—'}/${vehicle?.anoModelo || '—'}    Placa: ${vehicle?.placa || '—'}`);
  doc.moveDown(1).fillColor('#102a43').font('Helvetica-Bold').fontSize(15).text('Condições comerciais');
  const left = 52; const right = 543; let y = doc.y + 10;
  const lineItem = (label, value, bold = false) => {
    doc.moveTo(left, y + 4).lineTo(right, y + 4).strokeColor('#d9e2ec').stroke();
    doc.fillColor('#486581').font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(11).text(label, left, y + 13, { width: 300 });
    doc.fillColor('#102a43').font('Helvetica-Bold').fontSize(11).text(value, 360, y + 13, { width: 183, align: 'right' });
    y += 38;
  };
  lineItem('Preço negociado', pdfMoney(proposal.valorProposta), true);
  lineItem('Entrada', pdfMoney(proposal.entrada));
  lineItem('Saldo financiado', pdfMoney(proposal.valorProposta - Number(proposal.entrada || 0)));
  lineItem(`Parcelamento${proposal.parcelas ? ` em ${proposal.parcelas}x` : ''}`, proposal.valorParcela ? `${proposal.parcelas}x de ${pdfMoney(proposal.valorParcela)}` : 'A definir');
  lineItem('Taxa de juros mensal', proposal.taxaJuros ? `${Number(proposal.taxaJuros).toLocaleString('pt-BR')}% a.m.` : 'A definir');
  lineItem('Total estimado das parcelas', pdfMoney(proposal.totalFinanciado));
  doc.y = y + 8;
  if (proposal.observacoes) {
    doc.moveDown(1).fillColor('#102a43').font('Helvetica-Bold').fontSize(12).text('Observações');
    doc.moveDown(0.3).fillColor('#486581').font('Helvetica').fontSize(10).text(proposal.observacoes, { width: 490 });
  }
  doc.moveDown(1.2).fillColor('#486581').font('Helvetica').fontSize(9).text(`Esta proposta é válida até ${validity}. Valores e parcelas são estimativas e dependem da aprovação de crédito e das condições da instituição financeira. Este documento não substitui o contrato de compra e venda.`, { width: 490, align: 'justify' });
  doc.moveDown(2).fillColor('#243b53').fontSize(10).text(`Consultor responsável: ${proposal.vendedor?.nome || 'Equipe VFC Multimarcas'}`);
  doc.moveDown(3).strokeColor('#829ab1').moveTo(52, doc.y).lineTo(245, doc.y).stroke().moveTo(350, doc.y).lineTo(543, doc.y).stroke();
  const signatureY = doc.y;
  doc.fontSize(9).text('VFC Multimarcas', 52, signatureY + 6, { width: 193, align: 'center' });
  doc.text('Cliente', 350, signatureY + 6, { width: 193, align: 'center' });
  doc.end();
};
