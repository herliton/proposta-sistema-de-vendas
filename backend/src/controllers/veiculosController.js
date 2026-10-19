import fs from 'node:fs';
import path from 'node:path';
import { vehicleUploadDirectory } from '../middleware/vehicleUpload.js';
import { prisma } from '../config/database.js';
import { ok, created, notFound } from '../utils/response.js';
import { storeScope, writeStoreId } from '../utils/storeScope.js';

const statusAliases = { DISPONIVEL: 'AVAILABLE', AVAILABLE: 'AVAILABLE', IN_NEGOTIATION: 'IN_NEGOTIATION', EM_NEGOCIACAO: 'IN_NEGOTIATION', NEGOCIACAO: 'IN_NEGOTIATION', SOLD: 'SOLD', VENDIDO: 'SOLD' };
const normalizeStatus = (status) => statusAliases[String(status || 'AVAILABLE').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_')] || 'AVAILABLE';
const dbStatus = (status) => ({ AVAILABLE: 'disponivel', IN_NEGOTIATION: 'em_negociacao', SOLD: 'vendido' })[status];
const activeProposalStatuses = ['pendente', 'em análise', 'em analise', 'aguardando', 'SIMULATION', 'PROPOSAL', 'proposal', 'simulacao', 'proposta'];
const vehicleSortFields = {
  createdAt: 'createdAt', brand: 'marca', marca: 'marca', model: 'modelo', modelo: 'modelo',
  manufacturingYear: 'anoFabricacao', anoFabricacao: 'anoFabricacao', modelYear: 'anoModelo', anoModelo: 'anoModelo',
  suggestedPrice: 'precoSugerido', precoSugerido: 'precoSugerido', minimumPrice: 'precoMinimo', precoMinimo: 'precoMinimo', status: 'status',
};
const queryInteger = (value, fallback) => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};
const queryPrice = (value) => {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};
const parsePrice = (value) => {
  if (typeof value === 'number') return value;
  const normalized = String(value ?? '').trim().replace(/R\$\s?/gi, '').replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  return Number(normalized);
};
const normalizeVehicle = (vehicle) => ({
  ...vehicle, marca: vehicle.marca || '', modelo: vehicle.modelo || '', anoFabricacao: Number(vehicle.anoFabricacao || vehicle.ano || 0),
  anoModelo: Number(vehicle.anoModelo || vehicle.anoFabricacao || vehicle.ano || 0), codigoFipe: vehicle.codigoFipe || '',
  valorFipe: Number(vehicle.valorFipe || 0), precoSugerido: Number(vehicle.precoSugerido || 0), precoMinimo: Number(vehicle.precoMinimo || 0),
  fotos: { right: vehicle.fotoDireita || '', left: vehicle.fotoEsquerda || '', front: vehicle.fotoFrente || '', rear: vehicle.fotoTraseira || '', interior: vehicle.fotoInterior || '' },
  videoUrl: vehicle.videoUrl || '', status: normalizeStatus(vehicle.status), simulacoesAtivas: vehicle._count?.propostas || 0,
});
const validateVehicle = (body, existing = {}) => {
  const merged = { ...existing, ...body };
  const vehicle = {
    marca: String(merged.marca || '').trim(), modelo: String(merged.modelo || '').trim(),
    anoFabricacao: Number(merged.anoFabricacao ?? merged.ano), anoModelo: Number(merged.anoModelo ?? merged.anoFabricacao ?? merged.ano),
    codigoFipe: String(merged.codigoFipe || '').trim(), valorFipe: parsePrice(merged.valorFipe ?? 0),
    precoSugerido: parsePrice(merged.precoSugerido ?? merged.valor), precoMinimo: parsePrice(merged.precoMinimo),
    placa: String(merged.placa || '').trim().toUpperCase(), status: normalizeStatus(merged.status),
    observacoes: String(merged.observacoes || ''), fotos: merged.fotos || {}, videoUrl: String(merged.videoUrl || '').trim(),
    videoDuracaoSegundos: Number(merged.videoDuracaoSegundos || 0),
  };
  if (!vehicle.marca || !vehicle.modelo) return { error: 'Marca e modelo são obrigatórios.' };
  if (!Number.isInteger(vehicle.anoFabricacao) || !Number.isInteger(vehicle.anoModelo) || vehicle.anoFabricacao < 1900 || vehicle.anoModelo < vehicle.anoFabricacao || vehicle.anoModelo > new Date().getFullYear() + 2) return { error: 'Informe anos de fabricação e modelo válidos.' };
  if (!Number.isFinite(vehicle.precoSugerido) || !Number.isFinite(vehicle.precoMinimo) || vehicle.precoSugerido < 0 || vehicle.precoMinimo < 0) return { error: 'Preço sugerido e preço mínimo não podem ser negativos.' };
  if (vehicle.precoSugerido < vehicle.precoMinimo) return { error: 'O preço sugerido não pode ser menor que o preço mínimo.' };
  if (!Number.isFinite(vehicle.valorFipe) || vehicle.valorFipe < 0) return { error: 'O valor FIPE não pode ser negativo.' };
  if (!['AVAILABLE', 'IN_NEGOTIATION', 'SOLD'].includes(vehicle.status)) return { error: 'Status do veículo inválido.' };
  const requiredPhotos = ['right', 'left', 'front', 'rear', 'interior'];
  if (requiredPhotos.some((key) => !String(vehicle.fotos[key] || '').trim())) return { error: 'Informe as cinco fotos obrigatórias.' };
  const validUrl = (url) => { if (url.startsWith('/uploads/vehicles/')) return true; try { return ['http:', 'https:'].includes(new URL(url).protocol); } catch { return false; } };
  if (requiredPhotos.some((key) => !validUrl(String(vehicle.fotos[key])))) return { error: 'Cada foto deve ter uma URL HTTP ou HTTPS válida.' };
  if (vehicle.videoUrl && (!Number.isFinite(vehicle.videoDuracaoSegundos) || vehicle.videoDuracaoSegundos <= 0 || vehicle.videoDuracaoSegundos > 60)) return { error: 'O vídeo deve ter duração entre 1 e 60 segundos.' };
  if (vehicle.videoUrl && !validUrl(vehicle.videoUrl)) return { error: 'Informe uma URL HTTP ou HTTPS válida para o vídeo.' };
  return { vehicle };
};
const vehicleData = (vehicle) => ({
  marca: vehicle.marca, modelo: vehicle.modelo, ano: vehicle.anoFabricacao, anoFabricacao: vehicle.anoFabricacao,
  anoModelo: vehicle.anoModelo, codigoFipe: vehicle.codigoFipe || null, valorFipe: vehicle.valorFipe ?? null,
  precoSugerido: vehicle.precoSugerido, precoMinimo: vehicle.precoMinimo, placa: vehicle.placa || null,
  status: dbStatus(vehicle.status), observacoes: vehicle.observacoes || null,
  fotoDireita: vehicle.fotos.right, fotoEsquerda: vehicle.fotos.left, fotoFrente: vehicle.fotos.front,
  fotoTraseira: vehicle.fotos.rear, fotoInterior: vehicle.fotos.interior, videoUrl: vehicle.videoUrl || null,
  videoDuracao: vehicle.videoUrl ? vehicle.videoDuracaoSegundos : null, updatedAt: new Date(),
});

