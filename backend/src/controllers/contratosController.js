import { ok, created, notFound } from '../utils/response.js';
import { readStore, writeStore, createId } from '../store.js';

const enrichContrato = (store, contrato) => {
  const cliente = store.clientes.find((item) => item.id === Number(contrato.clienteId)) || null;
  const vendedor = store.vendedores.find((item) => item.id === Number(contrato.vendedorId)) || null;
  const proposta = store.propostas.find((item) => item.id === Number(contrato.propostaId)) || null;

  return { ...contrato, cliente, vendedor, proposta };
};

export const listContratos = async (req, res) => {
  const store = readStore();
  const contratos = store.contratos.map((contrato) => enrichContrato(store, contrato));
  return ok(res, contratos, 'Contratos carregados com sucesso');
};

export const getContratoById = async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const contrato = store.contratos.find((item) => item.id === Number(id));

  if (!contrato) return notFound(res, 'Contrato não encontrado');
  return ok(res, enrichContrato(store, contrato), 'Contrato encontrado');
};

export const createContrato = async (req, res) => {
  const { propostaId, clienteId, vendedorId, valorTotal, documentoUrl } = req.body;
  const store = readStore();

  const proposta = store.propostas.find((item) => item.id === Number(propostaId));
  if (!proposta) return notFound(res, 'Proposta informada não existe');

  const contrato = {
    id: createId('contratos'),
    propostaId: Number(propostaId),
    clienteId: Number(clienteId),
    vendedorId: Number(vendedorId),
    valorTotal: Number(valorTotal),
    documentoUrl: documentoUrl || '',
    status: 'ativo',
    dataAssinatura: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  store.contratos.push(contrato);
  writeStore(store);
  return created(res, enrichContrato(store, contrato), 'Contrato criado com sucesso');
};

export const updateStatusContrato = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const store = readStore();
  const index = store.contratos.findIndex((item) => item.id === Number(id));

  if (index === -1) return notFound(res, 'Contrato não encontrado');

  store.contratos[index].status = status;
  writeStore(store);
  return ok(res, enrichContrato(store, store.contratos[index]), 'Status do contrato atualizado com sucesso');
};
