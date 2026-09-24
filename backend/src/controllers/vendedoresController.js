import { ok, created, notFound } from '../utils/response.js';
import { readStore, writeStore, createId } from '../store.js';

export const listVendedores = async (req, res) => {
  const store = readStore();
  return ok(res, store.vendedores, 'Vendedores carregados com sucesso');
};

export const getVendedorById = async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const vendedor = store.vendedores.find((item) => item.id === Number(id));

  if (!vendedor) return notFound(res, 'Vendedor não encontrado');
  return ok(res, vendedor, 'Vendedor encontrado');
};

export const createVendedor = async (req, res) => {
  const store = readStore();
  const vendedor = {
    id: createId('vendedores'),
    ...req.body,
    status: req.body.status || 'ativo',
    createdAt: new Date().toISOString(),
  };

  store.vendedores.push(vendedor);
  writeStore(store);
  return created(res, vendedor, 'Vendedor criado com sucesso');
};

export const updateVendedor = async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const index = store.vendedores.findIndex((item) => item.id === Number(id));

  if (index === -1) return notFound(res, 'Vendedor não encontrado');

  store.vendedores[index] = { ...store.vendedores[index], ...req.body };
  writeStore(store);
  return ok(res, store.vendedores[index], 'Vendedor atualizado com sucesso');
};

export const deleteVendedor = async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const index = store.vendedores.findIndex((item) => item.id === Number(id));

  if (index === -1) return notFound(res, 'Vendedor não encontrado');

  store.vendedores.splice(index, 1);
  writeStore(store);
  return ok(res, null, 'Vendedor removido com sucesso');
};
