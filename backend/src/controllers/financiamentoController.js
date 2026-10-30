import { prisma } from '../config/database.js';
import { created, notFound, ok } from '../utils/response.js';

const bad = (res, message) => res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message });
const text = (value) => String(value ?? '').trim();
const parseDate = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(text(value)) ? new Date(`${text(value)}T00:00:00.000Z`) : null);
const dateOut = (date) => (date ? date.toISOString().slice(0, 10) : null);
const statuses = ['ativo', 'inativo'];
const periodicities = ['mensal', 'anual'];

const presentRate = (row) => ({ ...row, taxa: Number(row.taxa), vigenciaInicio: dateOut(row.vigenciaInicio), vigenciaFim: dateOut(row.vigenciaFim) });

const parseRate = (body) => {
  const data = {
    instituicao: text(body.instituicao), produto: text(body.produto), taxa: Number(String(body.taxa).replace(',', '.')),
    periodicidade: text(body.periodicidade) || 'mensal', parcelasMin: Number(body.parcelasMin), parcelasMax: Number(body.parcelasMax),
    vigenciaInicio: parseDate(body.vigenciaInicio), vigenciaFim: body.vigenciaFim ? parseDate(body.vigenciaFim) : null,
    status: text(body.status) || 'ativo',
  };
  if (!data.instituicao || data.instituicao.length > 120) return { error: 'Informe a instituição (até 120 caracteres).' };
  if (!data.produto || data.produto.length > 120) return { error: 'Informe o produto/modalidade (até 120 caracteres).' };
  if (!Number.isFinite(data.taxa) || data.taxa < 0 || data.taxa > 100) return { error: 'A taxa deve estar entre 0 e 100.' };
  if (!periodicities.includes(data.periodicidade)) return { error: 'Periodicidade inválida.' };
  if (!Number.isInteger(data.parcelasMin) || !Number.isInteger(data.parcelasMax) || data.parcelasMin < 1 || data.parcelasMax > 120 || data.parcelasMin > data.parcelasMax) return { error: 'Informe um intervalo de parcelas válido (1 a 120).' };
  if (!data.vigenciaInicio) return { error: 'Informe a vigência inicial.' };
  if (body.vigenciaFim && (!data.vigenciaFim || data.vigenciaFim < data.vigenciaInicio)) return { error: 'A vigência final não pode ser anterior à inicial.' };
  if (!statuses.includes(data.status)) return { error: 'Situação inválida.' };
  return { data };
};

const parseBenefit = (body) => {
  const data = { nome: text(body.nome), descricao: text(body.descricao) || null, status: text(body.status) || 'ativo' };
  if (!data.nome || data.nome.length > 120) return { error: 'Informe o nome do benefício (até 120 caracteres).' };
  if (data.descricao && data.descricao.length > 255) return { error: 'A descrição deve ter no máximo 255 caracteres.' };
  if (!statuses.includes(data.status)) return { error: 'Situação inválida.' };
  return { data };
};

const crud = ({ model, parse, present, searchFields, orderBy, label }) => ({
  list: async (req, res, next) => {
    try {
      const where = { deletedAt: null };
      const q = text(req.query.q);
      if (q) where.OR = searchFields.map((field) => ({ [field]: { contains: q } }));
      if (statuses.includes(text(req.query.status))) where.status = text(req.query.status);
      const rows = await prisma[model].findMany({ where, orderBy });
      return ok(res, rows.map(present));
    } catch (error) { return next(error); }
  },
  create: async (req, res, next) => {
    try {
      const { data, error } = parse(req.body);
      if (error) return bad(res, error);
      const row = await prisma[model].create({ data: { ...data, atualizadoPorId: Number(req.user.id) } });
      await prisma.auditLog.create({ data: { actorId: Number(req.user.id), action: `${model.toUpperCase()}_CREATED`, details: { id: row.id } } });
      return created(res, present(row), `${label} criado com sucesso.`);
    } catch (error) { return next(error); }
  },
  update: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) return bad(res, 'Identificador inválido.');
      if (!(await prisma[model].findFirst({ where: { id, deletedAt: null } }))) return notFound(res, `${label} não encontrado.`);
      const { data, error } = parse(req.body);
      if (error) return bad(res, error);
      const row = await prisma[model].update({ where: { id }, data: { ...data, atualizadoPorId: Number(req.user.id) } });
      await prisma.auditLog.create({ data: { actorId: Number(req.user.id), action: `${model.toUpperCase()}_UPDATED`, details: { id } } });
      return ok(res, present(row), `${label} atualizado com sucesso.`);
    } catch (error) { return next(error); }
  },
  remove: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) return bad(res, 'Identificador inválido.');
      const found = await prisma[model].findFirst({ where: { id, deletedAt: null } });
      if (!found) return notFound(res, `${label} não encontrado.`);
      await prisma[model].update({ where: { id }, data: { deletedAt: new Date(), status: 'inativo', atualizadoPorId: Number(req.user.id) } });
      await prisma.auditLog.create({ data: { actorId: Number(req.user.id), action: `${model.toUpperCase()}_DELETED`, details: { id } } });
      return ok(res, { id }, `${label} removido com sucesso.`);
    } catch (error) { return next(error); }
  },
});

export const rates = crud({ model: 'tabelaFinanciamento', parse: parseRate, present: presentRate, searchFields: ['instituicao', 'produto'], orderBy: [{ status: 'asc' }, { instituicao: 'asc' }, { taxa: 'asc' }], label: 'Tabela' });
export const benefits = crud({ model: 'beneficio', parse: parseBenefit, present: (row) => row, searchFields: ['nome', 'descricao'], orderBy: [{ status: 'asc' }, { nome: 'asc' }], label: 'Benefício' });
