import { prisma } from '../config/database.js';

export const defaultProposalSettings = {
  validadeDias: 7,
  prazoEntrega: 'A combinar após a aprovação de crédito',
  documentacaoTransferencia: 'Conforme contrato e legislação vigente',
  textoPrazos: 'Os prazos de entrega e transferência serão confirmados pelo consultor após a aprovação de crédito e a assinatura do contrato.',
  textoGarantia: 'O veículo é ofertado com a garantia legal prevista no Código de Defesa do Consumidor. Condições adicionais de garantia, quando houver, serão descritas no contrato de venda. Para suporte pós-venda, procure o consultor responsável ou a loja nos contatos informados no cabeçalho.',
};

const present = (row) => ({
  validadeDias: row.validadeDias, prazoEntrega: row.prazoEntrega, documentacaoTransferencia: row.documentacaoTransferencia,
  textoPrazos: row.textoPrazos, textoGarantia: row.textoGarantia,
});

export const getProposalSettings = async (lojaId) => {
  const row = await prisma.configuracaoProposta.findUnique({ where: { lojaId: Number(lojaId) } });
  return row ? present(row) : { ...defaultProposalSettings };
};

export const validateProposalSettings = (body) => {
  const text = (value, max) => String(value ?? '').trim().slice(0, max + 1);
  const data = {
    validadeDias: Number(body.validadeDias),
    prazoEntrega: text(body.prazoEntrega, 255),
    documentacaoTransferencia: text(body.documentacaoTransferencia, 255),
    textoPrazos: text(body.textoPrazos, 2000),
    textoGarantia: text(body.textoGarantia, 2000),
  };
  if (!Number.isInteger(data.validadeDias) || data.validadeDias < 1 || data.validadeDias > 365) return { error: 'A validade deve ser de 1 a 365 dias.' };
  if (!data.prazoEntrega || !data.documentacaoTransferencia || !data.textoPrazos || !data.textoGarantia) return { error: 'Preencha todos os campos da proposta.' };
  if (data.prazoEntrega.length > 255 || data.documentacaoTransferencia.length > 255 || data.textoPrazos.length > 2000 || data.textoGarantia.length > 2000) return { error: 'Um dos textos excede o tamanho permitido.' };
  return { data };
};
