import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'store.json');

const defaultStore = {
  usuarios: [],
  clientes: [],
  vendedores: [],
  veiculos: [],
  propostas: [],
  contratos: [],
  financeiro: [],
};

export const ensureDefaultAdmin = async () => {
  const store = readStore();
  const hasDemoAdmin = store.usuarios.some((user) => user.email === 'admin@proposta.com.br');

  if (hasDemoAdmin) {
    return store;
  }

  const adminPasswordHash = await bcrypt.hash('Proposta123', 10);
  const adminUser = {
    id: createId('usuarios'),
    nome: 'Administrador VFC',
    email: 'admin@proposta.com.br',
    senhaHash: adminPasswordHash,
    perfil: 'admin',
    status: 'ativo',
    createdAt: new Date().toISOString(),
  };

  store.usuarios.push(adminUser);
  writeStore(store);

  return store;
};

export const ensureStore = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultStore, null, 2));
  }
};

export const readStore = () => {
  ensureStore();

  const raw = fs.readFileSync(dataFile, 'utf-8');

  try {
    return JSON.parse(raw);
  } catch (error) {
    return { ...defaultStore };
  }
};

export const writeStore = (store) => {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
};

export const createId = (collection) => {
  const store = readStore();
  const items = store[collection] || [];
  return items.length ? Math.max(...items.map((item) => Number(item.id || 0))) + 1 : 1;
};
