import { ok, created, notFound } from '../utils/response.js';
import { readStore, writeStore, createId } from '../store.js';

export const listClientes = async (req, res) => {
  const store = readStore();
  const clientes = [...store.clientes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return ok(res, clientes, 'Clientes carregados com sucesso');
};

export const getClienteById = async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const cliente = store.clientes.find((item) => item.id === Number(id));

  if (!cliente) {
    return notFound(res, 'Cliente não encontrado');
  }

  return ok(res, cliente, 'Cliente encontrado');
};

export const createCliente = async (req, res) => {
  const payload = req.body;
  const store = readStore();

  const cliente = {
    id: createId('clientes'),
    ...payload,
    status: payload.status || 'ativo',
    createdAt: new Date().toISOString(),
  };

  store.clientes.push(cliente);
  writeStore(store);

  return created(res, cliente, 'Cliente criado com sucesso');
};

export const updateCliente = async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const index = store.clientes.findIndex((item) => item.id === Number(id));

  if (index === -1) {
    return notFound(res, 'Cliente não encontrado');
  }

  store.clientes[index] = {
    ...store.clientes[index],
    ...req.body,
  };

  writeStore(store);

  return ok(res, store.clientes[index], 'Cliente atualizado com sucesso');
};

export const deleteCliente = async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const index = store.clientes.findIndex((item) => item.id === Number(id));

  if (index === -1) {
    return notFound(res, 'Cliente não encontrado');
  }

  store.clientes.splice(index, 1);
  writeStore(store);

  return ok(res, null, 'Cliente removido com sucesso');
};
