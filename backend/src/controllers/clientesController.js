import { prisma } from '../config/database.js';
import { created, notFound, ok } from '../utils/response.js';
import { storeScope, writeStoreId } from '../utils/storeScope.js';
import { digitsOnly, isValidCnpj, isValidCpf } from '../utils/customerValidation.js';

const roleAliases = { ADMINISTRADOR: 'ADMIN', GERENTE: 'MANAGER', VENDEDOR: 'SELLER', SUPORTE: 'SUPPORT' };
const roleOf = (user) => {
  const role = String(user?.perfil || user?.role || '').trim().toUpperCase();
  return roleAliases[role] || role;
};
const sellerForUser = async (user) => prisma.vendedor.findFirst({
  where: { usuarioId: Number(user.id), status: 'ativo' },
  select: { id: true, lojaId: true, usuario: { select: { gerenteId: true } } },
});
const customerScope = async (user) => {
  const role = roleOf(user);
  if (['ADMIN', 'SUPPORT'].includes(role)) return {};
  if (role === 'MANAGER') return { OR: [{ gerenteId: Number(user.id) }, { vendedor: { usuario: { gerenteId: Number(user.id) } } }] };
  const seller = await sellerForUser(user);
  return { vendedorId: seller?.id ?? -1 };
};
const validateCliente = (body, existing = {}) => {
  const merged = { ...existing, ...body };
  const tipoPessoa = String(merged.tipoPessoa || merged.type || 'PF').trim().toUpperCase();
  const nome = String(merged.nome || merged.nomeCompleto || merged.full_name || '').trim();
  const razaoSocial = String(merged.razaoSocial || merged.company_name || '').trim();
  const documento = digitsOnly(merged.documento || merged.cpf || merged.cnpj);
  const telefone = digitsOnly(merged.telefone || merged.phone);
  const cep = digitsOnly(merged.cep || merged.zip_code);
  const estado = String(merged.estado || '').trim().toUpperCase();
  const email = String(merged.email || '').trim().toLowerCase();
  const rendaInput = merged.rendaMensal;
  const rendaMensal = rendaInput === undefined || rendaInput === null || rendaInput === '' ? 0 : Number(rendaInput);
  if (!['PF', 'PJ'].includes(tipoPessoa)) return { error: 'Selecione pessoa física ou jurídica.' };
  if (tipoPessoa === 'PF' && !nome) return { error: 'Nome completo é obrigatório para pessoa física.' };
  if (tipoPessoa === 'PJ' && !razaoSocial) return { error: 'Razão social é obrigatória para pessoa jurídica.' };
  if (tipoPessoa === 'PF' && !isValidCpf(documento)) return { error: 'Informe um CPF válido.' };
  if (tipoPessoa === 'PJ' && !isValidCnpj(documento)) return { error: 'Informe um CNPJ válido.' };
  if (telefone.length < 10 || telefone.length > 13) return { error: 'Informe um telefone válido com DDD.' };
  if (cep.length !== 8 || ['logradouro', 'numero', 'bairro', 'cidade'].some((key) => !String(merged[key] || '').trim()) || !/^[A-Z]{2}$/.test(estado)) return { error: 'Preencha o CEP e o endereço completo.' };
  if (email && (email.length > 191 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return { error: 'Informe um e-mail válido.' };
  if ([nome, razaoSocial, String(merged.nomeFantasia || ''), String(merged.logradouro || ''), String(merged.numero || ''), String(merged.complemento || ''), String(merged.bairro || ''), String(merged.cidade || ''), String(merged.ocupacao || '')].some((value) => value.length > 191)) return { error: 'Os campos de texto devem ter no máximo 191 caracteres.' };
  if (!Number.isFinite(rendaMensal) || rendaMensal < 0 || rendaMensal > 9999999999.99) return { error: 'Informe uma renda mensal igual ou maior que zero.' };
  return { cliente: {
    nome: tipoPessoa === 'PF' ? nome : razaoSocial,
    razaoSocial: tipoPessoa === 'PJ' ? razaoSocial : null,
    nomeFantasia: String(merged.nomeFantasia || '').trim() || null,
    documento,
    tipoPessoa: tipoPessoa.toLowerCase(),
    email: email || null,
    telefone,
    cep,
    logradouro: String(merged.logradouro).trim(),
    numero: String(merged.numero).trim(),
    complemento: String(merged.complemento || '').trim() || null,
    bairro: String(merged.bairro).trim(),
    cidade: String(merged.cidade).trim(),
    estado,
    rendaMensal,
    ocupacao: String(merged.ocupacao || '').trim() || null,
  } };
};
const presentCustomer = (customer) => ({ ...customer, rendaMensal: Number(customer.rendaMensal || 0) });
const customerSortFields = {
  createdAt: 'createdAt',
  name: 'nome',
  nome: 'nome',
  email: 'email',
  status: 'status',
  type: 'tipoPessoa',
  tipoPessoa: 'tipoPessoa',
};
const parsePositiveInteger = (value, fallback) => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};
const customerWhere = (req, scope, search, tipo, status) => {
  const searchDigits = digitsOnly(search);
  return {
    deletedAt: null,
    ...scope,
    ...storeScope(req.user),
    ...(tipo ? { tipoPessoa: tipo } : {}),
    ...(status ? { status } : {}),
    ...(search ? { OR: [
      { nome: { contains: search } },
      { razaoSocial: { contains: search } },
      { nomeFantasia: { contains: search } },
      ...(searchDigits ? [{ documento: { contains: searchDigits } }, { telefone: { contains: searchDigits } }] : []),
      { email: { contains: search } },
    ] } : {}),
  };
};

export const listClientes = async (req, res) => {
  const search = String(req.query.search || req.query.q || '').trim();
  if (search.length > 191) return res.status(400).json({ success: false, error: 'SEARCH_TOO_LONG', message: 'A busca deve ter no máximo 191 caracteres.' });
  const tipo = String(req.query.tipo || '').trim().toLowerCase();
  const status = String(req.query.status || '').trim().toLowerCase();
  if (tipo && !['pf', 'pj'].includes(tipo)) return res.status(400).json({ success: false, error: 'INVALID_CUSTOMER_TYPE', message: 'O tipo de pessoa deve ser PF ou PJ.' });
  if (status && !['ativo', 'inativo'].includes(status)) return res.status(400).json({ success: false, error: 'INVALID_CUSTOMER_STATUS', message: 'O status deve ser ativo ou inativo.' });
  const paginated = req.query.page !== undefined || req.query.pageSize !== undefined;
  const page = parsePositiveInteger(req.query.page, 1);
  const pageSize = parsePositiveInteger(req.query.pageSize, 25);
  if (paginated && (page === null || pageSize === null || pageSize > 100 || !Number.isSafeInteger((page - 1) * pageSize))) return res.status(400).json({ success: false, error: 'INVALID_PAGINATION', message: 'A página deve ser positiva e o tamanho deve estar entre 1 e 100.' });
  const sortBy = String(req.query.sortBy || 'createdAt');
  const sortField = customerSortFields[sortBy];
  const sortOrder = String(req.query.sortOrder || 'desc').toLowerCase();
  if (!sortField || !['asc', 'desc'].includes(sortOrder)) return res.status(400).json({ success: false, error: 'INVALID_SORT', message: 'A ordenação solicitada não é permitida.' });

  const scope = await customerScope(req.user);
  const where = customerWhere(req, scope, search, tipo, status);
  const [customers, total, typeCounts] = await Promise.all([
    prisma.cliente.findMany({
      where,
      orderBy: [{ [sortField]: sortOrder }, { id: 'desc' }],
      ...(paginated ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
    }),
    paginated ? prisma.cliente.count({ where }) : Promise.resolve(null),
    paginated ? prisma.cliente.groupBy({ by: ['tipoPessoa'], where: { deletedAt: null, ...scope, ...storeScope(req.user), ...(status ? { status } : {}) }, _count: { _all: true } }) : Promise.resolve(null),
  ]);
  const records = customers.map(presentCustomer);
  if (!paginated) return ok(res, records, 'Clientes carregados com sucesso');
  const counts = Object.fromEntries((typeCounts || []).map((item) => [item.tipoPessoa, item._count._all]));
  return ok(res, {
    items: records,
    pagination: { page, pageSize, total: total || 0, totalPages: Math.ceil((total || 0) / pageSize) },
    summary: { total: Object.values(counts).reduce((sum, count) => sum + count, 0), pf: counts.pf || 0, pj: counts.pj || 0 },
  }, 'Clientes carregados com sucesso');
};

export const getClienteById = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ success: false, error: 'INVALID_CUSTOMER_ID', message: 'Identificador de cliente inválido.' });
  const scope = await customerScope(req.user);
  const cliente = await prisma.cliente.findFirst({ where: { id, deletedAt: null, ...scope, ...storeScope(req.user) } });
  if (!cliente) return notFound(res, 'Cliente não encontrado');
  return ok(res, presentCustomer(cliente), 'Cliente encontrado');
};