export const listVeiculos = async (req, res) => {
  const { search, q, brand, marca, model, modelo, status, mfg_year, anoFabricacao, model_year, anoModelo, minPrice, maxPrice, min_price, max_price, sortBy, sortOrder, page, pageSize } = req.query;
  const term = String(search || q || '').trim();
  const brandValue = String(brand || marca || '').trim();
  const modelValue = String(model || modelo || '').trim();
  const normalizedStatus = status && status !== 'ALL' ? statusAliases[String(status).trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_')] : undefined;
  if (status && status !== 'ALL' && !normalizedStatus) return res.status(400).json({ success: false, error: 'INVALID_STATUS', message: 'O status informado não é válido.' });
  const mfg = queryInteger(mfg_year ?? anoFabricacao, undefined);
  const modelYear = queryInteger(model_year ?? anoModelo, undefined);
  if ((mfg_year !== undefined || anoFabricacao !== undefined) && (mfg === null || mfg < 1900) || (model_year !== undefined || anoModelo !== undefined) && (modelYear === null || modelYear < 1900)) {
    return res.status(400).json({ success: false, error: 'INVALID_YEAR', message: 'Informe um ano válido para filtrar o estoque.' });
  }
  const minimumPrice = queryPrice(minPrice ?? min_price);
  const maximumPrice = queryPrice(maxPrice ?? max_price);
  if (minimumPrice === null || maximumPrice === null || (minimumPrice !== undefined && maximumPrice !== undefined && minimumPrice > maximumPrice)) {
    return res.status(400).json({ success: false, error: 'INVALID_PRICE_RANGE', message: 'A faixa de preço informada é inválida.' });
  }
  const isPaginated = page !== undefined || pageSize !== undefined;
  const pageNumber = queryInteger(page, 1);
  const pageLimit = queryInteger(pageSize, 25);
  if (isPaginated && (pageNumber === null || pageNumber < 1 || pageLimit === null || pageLimit < 1 || pageLimit > 100)) {
    return res.status(400).json({ success: false, error: 'INVALID_PAGINATION', message: 'A página deve ser positiva e o tamanho deve estar entre 1 e 100.' });
  }
  const requestedSort = String(sortBy || 'createdAt');
  const sortField = vehicleSortFields[requestedSort];
  const order = String(sortOrder || 'desc').toLowerCase();
  if (!sortField || !['asc', 'desc'].includes(order)) return res.status(400).json({ success: false, error: 'INVALID_SORT', message: 'A ordenação solicitada não é permitida.' });
  const commonFilters = {
    deletedAt: null,
    ...storeScope(req.user),
    ...(brandValue ? { marca: { equals: brandValue, mode: 'insensitive' } } : {}),
    ...(modelValue ? { modelo: { contains: modelValue, mode: 'insensitive' } } : {}),
    ...(mfg !== undefined ? { anoFabricacao: mfg } : {}),
    ...(modelYear !== undefined ? { anoModelo: modelYear } : {}),
    ...(minimumPrice !== undefined || maximumPrice !== undefined ? { precoSugerido: { ...(minimumPrice !== undefined ? { gte: minimumPrice } : {}), ...(maximumPrice !== undefined ? { lte: maximumPrice } : {}) } } : {}),
    ...(term ? { OR: [{ marca: { contains: term, mode: 'insensitive' } }, { modelo: { contains: term, mode: 'insensitive' } }, { placa: { contains: term, mode: 'insensitive' } }] } : {}),
  };
  const where = { ...commonFilters, ...(normalizedStatus ? { status: dbStatus(normalizedStatus) } : {}) };
  const include = { _count: { select: { propostas: { where: { deletedAt: null, status: { in: activeProposalStatuses } } } } } };
  const [vehicles, total, statusCounts] = await Promise.all([
    prisma.veiculo.findMany({
      where,
      include,
      orderBy: [{ [sortField]: order }, { id: 'desc' }],
      ...(isPaginated ? { skip: (pageNumber - 1) * pageLimit, take: pageLimit } : {}),
    }),
    isPaginated ? prisma.veiculo.count({ where }) : Promise.resolve(null),
    isPaginated ? prisma.veiculo.groupBy({ by: ['status'], where: commonFilters, _count: { _all: true } }) : Promise.resolve(null),
  ]);
  const records = vehicles.map(normalizeVehicle);
  if (!isPaginated) return ok(res, records, 'Veículos carregados com sucesso');
  const counts = Object.fromEntries((statusCounts || []).map((item) => [item.status, item._count._all]));
  return ok(res, {
    items: records,
    pagination: { page: pageNumber, pageSize: pageLimit, total: total || 0, totalPages: Math.ceil((total || 0) / pageLimit) },
    summary: { available: counts.disponivel || 0, inNegotiation: counts.em_negociacao || 0, sold: counts.vendido || 0 },
  }, 'Veículos carregados com sucesso');
};

export const lookupFipe = async (req, res) => {
  const code = String(req.params.fipeCode || '').trim();
  if (!/^\d{6}-\d$/.test(code)) return res.status(400).json({ success: false, error: 'BAD_FIPE_CODE', message: 'Informe um código FIPE no formato 000000-0.' });
  try {
    const response = await fetch(`https://brasilapi.com.br/api/fipe/preco/v1/${encodeURIComponent(code)}`, { signal: AbortSignal.timeout(8000) });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result) return res.status(response.status === 404 ? 404 : 502).json({ success: false, error: 'FIPE_LOOKUP_FAILED', message: 'Não foi possível consultar esse código na Tabela FIPE.' });
    return ok(res, { ...result, valorNumerico: parsePrice(result.valor) }, 'Consulta FIPE realizada com sucesso');
  } catch {
    return res.status(502).json({ success: false, error: 'FIPE_UNAVAILABLE', message: 'Serviço FIPE indisponível no momento. Tente novamente.' });
  }
};

