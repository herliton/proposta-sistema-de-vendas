import PDFDocument from 'pdfkit';
import { prisma } from '../config/database.js';
import { normalizeRole } from './permissionsController.js';

const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
const reportScope = async (user) => {
  const role = normalizeRole(user?.perfil || user?.role);
  if (['ADMIN', 'SUPPORT'].includes(role)) return {};
  if (role === 'MANAGER') return { OR: [{ usuarioId: Number(user.id) }, { usuario: { gerenteId: Number(user.id) } }] };
  return { usuarioId: Number(user.id) };
};
const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
const safeDate = (value) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', dateStyle: 'short' }).format(value);

export const downloadCommissionReport = async (req, res) => {
  const startDate = String(req.query.startDate || '');
  const endDate = String(req.query.endDate || '');
  if (!dateOnly.test(startDate) || !dateOnly.test(endDate)) return res.status(400).json({ success: false, error: 'INVALID_DATE_RANGE', message: 'Informe startDate e endDate no formato AAAA-MM-DD.' });
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start.toISOString().slice(0, 10) !== startDate || end.toISOString().slice(0, 10) !== endDate || end < start || end.getTime() - start.getTime() > 366 * 24 * 60 * 60 * 1000) return res.status(400).json({ success: false, error: 'INVALID_DATE_RANGE', message: 'O período informado é inválido ou superior a um ano.' });
  const scope = await reportScope(req.user);
  const ledger = await prisma.comissao.findMany({
    where: { createdAt: { gte: start, lte: end }, ...scope },
    include: { usuario: true, vendedor: true, proposta: { include: { cliente: true, veiculo: true, contrato: true } } },
    orderBy: [{ usuario: { nome: 'asc' } }, { createdAt: 'asc' }],
  });
  const total = ledger.reduce((sum, item) => sum + Number(item.valor), 0);
  const filename = `comissoes-${startDate}-${endDate}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true, info: { Title: 'Relatório de comissões', Author: 'VFC Multimarcas' } });
  doc.pipe(res);
  doc.rect(0, 0, 595.28, 115).fill('#102a43');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text('VFC MULTIMARCAS', 48, 35, { characterSpacing: 1.2 });
  doc.fontSize(24).text('RELATÓRIO DE COMISSÕES', 48, 55);
  doc.font('Helvetica').fontSize(10).text(`Período: ${safeDate(start)} a ${safeDate(end)}`, 48, 87);
  doc.y = 138;
  doc.fillColor('#102a43').font('Helvetica-Bold').fontSize(13).text(`Total apurado: ${money(total)}`);
  doc.moveDown(0.35).fillColor('#486581').font('Helvetica').fontSize(9).text(`${ledger.length} lançamento(s) no período. Os valores seguem as regras de comissão vigentes no momento da efetivação.`);
  let y = doc.y + 22;
  const drawHeader = () => {
    doc.rect(48, y, 499, 25).fill('#eaf0f6');
    doc.fillColor('#102a43').font('Helvetica-Bold').fontSize(8);
    doc.text('DATA', 54, y + 8, { width: 55 });
    doc.text('COLABORADOR', 111, y + 8, { width: 128 });
    doc.text('TIPO', 242, y + 8, { width: 63 });
    doc.text('PROPOSTA', 308, y + 8, { width: 65 });
    doc.text('VALOR', 416, y + 8, { width: 122, align: 'right' });
    y += 25;
  };
  drawHeader();
  for (const row of ledger) {
    if (y > 745) { doc.addPage(); y = 48; drawHeader(); }
    const proposal = row.proposta;
    const desc = proposal ? `#${String(proposal.id).padStart(5, '0')} · ${proposal.cliente?.nome || 'Cliente'}` : `#${row.propostaId}`;
    doc.fillColor('#334e68').font('Helvetica').fontSize(8);
    doc.text(safeDate(row.createdAt), 54, y + 8, { width: 55 });
    doc.text(row.usuario?.nome || row.vendedor?.nome || 'Colaborador', 111, y + 8, { width: 128, ellipsis: true });
    doc.text(row.tipo === 'GERENTE' ? 'Gerência' : row.tipo, 242, y + 8, { width: 63, ellipsis: true });
    doc.text(desc, 308, y + 8, { width: 102, ellipsis: true });
    doc.font('Helvetica-Bold').text(money(row.valor), 416, y + 8, { width: 122, align: 'right' });
    y += 25;
    doc.moveTo(48, y).lineTo(547, y).strokeColor('#d9e2ec').stroke();
  }
  if (!ledger.length) {
    doc.moveDown(2).fillColor('#486581').font('Helvetica').fontSize(11).text('Nenhuma comissão foi efetivada neste período.', 48, y + 20);
  }
  const pages = doc.bufferedPageRange();
  for (let index = pages.start; index < pages.start + pages.count; index += 1) {
    doc.switchToPage(index);
    doc.fillColor('#829ab1').font('Helvetica').fontSize(8).text(`Gerado em ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())} · Página ${index + 1} de ${pages.count}`, 48, 790, { width: 499, align: 'right' });
  }
  doc.end();
};


