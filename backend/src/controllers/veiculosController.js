import { ok, created, notFound } from '../utils/response.js';
import { readStore, writeStore, createId } from '../store.js';

export const listVeiculos = async (req, res) => {
  const store = readStore();
  return ok(res, store.veiculos, 'Veículos carregados com sucesso');
};

export const getVeiculoById = async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const veiculo = store.veiculos.find((item) => item.id === Number(id));

  if (!veiculo) return notFound(res, 'Veículo não encontrado');
  return ok(res, veiculo, 'Veículo encontrado');
};

export const createVeiculo = async (req, res) => {
  const store = readStore();
  const veiculo = {
    id: createId('veiculos'),
    marca: req.body.marca,
    modelo: req.body.modelo,
    ano: Number(req.body.ano),
    placa: req.body.placa,
    valor: Number(req.body.valor),
    status: req.body.status || 'disponivel',
    observacoes: req.body.observacoes || '',
    createdAt: new Date().toISOString(),
  };

  store.veiculos.push(veiculo);
  writeStore(store);
  return created(res, veiculo, 'Veículo criado com sucesso');
};

export const updateVeiculo = async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const index = store.veiculos.findIndex((item) => item.id === Number(id));

  if (index === -1) return notFound(res, 'Veículo não encontrado');

  store.veiculos[index] = {
    ...store.veiculos[index],
    ...req.body,
    valor: req.body.valor ? Number(req.body.valor) : store.veiculos[index].valor,
    ano: req.body.ano ? Number(req.body.ano) : store.veiculos[index].ano,
  };

  writeStore(store);
  return ok(res, store.veiculos[index], 'Veículo atualizado com sucesso');
};

export const deleteVeiculo = async (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const index = store.veiculos.findIndex((item) => item.id === Number(id));

  if (index === -1) return notFound(res, 'Veículo não encontrado');

  store.veiculos.splice(index, 1);
  writeStore(store);
  return ok(res, null, 'Veículo removido com sucesso');
};
