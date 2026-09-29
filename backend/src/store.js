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
  configuracoes: {},
};

const getNextId = (collection, items) => {
  const list = Array.isArray(items) ? items : [];
  return list.length ? Math.max(...list.map((item) => Number(item.id || 0))) + 1 : 1;
};

const seedDemoContracts = (store) => {
  const proposals = Array.isArray(store.propostas) ? store.propostas : [];
  const clientes = Array.isArray(store.clientes) ? store.clientes : [];
  const vendedores = Array.isArray(store.vendedores) ? store.vendedores : [];
  const veiculos = Array.isArray(store.veiculos) ? store.veiculos : [];

  if (!Array.isArray(store.contratos)) {
    store.contratos = [];
  }

  if (!store.contratos.length && proposals.length) {
    const nextContractId = getNextId('contratos', store.contratos);
    store.contratos = proposals.slice(0, 2).map((proposal, index) => {
      const cliente = clientes.find((item) => item.id === Number(proposal.clienteId)) || clientes[0] || { nome: 'Cliente em análise' };
      const vendedor = vendedores.find((item) => item.id === Number(proposal.vendedorId)) || vendedores[0] || { nome: 'Vendedor' };
      const veiculo = veiculos.find((item) => item.id === Number(proposal.veiculoId)) || veiculos[0] || { modelo: 'Veículo' };

      return {
        id: nextContractId + index,
        propostaId: Number(proposal.id),
        clienteId: Number(proposal.clienteId || cliente.id || 1),
        vendedorId: Number(proposal.vendedorId || vendedor.id || 1),
        valorTotal: Number(proposal.valorProposta || 150000),
        documentoUrl: index === 0 ? '/documents/contrato-1.pdf' : '/documents/contrato-2.pdf',
        status: 'ativo',
        dataAssinatura: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    });
  }
};

const seedDemoFinance = (store) => {
  if (!Array.isArray(store.financeiro)) {
    store.financeiro = [];
  }

  if (!store.financeiro.length && Array.isArray(store.contratos) && store.contratos.length) {
    const nextFinanceId = getNextId('financeiro', store.financeiro);
    store.financeiro = store.contratos.map((contrato, index) => ({
      id: nextFinanceId + index,
      contratoId: Number(contrato.id),
      tipo: index === 0 ? 'Entrada de contrato' : 'Honorários consultoria',
      valor: Number(contrato.valorTotal || 150000) * (index === 0 ? 0.12 : 0.05),
      status: index === 0 ? 'pago' : 'pendente',
      dataVencimento: new Date(Date.now() + index * 86400000 * 5).toISOString(),
      observacoes: 'Registro financeiro demo inicial',
      createdAt: new Date().toISOString(),
    }));
  }
};

export const ensureDefaultAdmin = async () => {
  const store = readStore();
  const bootstrapAccounts = [
    { email: 'admin@proposta.com.br', nome: 'Administrador VFC' },
    { email: 'herliton@allos.net.br', nome: 'Herliton' },
  ];
  let changed = false;

  for (const account of bootstrapAccounts) {
    let user = store.usuarios.find((item) => item.email?.trim().toLowerCase() === account.email);
    if (!user) {
      const nextId = store.usuarios.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
      user = {
        id: nextId,
        nome: account.nome,
        email: account.email,
        senhaHash: await bcrypt.hash('Proposta123', 10),
        perfil: 'admin',
        status: 'ativo',
        firstAccess: false,
        createdAt: new Date().toISOString(),
      };
      store.usuarios.push(user);
      changed = true;
      continue;
    }

    const validBcryptHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.senhaHash || '');
    if (!validBcryptHash) {
      user.senhaHash = await bcrypt.hash('Proposta123', 10);
      changed = true;
    }
    if (user.perfil !== 'admin') {
      user.perfil = 'admin';
      changed = true;
    }
    if (user.status !== 'ativo') {
      user.status = 'ativo';
      changed = true;
    }
  }

  if (changed) writeStore(store);
  return store;
};

export const ensureStore = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultStore, null, 2));
    return;
  }

  try {
    const raw = fs.readFileSync(dataFile, 'utf-8');
    const parsed = JSON.parse(raw);
    const nextStore = {
      ...defaultStore,
      ...parsed,
      usuarios: Array.isArray(parsed.usuarios) ? parsed.usuarios : [],
      clientes: Array.isArray(parsed.clientes) ? parsed.clientes : [],
      vendedores: Array.isArray(parsed.vendedores) ? parsed.vendedores : [],
      veiculos: Array.isArray(parsed.veiculos) ? parsed.veiculos : [],
      propostas: Array.isArray(parsed.propostas) ? parsed.propostas : [],
      contratos: Array.isArray(parsed.contratos) ? parsed.contratos : [],
      financeiro: Array.isArray(parsed.financeiro) ? parsed.financeiro : [],
      configuracoes: parsed.configuracoes && typeof parsed.configuracoes === 'object' && !Array.isArray(parsed.configuracoes) ? parsed.configuracoes : {},
    };

    if (!nextStore.contratos.length) {
      seedDemoContracts(nextStore);
    }

    if (!nextStore.financeiro.length && nextStore.contratos.length) {
      seedDemoFinance(nextStore);
    }

    if (JSON.stringify(nextStore) !== JSON.stringify(parsed)) {
      persistStore(nextStore);
    }
  } catch (error) {
    throw new Error(`Não foi possível ler os dados em ${dataFile}. O arquivo foi preservado.`, { cause: error });
  }
};

const persistStore = (store) => {
  const temporaryFile = `${dataFile}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(store, null, 2), 'utf-8');
  fs.renameSync(temporaryFile, dataFile);
};

export const readStore = () => {
  ensureStore();

  const raw = fs.readFileSync(dataFile, 'utf-8');

  return JSON.parse(raw);
};

export const writeStore = (store) => {
  ensureStore();
  persistStore(store);
};

export const createId = (collection) => {
  const store = readStore();
  const items = store[collection] || [];
  return items.length ? Math.max(...items.map((item) => Number(item.id || 0))) + 1 : 1;
};
