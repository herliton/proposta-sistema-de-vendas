const commissionRates = async (tx) => {
  const setting = await tx.configuracao.findUnique({ where: { chave: 'commissionRules' } });
  const value = setting?.valor || {};
  const sellerPercent = Number(value.sellerPercent ?? 1.5);
  const managerPercent = Number(value.managerPercent ?? 0.5);
  return {
    sellerPercent: Number.isFinite(sellerPercent) && sellerPercent >= 0 ? sellerPercent : 1.5,
    managerPercent: Number.isFinite(managerPercent) && managerPercent >= 0 ? managerPercent : 0.5,
  };
};

export const ensureContractAndCommissions = async (tx, proposalId) => {
  const proposal = await tx.proposta.findUnique({
    where: { id: Number(proposalId) },
    include: { contrato: true, vendedor: { include: { usuario: true } } },
  });
  if (!proposal) throw new Error('Proposta não encontrada para efetivar contrato.');
  if (proposal.status !== 'CONTRACT_EFFECTIVE') throw new Error('A proposta precisa estar efetivada para gerar contrato.');

  const contract = proposal.contrato || await tx.contrato.create({ data: {
    propostaId: proposal.id, clienteId: proposal.clienteId, vendedorId: proposal.vendedorId, lojaId: proposal.lojaId,
    tipo: 'VENDA_VEICULO', valorTotal: Number(proposal.valorProposta), status: 'ativo', dataAssinatura: new Date(),
  } });
  const existingLedger = await tx.comissao.count({ where: { propostaId: proposal.id } });
  if (existingLedger) return contract;
  const { sellerPercent, managerPercent } = await commissionRates(tx);
  const base = Number(proposal.valorProposta);
  const ledger = [{
    propostaId: proposal.id, vendedorId: proposal.vendedorId, usuarioId: proposal.vendedor.usuarioId,
    tipo: 'VENDEDOR', valor: Math.round(base * sellerPercent) / 100,
  }];
  const managerId = proposal.vendedor.usuario?.gerenteId;
  if (managerId && managerPercent > 0) ledger.push({
    propostaId: proposal.id, vendedorId: proposal.vendedorId, usuarioId: managerId,
    tipo: 'GERENTE', valor: Math.round(base * managerPercent) / 100,
  });
  if (ledger.length) await tx.comissao.createMany({ data: ledger });
  return contract;
};
