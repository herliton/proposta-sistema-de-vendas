import { ok, created, notFound } from '../utils/response.js';
import { readStore, writeStore, createId } from '../store.js';

const buildPropostaPayload = (store, proposta) => {
  const cliente = store.clientes.find((item) => item.id === proposta.clienteId) || null;
  const vendedor = store.vendedores.find((item) => item.id === proposta.vendedorId) || null;
  const veiculo = store.veiculos.find((item) => item.id === proposta.veiculoId) || null;

  return {
    ...proposta,
    cliente,
    vendedor,
    veiculo,
  };
};

export const listPropostas = async (req, res) => {
  const store = readStore();
  const propostas = [...store.propostas]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((proposta) => buildPropostaPayload(store, proposta));

  return ok(res, propostas, 'Propostas carregadas com sucesso');
};

export const getPropostaById = async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const proposta = store.propostas.find((item) => item.id === Number(id));

  if (!proposta) {
    return notFound(res, 'Proposta não encontrada');
  }

  return ok(res, buildPropostaPayload(store, proposta), 'Proposta encontrada');
};

export const createProposta = async (req, res) => {
  const { clienteId, vendedorId, veiculoId, valorProposta, observacoes } = req.body;
  const store = readStore();

  const proposta = {
    id: createId('propostas'),
    clienteId: Number(clienteId),
    vendedorId: Number(vendedorId),
    veiculoId: Number(veiculoId),
    valorProposta: Number(valorProposta),
    status: 'pendente',
    observacoes: observacoes || '',
    createdAt: new Date().toISOString(),
  };

  store.propostas.push(proposta);
  writeStore(store);

  return created(res, buildPropostaPayload(store, proposta), 'Proposta criada com sucesso');
};

export const updateStatusProposta = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const store = readStore();
  const index = store.propostas.findIndex((item) => item.id === Number(id));

  if (index === -1) {
    return notFound(res, 'Proposta não encontrada');
  }

  store.propostas[index].status = status;
  writeStore(store);

  return ok(res, buildPropostaPayload(store, store.propostas[index]), 'Status da proposta atualizado com sucesso');
};