const assignedSeller = async (req, lojaId) => {
  const role = roleOf(req.user);
  if (role === 'SELLER') {
    const seller = await sellerForUser(req.user);
    if (!seller || seller.lojaId !== lojaId) return { error: 'Não há cadastro de vendedor ativo vinculado a esta loja.' };
    return { vendedorId: seller.id, gerenteId: seller.usuario?.gerenteId || null };
  }
  if (role === 'MANAGER') return { vendedorId: null, gerenteId: Number(req.user.id) };
  if (!req.body.vendedorId) return { vendedorId: null, gerenteId: null };
  const sellerId = Number(req.body.vendedorId);
  if (!Number.isSafeInteger(sellerId) || sellerId < 1) return { error: 'Selecione um vendedor válido.' };
  const seller = await prisma.vendedor.findFirst({
    where: { id: sellerId, lojaId, status: 'ativo', usuario: { status: 'ativo' } },
    select: { id: true, usuario: { select: { gerenteId: true } } },
  });
  if (!seller) return { error: 'O vendedor selecionado deve estar ativo e vinculado à mesma loja.' };
  return { vendedorId: seller.id, gerenteId: seller.usuario?.gerenteId || null };
};

export const createCliente = async (req, res) => {
  const { cliente, error } = validateCliente(req.body);
  if (error) return res.status(400).json({ success: false, error: 'INVALID_CUSTOMER', message: error });
  const role = roleOf(req.user);
  const lojaId = ['ADMIN', 'SUPPORT'].includes(role)
    ? writeStoreId(req.user, req.body.lojaId)
    : Number(req.user.lojaId) || null;
  if (!lojaId) return res.status(400).json({ success: false, error: 'STORE_REQUIRED', message: 'Selecione uma loja específica antes de cadastrar o cliente.' });
  const assignment = await assignedSeller(req, lojaId);
  if (assignment.error) return res.status(400).json({ success: false, error: 'INVALID_SELLER', message: assignment.error });
  try {
    const record = await prisma.$transaction(async (tx) => {
      const createdCustomer = await tx.cliente.create({ data: { ...cliente, ...assignment, lojaId, status: 'ativo' } });
      await tx.auditLog.create({
        data: { actorId: Number(req.user.id), action: 'CUSTOMER_CREATED', details: { clienteId: createdCustomer.id, lojaId, vendedorId: assignment.vendedorId } },
      });
      return createdCustomer;
    });
    return created(res, presentCustomer(record), 'Cliente criado com sucesso');
  } catch (createError) {
    if (createError.code === 'P2002') return res.status(409).json({ success: false, error: 'DUPLICATE_DOCUMENT', message: 'Já existe um cliente com este CPF/CNPJ.' });
    throw createError;
  }
};

