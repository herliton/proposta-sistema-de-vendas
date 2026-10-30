import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'node:url';

const logoPath = fileURLToPath(new URL('../assets/vfc-logo.png', import.meta.url));

const STATUS = { ABERTA: 'Aberta', EM_ANDAMENTO: 'Em andamento', CONCLUIDA: 'Concluída', CANCELADA: 'Cancelada' };
const RESPOSTA = { EM_ANALISE: 'Em análise', APROVADA: 'Aprovada', RECUSADA: 'Recusada', CONDICIONADA: 'Aprovada com condições' };
const RESIDENCIA = { PROPRIA: 'Própria', ALUGADA: 'Alugada', CEDIDA: 'Cedida' };
const SEXO = { MASCULINO: 'Masculino', FEMININO: 'Feminino' };
const REFERENCIA = { AMIGO: 'Amigo(a)', PAI: 'Pai', MAE: 'Mãe', FILHO: 'Filho(a)', OUTROS: 'Outros' };
const TRABALHO = { CARTEIRA_ASSINADA: 'Carteira assinada', AUTONOMO: 'Autônomo' };

const joinParts = (parts, separator = ', ') => parts.map((part) => String(part ?? '').trim()).filter(Boolean).join(separator);
const money = (value) => (value === null || value === undefined || value === '' ? '—' : Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
const date = (value) => (value ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(value)) : '—');
const dateTime = (value) => (value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(value)) : '—');
const text = (value) => (value === null || value === undefined || value === '' ? '—' : String(value));
const label = (map, value) => (value ? map[value] || value : '—');
const formatDoc = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  if (digits.length === 14) return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  return String(value || '');
};

export const fichaPdfFilename = (ficha, dossie = false) => `${dossie ? 'dossie' : 'ficha'}-recuperacao-${ficha.id}.pdf`;