export const getVeiculoById = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ success: false, error: 'INVALID_VEHICLE_ID', message: 'Identificador de veículo inválido.' });
  const vehicle = await prisma.veiculo.findFirst({
    where: { id, deletedAt: null, ...storeScope(req.user) },
    include: { _count: { select: { propostas: { where: { status: { in: activeProposalStatuses }, deletedAt: null } } } } },
  });
  if (!vehicle) return notFound(res, 'Veículo não encontrado');
  return ok(res, normalizeVehicle(vehicle), 'Veículo encontrado');
};

export const createVeiculo = async (req, res) => {
  const { vehicle, error } = validateVehicle(req.body);
  if (error) return res.status(400).json({ success: false, error: 'INVALID_VEHICLE', message: error });
  if (vehicle.status !== 'AVAILABLE') return res.status(400).json({ success: false, error: 'STATUS_TRANSITION_REQUIRED', message: 'Veículos novos devem ser cadastrados como disponíveis.' });
  const lojaId = writeStoreId(req.user, req.body.lojaId);
  if (!lojaId) return res.status(400).json({ success: false, error: 'STORE_REQUIRED', message: 'Selecione uma loja específica antes de cadastrar o veículo.' });
  const record = await prisma.$transaction(async (tx) => {
    const createdVehicle = await tx.veiculo.create({ data: { ...vehicleData(vehicle), lojaId }, include: { _count: { select: { propostas: true } } } });
    await tx.auditLog.create({ data: { actorId: Number(req.user.id), action: 'VEHICLE_CREATED', details: { veiculoId: createdVehicle.id, lojaId } } });
    return createdVehicle;
  });
  return created(res, normalizeVehicle(record), 'Veículo criado com sucesso');
};