export const updateCliente = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ success: false, error: 'INVALID_CUSTOMER_ID', message: 'Identificador de cliente inválido.' });
  const scope = await customerScope(req.user);
  const existing = await prisma.cliente.findFirst({ where: { id, deletedAt: null, ...scope, ...storeScope(req.user) } });
  if (!existing) return notFound(res, 'Cliente não encontrado');
  const { cliente, error } = validateCliente(req.body, existing);
  if (error) return res.status(400).json({ success: false, error: 'INVALID_CUSTOMER', message: error });
  try {
    const record = await prisma.$transaction(async (tx) => {
      const updatedCustomer = await tx.cliente.update({ where: { id }, data: { ...cliente, updatedAt: new Date() } });
      await tx.auditLog.create({
        data: { actorId: Number(req.user.id), action: 'CUSTOMER_UPDATED', details: { clienteId: id, documentoAlterado: cliente.documento !== existing.documento } },
      });
      return updatedCustomer;
    });
    return ok(res, presentCustomer(record), 'Cliente atualizado com sucesso');
  } catch (updateError) {
    if (updateError.code === 'P2002') return res.status(409).json({ success: false, error: 'DUPLICATE_DOCUMENT', message: 'Já existe um cliente com este CPF/CNPJ.' });
    throw updateError;
  }
};

export const deleteCliente = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ success: false, error: 'INVALID_CUSTOMER_ID', message: 'Identificador de cliente inválido.' });
  const scope = await customerScope(req.user);
  const existing = await prisma.cliente.findFirst({ where: { id, deletedAt: null, ...scope, ...storeScope(req.user) } });
  if (!existing) return notFound(res, 'Cliente não encontrado');
  await prisma.$transaction(async (tx) => {
    await tx.cliente.update({ where: { id }, data: { deletedAt: new Date(), status: 'inativo', updatedAt: new Date() } });
    await tx.auditLog.create({
      data: { actorId: Number(req.user.id), action: 'CUSTOMER_ARCHIVED', details: { clienteId: id } },
    });
  });
  return ok(res, null, 'Cliente arquivado. O histórico permanece preservado.');
};
