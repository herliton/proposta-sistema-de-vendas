import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { defaultRoleModules, roles, systemModules } from '../src/data/systemModules.js';

const prisma = new PrismaClient();
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.resolve(scriptDir, '../data/store.json');
const asDate = (value) => value ? new Date(value) : undefined;
const asOptional = (value) => value === '' || value === undefined ? null : value;
const routeFor = (id) => `/${id.toLowerCase().replaceAll('_', '-')}`;
const iconFor = (id) => ({ DASHBOARD: 'home', SIMULATIONS: 'calculator', PROPOSALS: 'proposal', CONTRACTS: 'contract', CUSTOMERS: 'users', SHOWCASE: 'car', VEHICLES: 'car', COMMISSIONS: 'dollar-sign', REPORTS: 'chart-bar', SETTINGS: 'settings' })[id] || null;

if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL no ambiente backend antes da importação.');
if (!fs.existsSync(storePath)) throw new Error(`Arquivo de origem não encontrado: ${storePath}`);
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
const lists = ['usuarios', 'clientes', 'vendedores', 'veiculos', 'propostas', 'contratos', 'financeiro'];
for (const key of lists) if (!Array.isArray(store[key])) store[key] = [];

try {
  const existing = await Promise.all([
    prisma.cliente.count(), prisma.vendedor.count(), prisma.veiculo.count(), prisma.proposta.count(),
    prisma.contrato.count(), prisma.financeiro.count(), prisma.configuracao.count(),
  ]);
  if (existing.some((count) => count > 0)) throw new Error('O banco já contém dados comerciais ou configurações. A importação foi interrompida para evitar mesclar registros.');
  const currentUsers = await prisma.usuario.findMany({ select: { id: true, email: true } });
  const userIdMap = new Map();
  const existingEmailIds = new Map(currentUsers.map((user) => [user.email.trim().toLowerCase(), user.id]));
  const occupiedUserIds = new Set(currentUsers.map((user) => user.id));
  let nextUserId = Math.max(0, ...currentUsers.map((user) => user.id), ...store.usuarios.map((user) => Number(user.id) || 0)) + 1;
  for (const user of store.usuarios) {
    const existingId = existingEmailIds.get(user.email.trim().toLowerCase());
    if (existingId) userIdMap.set(Number(user.id), existingId);
    else if (occupiedUserIds.has(Number(user.id))) { userIdMap.set(Number(user.id), nextUserId); occupiedUserIds.add(nextUserId++); }
    else { userIdMap.set(Number(user.id), Number(user.id)); occupiedUserIds.add(Number(user.id)); }
  }

  await prisma.$transaction(async (tx) => {
    for (const item of systemModules) {
      await tx.systemModule.upsert({ where: { id: item.id }, create: { id: item.id, name: item.label, route: routeFor(item.id), icon: iconFor(item.id) }, update: {} });
    }
    for (const role of roles) {
      const configured = store.configuracoes?.rolePermissions?.[role];
      const allowed = new Set(Array.isArray(configured) ? configured : defaultRoleModules[role] || []);
      if (role === 'MANAGER') for (const moduleId of (store.configuracoes?.rolePermissions?.SELLER || defaultRoleModules.SELLER)) allowed.add(moduleId);
      for (const module of systemModules) {
        await tx.rolePermission.upsert({ where: { role_moduleId: { role, moduleId: module.id } }, create: { role, moduleId: module.id, canAccess: allowed.has(module.id) }, update: {} });
      }
    }
    for (const u of store.usuarios) {
      if (existingEmailIds.has(u.email.trim().toLowerCase())) continue;
      await tx.usuario.create({ data: {
        id: userIdMap.get(Number(u.id)), nome: u.nome, email: u.email.trim().toLowerCase(), senhaHash: u.senhaHash, perfil: u.perfil, status: u.status || 'ativo',
        telefone: asOptional(u.telefone), avatarUrl: asOptional(u.avatarUrl), cep: asOptional(u.cep), logradouro: asOptional(u.logradouro), numero: asOptional(u.numero),
        complemento: asOptional(u.complemento), bairro: asOptional(u.bairro), cidade: asOptional(u.cidade), estado: asOptional(u.estado), chavePix: asOptional(u.chavePix),
        metaMensal: u.metaMensal ?? null, firstAccess: Boolean(u.firstAccess), resetPasswordTokenHash: asOptional(u.resetPasswordTokenHash), resetPasswordExpires: asDate(u.resetPasswordExpires),
        gerenteId: null, createdAt: asDate(u.createdAt), updatedAt: asDate(u.updatedAt || u.createdAt),
      } });
    }
    for (const u of store.usuarios) {
      const mappedId = userIdMap.get(Number(u.id));
      const mappedManagerId = userIdMap.get(Number(u.gerenteId));
      if (mappedManagerId && !existingEmailIds.has(u.email.trim().toLowerCase())) await tx.usuario.update({ where: { id: mappedId }, data: { gerenteId: mappedManagerId } });
    }
    for (const v of store.vendedores) await tx.vendedor.create({ data: { id: Number(v.id), nome: v.nome, email: v.email.trim().toLowerCase(), telefone: asOptional(v.telefone), cargo: asOptional(v.cargo), equipe: asOptional(v.equipe), status: v.status || 'ativo', usuarioId: userIdMap.get(Number(v.usuarioId)) ?? null, createdAt: asDate(v.createdAt) } });
    for (const c of store.clientes) await tx.cliente.create({ data: {
      id: Number(c.id), nome: c.nome || c.razaoSocial || 'Cliente', razaoSocial: asOptional(c.razaoSocial), nomeFantasia: asOptional(c.nomeFantasia),
      documento: asOptional(c.documento), tipoPessoa: asOptional(c.tipoPessoa), email: asOptional(c.email), telefone: asOptional(c.telefone), cep: asOptional(c.cep),
      logradouro: asOptional(c.logradouro), numero: asOptional(c.numero), complemento: asOptional(c.complemento), bairro: asOptional(c.bairro), cidade: asOptional(c.cidade), estado: asOptional(c.estado),
      rendaMensal: c.rendaMensal ?? null, ocupacao: asOptional(c.ocupacao), status: c.status || 'ativo', vendedorId: c.vendedorId ?? null, gerenteId: c.gerenteId ?? null,
      deletedAt: asDate(c.deletedAt), createdAt: asDate(c.createdAt), updatedAt: asDate(c.updatedAt || c.createdAt),
    } });
    for (const v of store.veiculos) {
      const year = Number(v.anoFabricacao || v.ano || new Date().getFullYear());
      const photos = v.fotos || {};
      await tx.veiculo.create({ data: {
        id: Number(v.id), marca: v.marca || v.brand, modelo: v.modelo || v.model, ano: year, anoFabricacao: year,
        anoModelo: Number(v.anoModelo || v.model_year || year), codigoFipe: asOptional(v.codigoFipe || v.fipe_code), valorFipe: v.valorFipe ?? v.fipe_price ?? null,
        precoSugerido: v.precoSugerido ?? v.valor ?? v.suggested_price ?? null, precoMinimo: v.precoMinimo ?? v.min_price ?? null,
        placa: asOptional(v.placa), status: v.status || 'disponivel', observacoes: asOptional(v.observacoes),
        fotoDireita: asOptional(photos.right || v.photoRightUrl), fotoEsquerda: asOptional(photos.left || v.photoLeftUrl), fotoFrente: asOptional(photos.front || v.photoFrontUrl),
        fotoTraseira: asOptional(photos.rear || v.photoRearUrl), fotoInterior: asOptional(photos.interior || v.photoInteriorUrl), videoUrl: asOptional(v.videoUrl), videoDuracao: v.videoDuracaoSegundos ?? null,
        deletedAt: asDate(v.deletedAt), createdAt: asDate(v.createdAt), updatedAt: asDate(v.updatedAt || v.createdAt),
      } });
    }
    for (const p of store.propostas) await tx.proposta.create({ data: {
      id: Number(p.id), clienteId: Number(p.clienteId), vendedorId: Number(p.vendedorId), veiculoId: Number(p.veiculoId), valorProposta: Number(p.valorProposta),
      entrada: p.entrada ?? null, parcelas: p.parcelas ?? null, taxaJuros: p.taxaJuros ?? null, valorParcela: p.valorParcela ?? null, totalFinanciado: p.totalFinanciado ?? null,
      status: p.status || 'pendente', motivoRecusa: asOptional(p.rejectionReason || p.motivoRecusa), observacoes: asOptional(p.observacoes), deletedAt: asDate(p.deletedAt),
      createdAt: asDate(p.createdAt), updatedAt: asDate(p.updatedAt || p.createdAt),
    } });
    for (const c of store.contratos) await tx.contrato.create({ data: {
      id: Number(c.id), propostaId: Number(c.propostaId), clienteId: Number(c.clienteId), vendedorId: Number(c.vendedorId), tipo: c.tipo || 'VENDA_VEICULO',
      valorTotal: Number(c.valorTotal), status: c.status || 'ativo', dataAssinatura: asDate(c.dataAssinatura), documentoUrl: asOptional(c.documentoUrl),
      deletedAt: asDate(c.deletedAt), createdAt: asDate(c.createdAt), updatedAt: asDate(c.updatedAt || c.createdAt),
    } });
    for (const f of store.financeiro) await tx.financeiro.create({ data: {
      id: Number(f.id), contratoId: Number(f.contratoId), tipo: f.tipo, valor: Number(f.valor), status: f.status || 'pendente',
      dataVencimento: asDate(f.dataVencimento), observacoes: asOptional(f.observacoes), createdAt: asDate(f.createdAt),
    } });
    for (const [chave, valor] of Object.entries(store.configuracoes || {})) await tx.configuracao.create({ data: { chave, valor } });
  }, { timeout: 120000 });

  for (const table of ['Usuario', 'Vendedor', 'Cliente', 'Veiculo', 'Proposta', 'Contrato', 'Financeiro']) {
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(MAX("id"), 1), MAX("id") IS NOT NULL) FROM "${table}"`);
  }
  console.log('Importação concluída:', Object.fromEntries(lists.map((name) => [name, store[name].length])), 'contas já existentes preservadas:', existingEmailIds.size, 'IDs de usuário reconciliados:', [...userIdMap].filter(([sourceId, targetId]) => sourceId !== targetId).length);
} finally {
  await prisma.$disconnect();
}