export function renderFichaPdf(ficha, loja, output, { historico = null } = {}) {
  const isDossie = Array.isArray(historico);
  const doc = new PDFDocument({ size: 'A4', margin: 52, bufferPages: true, info: { Title: `Ficha de recuperação de crédito ${ficha.id}`, Author: 'VFC Multimarcas' } });
  doc.pipe(output);
  const left = 52; const right = 543; const width = right - left;
  const navy = '#102a43'; const muted = '#486581'; const line = '#d9e2ec';
  const cliente = ficha.cliente;

  const ensureSpace = (height) => { if (doc.y + height > 780) doc.addPage(); };
  const sectionTitle = (number, title) => {
    ensureSpace(60);
    doc.moveDown(1.1);
    const top = doc.y;
    doc.rect(left, top, 4, 16).fill('#4b2a8a');
    doc.fillColor(navy).font('Helvetica-Bold').fontSize(13).text(`${number}. ${title}`, left + 12, top + 1, { width: width - 12 });
    doc.x = left; doc.moveDown(0.4);
  };
  const subTitle = (title) => {
    ensureSpace(40);
    doc.fillColor(navy).font('Helvetica-Bold').fontSize(10.5).text(title, left, doc.y + 8, { width });
    doc.x = left;
  };
  const row = (name, value, bold = false) => {
    ensureSpace(24);
    const top = doc.y + 4;
    doc.moveTo(left, top).lineTo(right, top).strokeColor(line).lineWidth(0.5).stroke();
    doc.fillColor(muted).font('Helvetica').fontSize(9.5).text(name, left, top + 6, { width: 200 });
    const labelBottom = doc.y;
    doc.fillColor(navy).font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5).text(text(value), left + 210, top + 6, { width: width - 210, align: 'right' });
    doc.x = left; doc.y = Math.max(labelBottom, doc.y) + 2;
  };
  const note = (value) => {
    ensureSpace(30);
    doc.fillColor(muted).font('Helvetica').fontSize(9.5).text(value, left, doc.y + 6, { width });
    doc.x = left;
  };

  doc.image(logoPath, left, 40, { fit: [96, 62] });
  const address = joinParts([joinParts([loja?.logradouro, loja?.numero], ', '), loja?.complemento, loja?.bairro]);
  const city = joinParts([joinParts([loja?.cidade, loja?.estado], '/'), loja?.cep ? `CEP ${loja.cep}` : '']);
  doc.fillColor(navy).font('Helvetica-Bold').fontSize(11).text(loja?.nome || 'VFC Multimarcas', 165, 42, { width: right - 165, align: 'right' });
  doc.fillColor(muted).font('Helvetica').fontSize(8.5);
  [loja?.cnpj ? `CNPJ ${formatDoc(loja.cnpj)}` : '', address, city, joinParts([loja?.telefone, loja?.email], '  •  ')].filter(Boolean)
    .forEach((item) => doc.text(item, 165, doc.y + 1, { width: right - 165, align: 'right' }));
  doc.moveTo(left, 112).lineTo(right, 112).strokeColor(navy).lineWidth(1.5).stroke();
  doc.fillColor(navy).font('Helvetica-Bold').fontSize(18).text(isDossie ? 'DOSSIÊ DE RECUPERAÇÃO DE CRÉDITO' : 'FICHA DE RECUPERAÇÃO DE CRÉDITO', left, 124, { width });
  doc.fillColor(muted).font('Helvetica').fontSize(10).text(`Nº ${String(ficha.id).padStart(5, '0')}   •   Entrada da ficha ${date(ficha.dataEntradaFicha)}   •   ${label(STATUS, ficha.status)}`, left, doc.y + 2, { width });

  sectionTitle(1, 'Ficha cadastral');
  subTitle('Identificação');
  row('Gerente', ficha.gerente?.nome);
  row('Vendedor', ficha.vendedor?.nome);
  subTitle('Dados do cliente');
  row('Nome completo', cliente.nome, true);
  row(cliente.tipoPessoa === 'PJ' ? 'CNPJ' : 'CPF', formatDoc(cliente.documento));
  row('RG', ficha.rg);
  row('Órgão emissor / UF', joinParts([ficha.orgaoEmissor, ficha.ufEmissor], ' / '));
  row('Data de emissão do RG', date(ficha.dataEmissaoRg));
  row('Naturalidade / UF', joinParts([ficha.naturalidade, ficha.naturalidadeUf], ' / '));
  row('Data de nascimento', date(ficha.dataNascimento));
  row('CNH (número)', ficha.cnhNumero);
  row('CNH (validade / categoria)', joinParts([ficha.cnhValidade ? date(ficha.cnhValidade) : '', ficha.cnhCategoria], ' / '));
  row('Sexo', label(SEXO, ficha.sexo));
  row('Estado civil', ficha.estadoCivil);
  subTitle('Endereço e contato');
  row('Endereço', joinParts([joinParts([cliente.logradouro, cliente.numero], ', '), cliente.complemento, cliente.bairro]));
  row('Cidade / UF / CEP', joinParts([joinParts([cliente.cidade, cliente.estado], ' / '), cliente.cep], '  •  '));
  row('Residência', joinParts([label(RESIDENCIA, ficha.residenciaTipo) === '—' ? '' : label(RESIDENCIA, ficha.residenciaTipo), ficha.tempoResidencia], '  •  '));
  row('E-mail', cliente.email);
  row('Telefone fixo', ficha.telefoneFixo);
  row('Telefone celular', ficha.telefoneCelular || cliente.telefone);
  row('WhatsApp', ficha.whatsapp);
  subTitle('Referências pessoais');
  if (ficha.referencias.length) ficha.referencias.forEach((ref) => row(`${ref.nome} (${label(REFERENCIA, ref.tipo)})`, ref.telefone));
  else note('Nenhuma referência informada.');
  subTitle('Empresa onde trabalha');
  row('Empresa', ficha.empresaNome);
  row('CNPJ', ficha.empresaCnpj ? formatDoc(ficha.empresaCnpj) : '—');
  row('Data de admissão', date(ficha.dataAdmissao));
  row('Renda', money(ficha.renda));
  row('Cargo/função', ficha.cargoFuncao);
  row('Classificação de trabalho', label(TRABALHO, ficha.classificacaoTrabalho));
  subTitle('Simulação das parcelas');
  row('Valor do veículo', money(ficha.valorVeiculo));
  row('Valor de entrada', money(ficha.valorEntrada));
  row('Valor financiado', money(ficha.valorFinanciado), true);
  row('Tarifa de trâmite', money(ficha.valorTarifaTramite));
  ficha.opcoes.forEach((option) => {
    subTitle(`${option.ordem}ª opção de veículo`);
    row('Veículo', joinParts([option.marca, option.modelo, option.anoModelo || option.anoFabricacao ? `${option.anoModelo ?? '—'}/${option.anoFabricacao ?? '—'}` : ''], ' '));
    option.parcelas.forEach((parcel) => row(`${parcel.quantidade}x`, `mín. ${money(parcel.parcelaMinima)}  •  máx. ${money(parcel.parcelaMaxima)}`));
  });

  sectionTitle(2, 'Controle administrativo');
  if (!ficha.contatos.length) note('Nenhum contato registrado.');
  ficha.contatos.forEach((contact) => {
    subTitle(`${contact.ordem}º contato`);
    row('Data', date(contact.data));
    if (contact.dataLigacaoPosVenda) row('Ligação do pós-venda', date(contact.dataLigacaoPosVenda));
    if (contact.inicio || contact.termino) row('Início / término', joinParts([contact.inicio, contact.termino], ' – '));
    if (contact.protocolo) row('Protocolo', contact.protocolo);
    if (contact.spc) row('SPC', contact.spc);
    if (contact.dividaValor !== null && contact.dividaValor !== undefined) row('Dívida', joinParts([money(contact.dividaValor), contact.dividaObservacao], '  '));
    row('Consultor(a)', contact.consultorNome);
    if (contact.setor) row('Setor', contact.setor);
    if (contact.tratativa) row('Tratativa', contact.tratativa);
  });

  sectionTitle(3, 'Análise bancária');
  if (!ficha.analises.length) note('Nenhuma submissão registrada.');
  ficha.analises.forEach((analysis) => {
    subTitle(analysis.instituicao);
    row('Submetida em', dateTime(analysis.submetidaEm));
    row('Submetida por', analysis.submetidoPor?.nome);
    row('Resposta', joinParts([label(RESPOSTA, analysis.resposta), analysis.respostaDetalhe], '  •  '), true);
    if (analysis.respondidaEm) row('Respondida em', dateTime(analysis.respondidaEm));
    row('Veículo', joinParts([analysis.veiculoMarca, analysis.veiculoModelo, analysis.anoModelo || analysis.anoFabricacao ? `${analysis.anoModelo ?? '—'}/${analysis.anoFabricacao ?? '—'}` : ''], ' '));
    row('Valor do veículo', money(analysis.valorVeiculo));
    row('Entrada', money(analysis.valorEntrada));
    row('Financiado', money(analysis.valorFinanciado));
    row('Parcelas', analysis.quantidadeParcelas ? `${analysis.quantidadeParcelas}x de ${money(analysis.valorParcela)}` : '—');
    if (analysis.observacoes) row('Observações', analysis.observacoes);
  });

  sectionTitle(4, 'Acompanhamento financeiro');
  const diff = ficha.scoreInicio != null && ficha.scoreTermino != null ? ficha.scoreTermino - ficha.scoreInicio : null;
  row('Score - início do acompanhamento', ficha.scoreInicio != null ? `${ficha.scoreInicio}  (${dateTime(ficha.scoreInicioEm)})` : '—');
  row('Score - término do acompanhamento', ficha.scoreTermino != null ? `${ficha.scoreTermino}  (${dateTime(ficha.scoreTerminoEm)})` : '—');
  if (diff !== null) row('Evolução do score', `${diff > 0 ? '+' : ''}${diff} pts`, true);
  if (!ficha.acompanhamentos.length) note('Nenhum contato do plano de ação registrado.');
  ficha.acompanhamentos.forEach((item) => {
    subTitle(`${item.ordem}º contato do plano de ação`);
    row('Realizado em', dateTime(item.realizadoEm));
    row('Realizado por', item.realizadoPor?.nome);
    item.itens.forEach((requirement) => row(requirement.requisito, requirement.cumprido ? 'OK' : 'Não', requirement.cumprido));
    if (item.observacoes) row('Observações', item.observacoes);
  });

  if (isDossie) {
    sectionTitle(5, 'Dossiê - histórico completo');
    note(`Registro cronológico de tudo o que foi feito nesta ficha. Gerado em ${dateTime(new Date())}.`);
    if (!historico.length) note('Nenhum registro de histórico encontrado.');
    historico.forEach((entry) => {
      ensureSpace(46);
      const top = doc.y + 6;
      doc.moveTo(left, top).lineTo(right, top).strokeColor(line).lineWidth(0.5).stroke();
      doc.fillColor(muted).font('Helvetica').fontSize(8.5).text(`${dateTime(entry.em)}  •  ${entry.por}`, left, top + 5, { width });
      doc.fillColor(navy).font('Helvetica-Bold').fontSize(9.5).text(entry.acao, left, doc.y + 1, { width });
      if (entry.detalhe) doc.fillColor(muted).font('Helvetica').fontSize(9).text(entry.detalhe, left, doc.y + 1, { width });
      doc.x = left;
    });
  }

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0;
    doc.fillColor(muted).font('Helvetica').fontSize(8).text(`${loja?.nome || 'VFC Multimarcas'}  •  Ficha ${String(ficha.id).padStart(5, '0')}  •  Página ${i + 1} de ${range.count}`, left, 810, { width, align: 'center', lineBreak: false });
  }
  doc.end();
}
