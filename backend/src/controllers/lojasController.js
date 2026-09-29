import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { created, notFound, ok } from '../utils/response.js';

const roleOf = (user) => String(user?.perfil || user?.role || '').toUpperCase();
const present = (store) => ({ ...store, usuariosCount: store._count?.usuarios || 0, clientesCount: store._count?.clientes || 0, veiculosCount: store._count?.veiculos || 0 });
const listInclude = { _count: { select: { usuarios: true, clientes: true, veiculos: true } } };

export const listStores = async (req, res) => {
  const role = roleOf(req.user);
  const where = ['ADMIN', 'SUPPORT'].includes(role) ? {} : { id: Number(req.user.lojaId) || -1, status: 'ativo' };
  const rows = await prisma.loja.findMany({ where, include: listInclude, orderBy: { nome: 'asc' } });
  return ok(res, rows.map(present), 'Lojas carregadas.');
};

export const createStore = async (req, res) => {
  const nome = String(req.body.nome || '').trim();
  const cnpj = String(req.body.cnpj || '').replace(/\D/g, '') || null;
  if (!nome) return res.status(400).json({ success: false, error: 'INVALID_STORE', message: 'O nome da loja é obrigatório.' });
  if (cnpj && cnpj.length !== 14) return res.status(400).json({ success: false, error: 'INVALID_CNPJ', message: 'Informe um CNPJ com 14 dígitos.' });
  if (await prisma.loja.findFirst({ where: { OR: [{ nome: { equals: nome, mode: 'insensitive' } }, ...(cnpj ? [{ cnpj }] : [])] } })) return res.status(409).json({ success: false, error: 'STORE_EXISTS', message: 'Já existe uma loja com este nome ou CNPJ.' });
  const row = await prisma.loja.create({ data: { nome, cnpj, telefone: String(req.body.telefone || '').trim() || null, email: String(req.body.email || '').trim().toLowerCase() || null, cep: String(req.body.cep || '').trim() || null, logradouro: String(req.body.logradouro || '').trim() || null, numero: String(req.body.numero || '').trim() || null, complemento: String(req.body.complemento || '').trim() || null, bairro: String(req.body.bairro || '').trim() || null, cidade: String(req.body.cidade || '').trim() || null, estado: String(req.body.estado || '').trim().toUpperCase() || null, status: 'ativo' }, include: listInclude });
  return created(res, present(row), 'Loja cadastrada.');
};

export const updateStore = async (req, res) => {
  const id = Number(req.params.id);
  const current = await prisma.loja.findUnique({ where: { id } });
  if (!current) return notFound(res, 'Loja não encontrada.');
  const nome = String(req.body.nome ?? current.nome).trim();
  const cnpj = req.body.cnpj === undefined ? current.cnpj : String(req.body.cnpj || '').replace(/\D/g, '') || null;
  if (!nome || (cnpj && cnpj.length !== 14)) return res.status(400).json({ success: false, error: 'INVALID_STORE', message: 'Informe nome e CNPJ válidos.' });
  const duplicate = await prisma.loja.findFirst({ where: { id: { not: id }, OR: [{ nome: { equals: nome, mode: 'insensitive' } }, ...(cnpj ? [{ cnpj }] : [])] } });
  if (duplicate) return res.status(409).json({ success: false, error: 'STORE_EXISTS', message: 'Já existe outra loja com este nome ou CNPJ.' });
  const data = { nome, cnpj, status: req.body.status === 'inativo' ? 'inativo' : req.body.status === 'ativo' ? 'ativo' : current.status, updatedAt: new Date() };
  for (const field of ['telefone', 'email', 'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado']) if (req.body[field] !== undefined) data[field] = String(req.body[field] || '').trim() || null;
  if (data.estado) data.estado = data.estado.toUpperCase();
  const row = await prisma.loja.update({ where: { id }, data, include: listInclude });
  return ok(res, present(row), 'Loja atualizada.');
};

export const selectStore = async (req, res) => {
  const user = await prisma.usuario.findUnique({ where: { id: Number(req.user.id) }, include: { loja: true } });
  if (!user || user.status === 'inativo') return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Usuário inativo ou não encontrado.' });
  const role = roleOf(user);
  const requested = req.body.lojaId === null ? null : Number(req.body.lojaId);
  if (!['ADMIN', 'SUPPORT'].includes(role) && requested !== user.lojaId) return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Você só pode acessar sua loja.' });
  const store = requested === null ? null : await prisma.loja.findFirst({ where: { id: requested, status: 'ativo' } });
  if (requested !== null && !store) return notFound(res, 'Loja não encontrada ou inativa.');
  const token = jwt.sign({ id: user.id, email: user.email, perfil: user.perfil, firstAccess: user.firstAccess, lojaId: requested }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
  return ok(res, { token, lojaId: requested, lojaNome: store?.nome || 'Todas as lojas' }, 'Contexto da loja atualizado.');
};