export const getCommissionSummary = async (req, res) => {
  const startDate = String(req.query.startDate || '');
  const endDate = String(req.query.endDate || '');
  if (!dateOnly.test(startDate) || !dateOnly.test(endDate)) return res.status(400).json({ success: false, error: 'INVALID_DATE_RANGE', message: 'Informe startDate e endDate no formato AAAA-MM-DD.' });
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start.toISOString().slice(0, 10) !== startDate || end.toISOString().slice(0, 10) !== endDate || end < start || end.getTime() - start.getTime() > 366 * 24 * 60 * 60 * 1000) return res.status(400).json({ success: false, error: 'INVALID_DATE_RANGE', message: 'O período informado é inválido ou superior a um ano.' });
  const scope = await reportScope(req.user);
  const rows = await prisma.comissao.findMany({ where: { createdAt: { gte: start, lte: end }, ...scope }, include: { usuario: true, vendedor: true, proposta: { include: { contrato: true } } }, orderBy: { createdAt: 'asc' } });
  const grouped = new Map();
  for (const row of rows) {
    const key = row.usuarioId || `seller-${row.vendedorId}`;
    const entry = grouped.get(key) || { colaborador: row.usuario?.nome || row.vendedor?.nome || 'Colaborador', perfil: row.tipo === 'GERENTE' ? 'Gerente' : 'Vendedor', contratos: new Set(), baseCalculo: new Map(), comissao: 0 };
    entry.contratos.add(row.propostaId);
    entry.baseCalculo.set(row.propostaId, Number(row.proposta?.valorProposta || 0));
    entry.comissao += Number(row.valor || 0);
    grouped.set(key, entry);
  }
  const items = [...grouped.values()].map((entry) => ({ colaborador: entry.colaborador, perfil: entry.perfil, contratos: entry.contratos.size, baseCalculo: [...entry.baseCalculo.values()].reduce((sum, value) => sum + value, 0), comissao: entry.comissao }));
  const proposalTotals = new Map(rows.filter((row) => row.proposta?.contrato).map((row) => [row.propostaId, Number(row.proposta.valorProposta)]));
  return res.json({ success: true, data: { items, summary: { totalComissoes: items.reduce((sum, item) => sum + item.comissao, 0), colaboradores: items.length, volumeVendido: [...proposalTotals.values()].reduce((sum, value) => sum + value, 0), contratos: proposalTotals.size } } });
};


export const getCommissionRules = async (_req, res) => {
  const saved = await prisma.configuracao.findUnique({ where: { chave: 'commissionRules' } });
  const value = saved?.valor || {};
  return res.json({ success: true, data: { sellerPercent: Number(value.sellerPercent ?? 1.5), managerPercent: Number(value.managerPercent ?? 0.5) } });
};

export const updateCommissionRules = async (req, res) => {
  const sellerPercent = Number(req.body.sellerPercent);
  const managerPercent = Number(req.body.managerPercent);
  if (!Number.isFinite(sellerPercent) || sellerPercent < 0 || sellerPercent > 100 || !Number.isFinite(managerPercent) || managerPercent < 0 || managerPercent > 100) return res.status(400).json({ success: false, error: 'INVALID_COMMISSION_RULES', message: 'Informe percentuais entre 0 e 100.' });
  const value = { sellerPercent, managerPercent, updatedAt: new Date().toISOString() };
  await prisma.configuracao.upsert({ where: { chave: 'commissionRules' }, create: { chave: 'commissionRules', valor: value }, update: { valor: value, updatedAt: new Date() } });
  return res.json({ success: true, data: { sellerPercent, managerPercent }, message: 'Regras de comissão atualizadas.' });
};
