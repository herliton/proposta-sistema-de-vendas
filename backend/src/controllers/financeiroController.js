import { ok, created, notFound } from '../utils/response.js';
import { readStore, writeStore, createId } from '../store.js';

const enrichFinance = (store, item) => ({
  ...item,
  contrato: store.contratos.find((contrato) => contrato.id === Number(item.contratoId)) || null,
});

export const listFinanceiro = async (req, res) => {
  const store = readStore();
  const financeiro = store.financeiro.map((item) => enrichFinance(store, item));
  return ok(res, financeiro, 'Financeiro carregado com sucesso');
};

export const getFinanceiroById = async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const item = store.financeiro.find((entry) => entry.id === Number(id));

  if (!item) return notFound(res, 'Registro financeiro não encontrado');
  return ok(res, enrichFinance(store, item), 'Registro financeiro encontrado');
};

export const createFinanceiro = async (req, res) => {
  const { contratoId, tipo, valor, dataVencimento, observacoes } = req.body;
  const store = readStore();

  const item = {
    id: createId('financeiro'),
    contratoId: Number(contratoId),
    tipo,
    valor: Number(valor),
    status: 'pendente',
    dataVencimento: dataVencimento ? new Date(dataVencimento).toISOString() : null,
    observacoes: observacoes || '',
    createdAt: new Date().toISOString(),
  };

  store.financeiro.push(item);
  writeStore(store);
  return created(res, enrichFinance(store, item), 'Registro financeiro criado com sucesso');
};

export const updateFinanceiro = async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const index = store.financeiro.findIndex((item) => item.id === Number(id));

  if (index === -1) return notFound(res, 'Registro financeiro não encontrado');

  store.financeiro[index] = {
    ...store.financeiro[index],
    ...req.body,
    valor: req.body.valor ? Number(req.body.valor) : store.financeiro[index].valor,
    dataVencimento: req.body.dataVencimento ? new Date(req.body.dataVencimento).toISOString() : store.financeiro[index].dataVencimento,
  };

  writeStore(store);
  return ok(res, enrichFinance(store, store.financeiro[index]), 'Registro financeiro atualizado com sucesso');
};

export const updateStatusFinanceiro = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const store = readStore();
  const index = store.financeiro.findIndex((item) => item.id === Number(id));

  if (index === -1) return notFound(res, 'Registro financeiro não encontrado');

  store.financeiro[index].status = status;
  writeStore(store);
  return ok(res, enrichFinance(store, store.financeiro[index]), 'Status do financeiro atualizado com sucesso');
};
