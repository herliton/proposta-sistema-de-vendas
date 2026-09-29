import { prisma } from '../config/database.js';
import { created, notFound, ok } from '../utils/response.js';
import { storeScope, writeStoreId } from '../utils/storeScope.js';

const digits = (value) => String(value || '').replace(/\D/g, '');
const roleOf = (user) => String(user?.perfil || user?.role || '').toUpperCase();
const sellerForUser = async (user) => prisma.vendedor.findFirst({ where: { usuarioId: Number(user.id) } });
const customerScope = async (user) => {
  const role = roleOf(user);
  if (['ADMIN', 'SUPPORT'].includes(role)) return {};
  if (role === 'MANAGER') return { OR: [{ gerenteId: Number(user.id) }, { vendedor: { usuario: { gerenteId: Number(user.id) } } }] };
  const seller = await sellerForUser(user);
  return { vendedorId: seller?.id ?? -1 };
};
const validateCliente = (body, existing = {}) => {
  const merged = { ...existing, ...body };
  const tipoPessoa = String(merged.tipoPessoa || merged.type || 'PF').toUpperCase();
  const nome = String(merged.nome || merged.nomeCompleto || merged.full_name || '').trim();
  const razaoSocial = String(merged.razaoSocial || merged.company_name || '').trim();
  const documento = digits(merged.documento || merged.cpf || merged.cnpj);
  const telefone = digits(merged.telefone || merged.phone);
  const cep = digits(merged.cep || merged.zip_code);
  if (!['PF', 'PJ'].includes(tipoPessoa)) return { error: 'Selecione pessoa física ou jurídica.' };
  if (tipoPessoa === 'PF' && !nome) return { error: 'Nome completo é obrigatório para pessoa física.' };
  if (tipoPessoa === 'PJ' && !razaoSocial) return { error: 'Razão social é obrigatória para pessoa jurídica.' };
  if ((tipoPessoa === 'PF' && documento.length !== 11) || (tipoPessoa === 'PJ' && documento.length !== 14)) return { error: `Informe um ${tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'} válido.` };
  if (telefone.length < 10 || telefone.length > 13) return { error: 'Informe um telefone válido com DDD.' };
  if (cep.length !== 8 || ['logradouro', 'numero', 'bairro', 'cidade', 'estado'].some((key) => !String(merged[key] || '').trim()) || String(merged.estado).trim().length !== 2) return { error: 'Preencha o CEP e o endereço completo.' };
  const email = String(merged.email || '').trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Informe um e-mail válido.' };
  return { cliente: {
    nome: tipoPessoa === 'PF' ? nome : razaoSocial, razaoSocial: tipoPessoa === 'PJ' ? razaoSocial : null,
    nomeFantasia: String(merged.nomeFantasia || '').trim() || null, documento, tipoPessoa: tipoPessoa.toLowerCase(), email: email || null,
    telefone, cep, logradouro: String(merged.logradouro).trim(), numero: String(merged.numero).trim(),
    complemento: String(merged.complemento || '').trim() || null, bairro: String(merged.bairro).trim(), cidade: String(merged.cidade).trim(),
    estado: String(merged.estado).trim().toUpperCase(), rendaMensal: Number(merged.rendaMensal) || 0, ocupacao: String(merged.ocupacao || '').trim() || null,
  } };
};
const presentCustomer = (customer) => ({ ...customer, rendaMensal: Number(customer.rendaMensal || 0) });

export const listClientes = async (req, res) => {
  const search = String(req.query.search || req.query.q || '').trim();
  const tipo = String(req.query.tipo || '').trim().toLowerCase();
  const scope = await customerScope(req.user);
  const clientes = await prisma.cliente.findMany({
    where: { deletedAt: null, ...scope, ...storeScope(req.user), ...(tipo ? { tipoPessoa: tipo } : {}), ...(search ? { OR: [
      { nome: { contains: search, mode: 'insensitive' } }, { razaoSocial: { contains: search, mode: 'insensitive' } },
      { documento: { contains: digits(search) || search } }, { email: { contains: search, mode: 'insensitive' } },
    ] } : {}) },
    orderBy: { createdAt: 'desc' },
  });
  return ok(res, clientes.map(presentCustomer), 'Clientes carregados com sucesso');
};

export const getClienteById = async (req, res) => {
  const scope = await customerScope(req.user);
  const cliente = await prisma.cliente.findFirst({ where: { id: Number(req.params.id), deletedAt: null, ...scope, ...storeScope(req.user) } });
  if (!cliente) return notFound(res, 'Cliente não encontrado');
  return ok(res, presentCustomer(cliente), 'Cliente encontrado');
};

export const createCliente = async (req, res) => {
  const { cliente, error } = validateCliente(req.body);
  if (error) return res.status(400).json({ success: false, error: 'INVALID_CUSTOMER', message: error });
  if (await prisma.cliente.findFirst({ where: { documento: cliente.documento, ...storeScope(req.user) } })) return res.status(409).json({ success: false, error: 'DUPLICATE_DOCUMENT', message: 'Já existe um cliente com este CPF/CNPJ.' });
  const role = roleOf(req.user);
  let vendedorId = null;
  let gerenteId = null;
  if (role === 'SELLER') {
    const seller = await sellerForUser(req.user);
    if (!seller) return res.status(409).json({ success: false, error: 'SELLER_PROFILE_MISSING', message: 'Não há cadastro de vendedor vinculado a este usuário.' });
    vendedorId = seller.id;
    gerenteId = req.user.gerenteId || null;
  } else if (role === 'MANAGER') gerenteId = Number(req.user.id);
  else if (req.body.vendedorId) vendedorId = Number(req.body.vendedorId);
  const lojaId = writeStoreId(req.user, req.body.lojaId);
  if (!lojaId) return res.status(400).json({ success: false, error: 'STORE_REQUIRED', message: 'Selecione uma loja específica antes de cadastrar o cliente.' });
  const record = await prisma.cliente.create({ data: { ...cliente, vendedorId, gerenteId, lojaId, status: 'ativo' } });
  return created(res, presentCustomer(record), 'Cliente criado com sucesso');
};

export const updateCliente = async (req, res) => {
  const id = Number(req.params.id);
  const scope = await customerScope(req.user);
  const existing = await prisma.cliente.findFirst({ where: { id, deletedAt: null, ...scope, ...storeScope(req.user) } });
  if (!existing) return notFound(res, 'Cliente não encontrado');
  const { cliente, error } = validateCliente(req.body, existing);
  if (error) return res.status(400).json({ success: false, error: 'INVALID_CUSTOMER', message: error });
  if (await prisma.cliente.findFirst({ where: { documento: cliente.documento, id: { not: id }, ...storeScope(req.user) } })) return res.status(409).json({ success: false, error: 'DUPLICATE_DOCUMENT', message: 'Já existe um cliente com este CPF/CNPJ.' });
  const record = await prisma.cliente.update({ where: { id }, data: { ...cliente, updatedAt: new Date() } });
  return ok(res, presentCustomer(record), 'Cliente atualizado com sucesso');
};

export const deleteCliente = async (req, res) => {
  const id = Number(req.params.id);
  const scope = await customerScope(req.user);
  const existing = await prisma.cliente.findFirst({ where: { id, deletedAt: null, ...scope, ...storeScope(req.user) } });
  if (!existing) return notFound(res, 'Cliente não encontrado');
  await prisma.cliente.update({ where: { id }, data: { deletedAt: new Date(), status: 'inativo' } });
  return ok(res, null, 'Cliente arquivado. O histórico permanece preservado.');
};