export const updateVeiculo = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ success: false, error: 'INVALID_VEHICLE_ID', message: 'Identificador de veículo inválido.' });
  const existing = await prisma.veiculo.findFirst({ where: { id, deletedAt: null, ...storeScope(req.user) } });
  if (!existing) return notFound(res, 'Veículo não encontrado');
  if (req.body.status !== undefined) {
    const statusKey = String(req.body.status).trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
    if (!statusAliases[statusKey] || dbStatus(statusAliases[statusKey]) !== existing.status) {
      return res.status(400).json({ success: false, error: 'STATUS_TRANSITION_REQUIRED', message: 'A alteração de status deve ser realizada pelo fluxo comercial correspondente.' });
    }
  }
  const { vehicle, error } = validateVehicle(req.body, normalizeVehicle(existing));
  if (error) return res.status(400).json({ success: false, error: 'INVALID_VEHICLE', message: error });
  const updated = await prisma.$transaction(async (tx) => {
    const record = await tx.veiculo.update({ where: { id }, data: vehicleData(vehicle), include: { _count: { select: { propostas: true } } } });
    await tx.auditLog.create({ data: { actorId: Number(req.user.id), action: 'VEHICLE_UPDATED', details: { veiculoId: id } } });
    return record;
  });
  return ok(res, normalizeVehicle(updated), 'Veículo atualizado com sucesso');
};

export const deleteVeiculo = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ success: false, error: 'INVALID_VEHICLE_ID', message: 'Identificador de veículo inválido.' });
  const existing = await prisma.veiculo.findFirst({ where: { id, deletedAt: null, ...storeScope(req.user) } });
  if (!existing) return notFound(res, 'Veículo não encontrado');
  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM Veiculo WHERE id = ${id} FOR UPDATE`;
      if (await tx.proposta.count({ where: { veiculoId: id } })) {
        const conflict = new Error('Veículos com histórico comercial não podem ser arquivados.');
        conflict.code = 'VEHICLE_HAS_HISTORY';
        throw conflict;
      }
      await tx.veiculo.update({ where: { id }, data: { deletedAt: new Date(), updatedAt: new Date() } });
      await tx.auditLog.create({ data: { actorId: Number(req.user.id), action: 'VEHICLE_ARCHIVED', details: { veiculoId: id } } });
    });
  } catch (error) {
    if (error.code === 'VEHICLE_HAS_HISTORY') return res.status(409).json({ success: false, error: error.code, message: error.message });
    throw error;
  }
  return ok(res, null, 'Veículo arquivado. O histórico permanece preservado.');
};

export const uploadVehicleMedia = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'FILE_REQUIRED', message: 'Selecione um arquivo para enviar.' });
  const isVideo = req.params.kind === 'video';
  if (!isVideo && req.file.size > 10 * 1024 * 1024) {
    fs.unlinkSync(path.join(vehicleUploadDirectory, req.file.filename));
    return res.status(413).json({ success: false, error: 'FILE_TOO_LARGE', message: 'Cada foto deve ter no máximo 10 MB.' });
  }
  return created(res, { url: `/uploads/vehicles/${req.file.filename}`, filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size }, 'Arquivo carregado com sucesso');
};
