import { prisma } from '../config/database.js';
import { ok } from '../utils/response.js';

const parseDate = (value, endOfDay = false) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const input = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const date = new Date(`${input}T00:00:00.000Z`);
    if (date.toISOString().slice(0, 10) !== input) return null;
    if (endOfDay) date.setUTCHours(23, 59, 59, 999);
    return date;
  }
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
};

const positiveInteger = (value) => {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
};

export const listAuditLogs = async (req, res) => {
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const pageSize = req.query.pageSize === undefined ? 25 : Number(req.query.pageSize);
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100 || !Number.isSafeInteger((page - 1) * pageSize)) {
    return res.status(400).json({ success: false, error: 'INVALID_PAGINATION', message: 'A página deve ser positiva e o tamanho deve estar entre 1 e 100.' });
  }

  const actorId = req.query.actorId === undefined ? undefined : positiveInteger(req.query.actorId);
  if (req.query.actorId !== undefined && actorId === null) return res.status(400).json({ success: false, error: 'INVALID_ACTOR', message: 'O identificador do ator é inválido.' });
  const action = String(req.query.action || '').trim();
  if (action.length > 100) return res.status(400).json({ success: false, error: 'INVALID_ACTION', message: 'A ação deve ter no máximo 100 caracteres.' });
  const from = req.query.from === undefined ? undefined : parseDate(req.query.from);
  const to = req.query.to === undefined ? undefined : parseDate(req.query.to, true);
  if (req.query.from !== undefined && !from || req.query.to !== undefined && !to) {
    return res.status(400).json({ success: false, error: 'INVALID_DATE', message: 'Informe datas válidas para o período.' });
  }
  if (from && to && from > to) return res.status(400).json({ success: false, error: 'INVALID_DATE_RANGE', message: 'A data inicial deve ser anterior ou igual à data final.' });

  const where = {
    ...(actorId ? { actorId } : {}),
    ...(action ? { action: { contains: action } } : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, nome: true, email: true, perfil: true } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);
  return ok(res, { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } }, 'Registros de auditoria carregados.');
};
