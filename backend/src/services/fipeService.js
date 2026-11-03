const fipeBaseUrl = () => (process.env.FIPE_API_URL || 'https://fipe.parallelum.com.br/api/v2').replace(/\/+$/, '');
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const cache = new Map();

export class FipeError extends Error {
  constructor(message, status = 502, code = 'FIPE_UNAVAILABLE') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const fetchFipe = async (path) => {
  const cached = cache.get(path);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  const request = (withToken) => {
    const headers = { Accept: 'application/json' };
    if (withToken && process.env.FIPE_API_TOKEN) headers['X-Subscription-Token'] = process.env.FIPE_API_TOKEN;
    return fetch(`${fipeBaseUrl()}${path}`, { headers, signal: AbortSignal.timeout(10000) });
  };
  let response;
  try {
    response = await request(true);
    // Token inválido ou expirado: tenta como consulta anônima.
    if ((response.status === 401 || response.status === 403) && process.env.FIPE_API_TOKEN) response = await request(false);
  } catch {
    if (cached) return cached.data;
    throw new FipeError('Serviço FIPE indisponível no momento. Tente novamente.');
  }
  if (response.status === 404) throw new FipeError('Registro não encontrado na Tabela FIPE.', 404, 'FIPE_NOT_FOUND');
  if (response.status === 429) {
    if (cached) return cached.data;
    throw new FipeError('Limite de consultas da FIPE atingido. Tente novamente mais tarde.', 429, 'FIPE_RATE_LIMITED');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) {
    if (cached) return cached.data;
    throw new FipeError('Não foi possível consultar a Tabela FIPE.');
  }
  cache.set(path, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
};

const idPattern = /^[A-Za-z0-9-]+$/;
const requireId = (value, label) => {
  const id = String(value ?? '').trim();
  if (!idPattern.test(id)) throw new FipeError(`${label} inválido.`, 400, 'BAD_FIPE_PARAMETER');
  return id;
};

const toOptions = (items) => (Array.isArray(items) ? items.map(({ code, name }) => ({ code: String(code), name: String(name) })) : []);

export const vehicleTypes = ['cars', 'motorcycles', 'trucks'];
const requireType = (value) => {
  const type = String(value || 'cars').trim();
  if (!vehicleTypes.includes(type)) throw new FipeError('Tipo de veículo inválido.', 400, 'BAD_FIPE_PARAMETER');
  return type;
};

export const listBrands = async (type) => toOptions(await fetchFipe(`/${requireType(type)}/brands`));
export const listModels = async (type, brandId) => toOptions(await fetchFipe(`/${requireType(type)}/brands/${requireId(brandId, 'Marca')}/models`));
export const listYears = async (type, brandId, modelId) => toOptions(
  await fetchFipe(`/${requireType(type)}/brands/${requireId(brandId, 'Marca')}/models/${requireId(modelId, 'Modelo')}/years`),
);

const parseBrlPrice = (value) => Number(String(value ?? '').replace(/[^\d,]/g, '').replace(',', '.'));

export const getPrice = async (type, brandId, modelId, yearId) => {
  const data = await fetchFipe(`/${requireType(type)}/brands/${requireId(brandId, 'Marca')}/models/${requireId(modelId, 'Modelo')}/years/${requireId(yearId, 'Ano')}`);
  const price = parseBrlPrice(data.price);
  if (!Number.isFinite(price)) throw new FipeError('A FIPE retornou um valor inválido para este veículo.');
  // O código 32000 identifica veículo zero km; o ano-modelo equivale ao ano corrente.
  const modelYear = Number(data.modelYear) === 32000 ? new Date().getFullYear() : Number(data.modelYear);
  return {
    brand: data.brand, model: data.model, modelYear, fuel: data.fuel, vehicleType: requireType(type),
    codeFipe: data.codeFipe, price, referenceMonth: data.referenceMonth,
  };
};
