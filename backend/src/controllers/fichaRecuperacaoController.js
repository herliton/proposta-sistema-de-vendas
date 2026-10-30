import { fichaPdfFilename, renderFichaPdf } from '../services/fichaPdfService.js';
import { prisma } from '../config/database.js';
import { created, notFound, ok } from '../utils/response.js';
import { storeScope, writeStoreId } from '../utils/storeScope.js';
import { digitsOnly, isValidCnpj, isValidCpf } from '../utils/customerValidation.js';

const roleOf = (user) => String(user?.perfil || user?.role || '').toUpperCase();
const userId = (user) => Number(user?.id);
const isOversight = (user) => ['ADMIN', 'SUPPORT'].includes(roleOf(user));

export const FICHA_STATUSES = ['ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'];
const SEXOS = ['MASCULINO', 'FEMININO'];
const RESIDENCIAS = ['PROPRIA', 'ALUGADA', 'CEDIDA'];
const CLASSIFICACOES = ['CARTEIRA_ASSINADA', 'AUTONOMO'];
const TIPOS_REFERENCIA = ['AMIGO', 'PAI', 'MAE', 'FILHO', 'OUTROS'];
const RESPOSTAS = ['EM_ANALISE', 'APROVADA', 'RECUSADA', 'CONDICIONADA'];
export const REQUISITOS_PLANO_ACAO = [
  'Extrato da movimentação bancária da conta corrente',
  'Abertura de contas (poupança e corrente)',
  'Pagamentos em dia',
  'Atualização de endereço online no Serasa',
  'Print do histórico do score no Serasa',
  'Limpeza de tentativas de crédito',
  'Print do relatório do cadastro positivo',
  'Uso do cartão de crédito com redução de gastos',
  'Comprovantes das 2 contas de serviços',
];

const fail = (res, message, error = 'INVALID_FICHA', status = 400) => res.status(status).json({ success: false, error, message });
const invalid = (message) => ({ error: message });

const text = (value, max, label, { required = false } = {}) => {
  if (value === undefined) return required ? invalid(`${label} é obrigatório.`) : { skip: true };
  const clean = String(value ?? '').trim();
  if (!clean) return required ? invalid(`${label} é obrigatório.`) : { value: null };
  if (clean.length > max) return invalid(`${label} deve ter até ${max} caracteres.`);
  return { value: clean };
};
const choice = (value, options, label) => {
  if (value === undefined) return { skip: true };
  const clean = String(value ?? '').trim().toUpperCase();
  if (!clean) return { value: null };
  return options.includes(clean) ? { value: clean } : invalid(`${label} inválido.`);
};
const dateOnly = (value, label) => {
  if (value === undefined) return { skip: true };
  const clean = String(value ?? '').trim();
  if (!clean) return { value: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return invalid(`${label} deve estar no formato AAAA-MM-DD.`);
  const date = new Date(`${clean}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? invalid(`${label} inválida.`) : { value: date };
};
const dateTime = (value, label) => {
  if (value === undefined) return { skip: true };
  const clean = String(value ?? '').trim();
  if (!clean) return { value: null };
  const date = new Date(clean);
  return Number.isNaN(date.getTime()) ? invalid(`${label} inválida.`) : { value: date };
};
const money = (value, label) => {
  if (value === undefined) return { skip: true };
  if (value === null || value === '') return { value: null };
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 9999999999.99) return invalid(`${label} deve ser um valor maior ou igual a zero.`);
  return { value: Math.round(number * 100) / 100 };
};
const integer = (value, label, min, max) => {
  if (value === undefined) return { skip: true };
  if (value === null || value === '') return { value: null };
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) return invalid(`${label} deve ser um número inteiro entre ${min} e ${max}.`);
  return { value: number };
};
const phone = (value, label) => {
  if (value === undefined) return { skip: true };
  const digits = digitsOnly(value);
  if (!digits) return { value: null };
  return digits.length >= 10 && digits.length <= 13 ? { value: digits } : invalid(`${label} deve ter DDD e número válidos.`);
};
const uf = (value, label) => {
  if (value === undefined) return { skip: true };
  const clean = String(value ?? '').trim().toUpperCase();
  if (!clean) return { value: null };
  return /^[A-Z]{2}$/.test(clean) ? { value: clean } : invalid(`${label} deve ter 2 letras.`);
};
const clock = (value, label) => {
  if (value === undefined) return { skip: true };
  const clean = String(value ?? '').trim();
  if (!clean) return { value: null };
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(clean) ? { value: clean } : invalid(`${label} deve estar no formato HH:MM.`);
};

const collect = (rules) => {
  const data = {};
  for (const [key, result] of rules) {
    if (result.error) return result;
    if (!result.skip) data[key] = result.value;
  }
  return { data };
};

const parseFicha = (body) => {
  const cnpjRaw = body.empresaCnpj === undefined ? undefined : digitsOnly(body.empresaCnpj);
  if (cnpjRaw && !isValidCnpj(cnpjRaw)) return invalid('Informe um CNPJ da empresa válido.');
  const parsed = collect([
    ['rg', text(body.rg, 30, 'RG')],
    ['orgaoEmissor', text(body.orgaoEmissor, 30, 'Órgão emissor')],
    ['ufEmissor', uf(body.ufEmissor, 'UF do órgão emissor')],
    ['dataEmissaoRg', dateOnly(body.dataEmissaoRg, 'Data de emissão do RG')],
    ['naturalidade', text(body.naturalidade, 100, 'Naturalidade')],
    ['naturalidadeUf', uf(body.naturalidadeUf, 'UF da naturalidade')],
    ['dataNascimento', dateOnly(body.dataNascimento, 'Data de nascimento')],
    ['cnhNumero', text(body.cnhNumero, 20, 'Número da CNH')],
    ['cnhValidade', dateOnly(body.cnhValidade, 'Validade da CNH')],
    ['cnhCategoria', choice(body.cnhCategoria, ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE', 'ACC'], 'Categoria da CNH')],
    ['sexo', choice(body.sexo, SEXOS, 'Sexo')],
    ['estadoCivil', text(body.estadoCivil, 30, 'Estado civil')],
    ['residenciaTipo', choice(body.residenciaTipo, RESIDENCIAS, 'Tipo de residência')],
    ['tempoResidencia', text(body.tempoResidencia, 60, 'Tempo de residência')],
    ['telefoneFixo', phone(body.telefoneFixo, 'Telefone fixo')],
    ['telefoneCelular', phone(body.telefoneCelular, 'Telefone celular')],
    ['whatsapp', phone(body.whatsapp, 'WhatsApp')],
    ['empresaCnpj', cnpjRaw === undefined ? { skip: true } : { value: cnpjRaw || null }],
    ['empresaNome', text(body.empresaNome, 150, 'Nome da empresa')],
    ['dataAdmissao', dateOnly(body.dataAdmissao, 'Data de admissão')],
    ['renda', money(body.renda, 'Renda')],
    ['cargoFuncao', text(body.cargoFuncao, 100, 'Cargo/função')],
    ['classificacaoTrabalho', choice(body.classificacaoTrabalho, CLASSIFICACOES, 'Classificação de trabalho')],
    ['valorVeiculo', money(body.valorVeiculo, 'Valor do veículo')],
    ['valorEntrada', money(body.valorEntrada, 'Valor de entrada')],
    ['valorFinanciado', money(body.valorFinanciado, 'Valor financiado')],
    ['valorTarifaTramite', money(body.valorTarifaTramite, 'Tarifa de trâmite')],
    ['dataEntradaFicha', dateTime(body.dataEntradaFicha, 'Data de entrada da ficha')],
    ['status', choice(body.status, FICHA_STATUSES, 'Status')],
  ]);
  if (parsed.error) return parsed;
  if (parsed.data.dataEntradaFicha === null) delete parsed.data.dataEntradaFicha;
  if (parsed.data.status === null) delete parsed.data.status;
  return parsed;
};

const parseClientePatch = (input) => {
  if (!input || typeof input !== 'object') return { data: {} };
  const email = input.email === undefined ? undefined : String(input.email ?? '').trim().toLowerCase();
  if (email && (email.length > 191 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return invalid('Informe um e-mail válido.');
  const cep = input.cep === undefined ? undefined : digitsOnly(input.cep);
  if (cep && cep.length !== 8) return invalid('Informe um CEP válido.');
  const telefone = input.telefone === undefined ? undefined : digitsOnly(input.telefone);
  if (telefone && (telefone.length < 10 || telefone.length > 13)) return invalid('Informe um telefone válido com DDD.');
  const nome = input.nome === undefined ? undefined : String(input.nome ?? '').trim();
  if (nome !== undefined && (!nome || nome.length > 191)) return invalid('Informe o nome completo do cliente.');
  return collect([
    ['nome', nome === undefined ? { skip: true } : { value: nome }],
    ['email', email === undefined ? { skip: true } : { value: email || null }],
    ['telefone', telefone === undefined ? { skip: true } : { value: telefone || null }],
    ['cep', cep === undefined ? { skip: true } : { value: cep || null }],
    ['logradouro', text(input.logradouro, 191, 'Logradouro')],
    ['numero', text(input.numero, 30, 'Número')],
    ['complemento', text(input.complemento, 120, 'Complemento')],
    ['bairro', text(input.bairro, 100, 'Bairro')],
    ['cidade', text(input.cidade, 100, 'Cidade')],
    ['estado', uf(input.estado, 'UF do endereço')],
  ]);
};

const parseReferencias = (list) => {
  if (list === undefined) return { skip: true };
  if (!Array.isArray(list) || list.length > 10) return invalid('Informe até 10 referências pessoais.');
  const rows = [];
  for (const item of list) {
    const nome = String(item?.nome ?? '').trim();
    const telefone = digitsOnly(item?.telefone);
    if (!nome && !telefone) continue;
    const tipo = String(item?.tipo ?? '').trim().toUpperCase();
    if (!nome || nome.length > 120) return invalid('Informe o nome de cada referência (até 120 caracteres).');
    if (telefone.length < 10 || telefone.length > 13) return invalid(`Informe o telefone com DDD da referência ${nome}.`);
    if (!TIPOS_REFERENCIA.includes(tipo)) return invalid(`Selecione o tipo da referência ${nome}.`);
    rows.push({ nome, telefone, tipo });
  }
  return { rows };
};

const parseOpcoes = (list) => {
  if (list === undefined) return { skip: true };
  if (!Array.isArray(list) || list.length > 2) return invalid('Informe até 2 opções de veículo.');
  const rows = [];
  for (const item of list) {
    const marca = String(item?.marca ?? '').trim();
    const modelo = String(item?.modelo ?? '').trim();
    const rawParcels = Array.isArray(item?.parcelas) ? item.parcelas : [];
    const parcelas = [];
    for (const parcel of rawParcels) {
      if ((parcel?.quantidade === '' || parcel?.quantidade == null) && !parcel?.parcelaMinima && !parcel?.parcelaMaxima) continue;
      const quantidade = integer(parcel.quantidade, 'Quantidade de parcelas', 1, 120);
      const minima = money(parcel.parcelaMinima, 'Parcela mínima');
      const maxima = money(parcel.parcelaMaxima, 'Parcela máxima');
      const err = [quantidade, minima, maxima].find((r) => r.error);
      if (err) return err;
      if (quantidade.value == null || minima.value == null || maxima.value == null) return invalid('Informe quantidade, parcela mínima e parcela máxima.');
      if (minima.value > maxima.value) return invalid('A parcela mínima não pode ser maior que a parcela máxima.');
      parcelas.push({ quantidade: quantidade.value, parcelaMinima: minima.value, parcelaMaxima: maxima.value });
    }
    if (!marca && !modelo && !parcelas.length) continue;
    if (!marca || !modelo || marca.length > 100 || modelo.length > 100) return invalid('Informe marca e modelo de cada opção de veículo.');
    const anoModelo = integer(item.anoModelo, 'Ano modelo', 1900, 2100);
    const anoFabricacao = integer(item.anoFabricacao, 'Ano de fabricação', 1900, 2100);
    const err = [anoModelo, anoFabricacao].find((r) => r.error);
    if (err) return err;
    rows.push({ marca, modelo, anoModelo: anoModelo.value ?? null, anoFabricacao: anoFabricacao.value ?? null, parcelas });
  }
  return { rows };
};

const protocolFor = (date, inicio) => {
  if (!date || !inicio) return null;
  const [, month, day] = String(date.toISOString().slice(0, 10)).split('-');
  return `${day}${month}${inicio.replace(':', '')}`;
};

const parseContato = (body, partial = false) => {
  const parsed = collect([
    ['data', dateOnly(body.data, 'Data do contato')],
    ['dataLigacaoPosVenda', dateOnly(body.dataLigacaoPosVenda, 'Data da ligação do pós-venda')],
    ['inicio', clock(body.inicio, 'Início')],
    ['termino', clock(body.termino, 'Término')],
    ['protocolo', text(body.protocolo, 30, 'Protocolo')],
    ['spc', text(body.spc, 60, 'SPC')],
    ['dividaValor', money(body.dividaValor, 'Dívida')],
    ['dividaObservacao', text(body.dividaObservacao, 120, 'Observação da dívida')],
    ['consultorNome', text(body.consultorNome, 120, 'Consultor(a)', { required: !partial || body.consultorNome !== undefined })],
    ['setor', text(body.setor, 80, 'Setor')],
    ['tratativa', text(body.tratativa, 500, 'Tratativa')],
  ]);
  if (parsed.error) return parsed;
  if (!partial && !parsed.data.data) return invalid('Informe a data do contato.');
  if (parsed.data.inicio && parsed.data.termino && parsed.data.termino < parsed.data.inicio) return invalid('O término não pode ser anterior ao início.');
  return parsed;
};

const parseAnalise = (body, partial = false) => {
  const parsed = collect([
    ['instituicao', text(body.instituicao, 120, 'Instituição bancária', { required: !partial || body.instituicao !== undefined })],
    ['submetidaEm', dateTime(body.submetidaEm, 'Data e hora da submissão')],
    ['resposta', choice(body.resposta, RESPOSTAS, 'Resposta')],
    ['respostaDetalhe', text(body.respostaDetalhe, 500, 'Detalhe da resposta')],
    ['veiculoMarca', text(body.veiculoMarca, 100, 'Marca')],
    ['veiculoModelo', text(body.veiculoModelo, 100, 'Modelo')],
    ['anoModelo', integer(body.anoModelo, 'Ano modelo', 1900, 2100)],
    ['anoFabricacao', integer(body.anoFabricacao, 'Ano de fabricação', 1900, 2100)],
    ['valorVeiculo', money(body.valorVeiculo, 'Valor do veículo')],
    ['valorEntrada', money(body.valorEntrada, 'Valor de entrada')],
    ['valorFinanciado', money(body.valorFinanciado, 'Valor financiado')],
    ['quantidadeParcelas', integer(body.quantidadeParcelas, 'Quantidade de parcelas', 1, 120)],
    ['valorParcela', money(body.valorParcela, 'Valor da parcela')],
    ['observacoes', text(body.observacoes, 500, 'Observações')],
  ]);
  if (parsed.error) return parsed;
  if (!partial && !parsed.data.submetidaEm) return invalid('Informe a data e hora em que a ficha foi submetida.');
  if (parsed.data.submetidaEm === null) delete parsed.data.submetidaEm;
  if (parsed.data.resposta === null) delete parsed.data.resposta;
  return parsed;
};

const parseItens = (list) => {
  if (list === undefined) return { skip: true };
  if (!Array.isArray(list) || list.length > 30) return invalid('A lista de requisitos é inválida.');
  const rows = [];
  for (const item of list) {
    const requisito = String(item?.requisito ?? '').trim();
    if (!requisito || requisito.length > 191) return invalid('Cada requisito deve ter entre 1 e 191 caracteres.');
    rows.push({ requisito, cumprido: item?.cumprido === true });
  }
  return { rows };
};

const fichaInclude = {
  cliente: { select: { id: true, nome: true, documento: true, tipoPessoa: true, email: true, telefone: true, cep: true, logradouro: true, numero: true, complemento: true, bairro: true, cidade: true, estado: true } },
  gerente: { select: { id: true, nome: true } },
  vendedor: { select: { id: true, nome: true } },
  proposta: { select: { id: true, veiculo: { select: { marca: true, modelo: true, anoModelo: true, ano: true } } } },
  referencias: { orderBy: { id: 'asc' } },
  opcoes: { orderBy: { ordem: 'asc' }, include: { parcelas: { orderBy: { quantidade: 'asc' } } } },
  contatos: { orderBy: { ordem: 'asc' }, include: { registradoPor: { select: { id: true, nome: true } } } },
  analises: { orderBy: { submetidaEm: 'desc' }, include: { submetidoPor: { select: { id: true, nome: true } } } },
  acompanhamentos: { orderBy: { ordem: 'asc' }, include: { itens: { orderBy: { id: 'asc' } }, realizadoPor: { select: { id: true, nome: true } } } },
};

const scopeFor = (user) => {
  const base = { deletedAt: null };
  const role = roleOf(user);
  if (isOversight(user)) return { ...base, ...storeScope(user) };
  const me = userId(user);
  if (role === 'MANAGER') return { ...base, ...storeScope(user) };
  return { ...base, vendedorId: me, ...storeScope(user) };
};

const loadFicha = (user, id) => prisma.fichaRecuperacao.findFirst({ where: { id, ...scopeFor(user) }, include: fichaInclude });
const parseId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};
const audit = (tx, req, action, details) => tx.auditLog.create({ data: { actorId: userId(req.user), action, details } });

const customerWhereForUser = async (user) => {
  const role = roleOf(user);
  if (isOversight(user)) return {};
  if (role === 'MANAGER') return { OR: [{ gerenteId: userId(user) }, { vendedor: { usuario: { gerenteId: userId(user) } } }] };
  const seller = await prisma.vendedor.findFirst({ where: { usuarioId: userId(user) }, select: { id: true } });
  return { vendedorId: seller?.id ?? -1 };
};

const resolveResponsaveis = async (req, lojaId, body, current = {}) => {
  const role = roleOf(req.user);
  const me = userId(req.user);
  if (role === 'SELLER') {
    const self = await prisma.usuario.findUnique({ where: { id: me }, select: { gerenteId: true } });
    return { vendedorId: me, gerenteId: self?.gerenteId ?? null };
  }
  let vendedorId = current.vendedorId ?? null;
  let gerenteId = current.gerenteId ?? (role === 'MANAGER' ? me : null);
  if (body.vendedorId !== undefined) {
    vendedorId = body.vendedorId === null || body.vendedorId === '' ? null : parseId(body.vendedorId);
    if (body.vendedorId !== null && body.vendedorId !== '' && !vendedorId) return invalid('Selecione um vendedor válido.');
    if (vendedorId) {
      const seller = await prisma.usuario.findFirst({ where: { id: vendedorId, status: 'ativo', lojaId, perfil: { in: ['SELLER', 'MANAGER'] } }, select: { id: true, perfil: true, gerenteId: true } });
      if (!seller) return invalid('O vendedor deve estar ativo e vinculado à mesma loja.');
      if (role === 'MANAGER' && seller.id !== me && seller.gerenteId !== me) return invalid('Você só pode vincular vendedores da sua equipe.');
      gerenteId = seller.perfil === 'MANAGER' ? seller.id : seller.gerenteId ?? gerenteId;
    }
  }
  if (body.gerenteId !== undefined && role !== 'MANAGER') {
    gerenteId = body.gerenteId === null || body.gerenteId === '' ? null : parseId(body.gerenteId);
    if (body.gerenteId !== null && body.gerenteId !== '' && !gerenteId) return invalid('Selecione um gerente válido.');
    if (gerenteId && !await prisma.usuario.findFirst({ where: { id: gerenteId, status: 'ativo', lojaId, perfil: 'MANAGER' }, select: { id: true } })) return invalid('O gerente deve estar ativo e vinculado à mesma loja.');
  }
  return { vendedorId, gerenteId };
};

export const getRequisitos = async (_req, res) => ok(res, REQUISITOS_PLANO_ACAO, 'Requisitos do plano de ação.');

export const listResponsaveis = async (req, res) => {
  const role = roleOf(req.user);
  if (role === 'SELLER') return ok(res, [], 'Responsáveis carregados.');
  const where = { status: 'ativo', perfil: { in: ['SELLER', 'MANAGER'] }, ...storeScope(req.user) };
  if (role === 'MANAGER') where.OR = [{ id: userId(req.user) }, { gerenteId: userId(req.user) }];
  const rows = await prisma.usuario.findMany({ where, select: { id: true, nome: true, perfil: true, gerenteId: true }, orderBy: { nome: 'asc' } });
  return ok(res, rows, 'Responsáveis carregados.');
};

export const listFichas = async (req, res) => {
  const status = String(req.query.status || '').toUpperCase();
  const search = String(req.query.search || '').trim();
  const digits = digitsOnly(search);
  const filters = [scopeFor(req.user)];
  if (FICHA_STATUSES.includes(status)) filters.push({ status });
  if (search) {
    filters.push({ OR: [
      { cliente: { nome: { contains: search } } },
      ...(digits ? [{ cliente: { documento: { contains: digits } } }] : []),
      { vendedor: { nome: { contains: search } } },
      { gerente: { nome: { contains: search } } },
    ] });
  }
  const rows = await prisma.fichaRecuperacao.findMany({
    where: { AND: filters },
    orderBy: { dataEntradaFicha: 'desc' },
    take: 200,
    select: {
      id: true, status: true, dataEntradaFicha: true, scoreInicio: true, scoreTermino: true, propostaId: true,
      cliente: { select: { id: true, nome: true, documento: true, telefone: true } },
      gerente: { select: { id: true, nome: true } },
      vendedor: { select: { id: true, nome: true } },
      _count: { select: { contatos: true, analises: true, acompanhamentos: true } },
    },
  });
  return ok(res, rows, 'Fichas de recuperação carregadas.');
};

export const getFicha = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 'Identificador de ficha inválido.');
  const ficha = await loadFicha(req.user, id);
  if (!ficha) return notFound(res, 'Ficha de recuperação não encontrada.');
  return ok(res, ficha, 'Ficha carregada.');
};

export const createFicha = async (req, res) => {
  const role = roleOf(req.user);
  let cliente;
  let lojaId;
  if (req.body.clienteId) {
    const clienteId = parseId(req.body.clienteId);
    if (!clienteId) return fail(res, 'Selecione um cliente válido.');
    cliente = await prisma.cliente.findFirst({ where: { AND: [{ id: clienteId, deletedAt: null }, storeScope(req.user), await customerWhereForUser(req.user)] } });
    if (!cliente) return notFound(res, 'Cliente não encontrado na sua carteira.');
    lojaId = cliente.lojaId;
  } else {
    const input = req.body.cliente || {};
    const nome = String(input.nome ?? '').trim();
    const documento = digitsOnly(input.documento);
    const telefone = digitsOnly(input.telefone);
    const tipoPessoa = documento.length === 14 ? 'pj' : 'pf';
    if (!nome || nome.length > 191) return fail(res, 'Informe o nome completo do cliente.');
    if (tipoPessoa === 'pf' ? !isValidCpf(documento) : !isValidCnpj(documento)) return fail(res, 'Informe um CPF válido.');
    if (telefone.length < 10 || telefone.length > 13) return fail(res, 'Informe um telefone válido com DDD.');
    lojaId = isOversight(req.user) ? writeStoreId(req.user, req.body.lojaId) : Number(req.user.lojaId) || null;
    if (!lojaId) return fail(res, 'Selecione uma loja específica antes de cadastrar o cliente.', 'STORE_REQUIRED');
    const duplicate = await prisma.cliente.findFirst({ where: { documento } });
    if (duplicate) return fail(res, 'Já existe um cliente com este CPF/CNPJ. Busque-o na lista de clientes.', 'DUPLICATE_DOCUMENT', 409);
    cliente = { nome, documento, telefone, tipoPessoa, email: String(input.email ?? '').trim().toLowerCase() || null };
  }
  const people = await resolveResponsaveis(req, lojaId, req.body);
  if (people.error) return fail(res, people.error, 'INVALID_RESPONSIBLE');
  if (cliente.id) {
    const open = await prisma.fichaRecuperacao.findFirst({ where: { clienteId: cliente.id, deletedAt: null, status: { in: ['ABERTA', 'EM_ANDAMENTO'] } }, select: { id: true } });
    if (open) return res.status(409).json({ success: false, error: 'FICHA_EXISTS', message: 'Este cliente já possui uma ficha de recuperação em aberto.', data: { id: open.id } });
  }
  const propostaId = req.body.propostaId ? parseId(req.body.propostaId) : null;
  if (req.body.propostaId && (!propostaId || cliente.id == null || !await prisma.proposta.findFirst({ where: { id: propostaId, clienteId: cliente.id, lojaId }, select: { id: true } }))) return fail(res, 'A proposta informada não pertence ao cliente.');
  try {
    const ficha = await prisma.$transaction(async (tx) => {
      let customer = cliente;
      if (!customer.id) {
        const seller = people.vendedorId ? await tx.vendedor.findFirst({ where: { usuarioId: people.vendedorId }, select: { id: true } }) : null;
        customer = await tx.cliente.create({ data: { ...cliente, lojaId, vendedorId: seller?.id ?? null, gerenteId: people.gerenteId, status: 'ativo' } });
        await audit(tx, req, 'CUSTOMER_CREATED', { clienteId: customer.id, lojaId, origem: 'FICHA_RECUPERACAO' });
      }
      const row = await tx.fichaRecuperacao.create({ data: { lojaId, clienteId: customer.id, propostaId, gerenteId: people.gerenteId, vendedorId: people.vendedorId, telefoneCelular: customer.telefone || null, renda: customer.rendaMensal ?? null } });
      await audit(tx, req, 'FICHA_RECUPERACAO_CREATED', { fichaId: row.id, clienteId: customer.id, role });
      return row;
    });
    return created(res, await loadFicha(req.user, ficha.id), 'Ficha de recuperação criada.');
  } catch (error) {
    if (error.code === 'P2002') return fail(res, 'Já existe um cliente com este CPF/CNPJ.', 'DUPLICATE_DOCUMENT', 409);
    throw error;
  }
};

const CAMPOS = {
  rg: 'RG', orgaoEmissor: 'Órgão emissor', ufEmissor: 'UF do órgão emissor', dataEmissaoRg: 'Data de emissão do RG',
  naturalidade: 'Naturalidade', naturalidadeUf: 'UF da naturalidade', dataNascimento: 'Data de nascimento',
  cnhNumero: 'Número da CNH', cnhValidade: 'Validade da CNH', cnhCategoria: 'Categoria da CNH', sexo: 'Sexo',
  estadoCivil: 'Estado civil', residenciaTipo: 'Residência', tempoResidencia: 'Tempo de residência',
  telefoneFixo: 'Telefone fixo', telefoneCelular: 'Telefone celular', whatsapp: 'WhatsApp',
  empresaCnpj: 'CNPJ da empresa', empresaNome: 'Nome da empresa', dataAdmissao: 'Data de admissão', renda: 'Renda',
  cargoFuncao: 'Cargo/função', classificacaoTrabalho: 'Classificação de trabalho', valorVeiculo: 'Valor do veículo',
  valorEntrada: 'Valor de entrada', valorFinanciado: 'Valor financiado', valorTarifaTramite: 'Tarifa de trâmite',
  dataEntradaFicha: 'Data de entrada da ficha', status: 'Status',
  nome: 'Nome do cliente', email: 'E-mail', telefone: 'Telefone', cep: 'CEP', logradouro: 'Logradouro', numero: 'Número',
  complemento: 'Complemento', bairro: 'Bairro', cidade: 'Cidade', estado: 'UF do endereço',
};
const CAMPOS_VALOR = new Set(['renda', 'valorVeiculo', 'valorEntrada', 'valorFinanciado', 'valorTarifaTramite']);
const ROTULOS_VALOR = {
  MASCULINO: 'Masculino', FEMININO: 'Feminino', PROPRIA: 'Própria', ALUGADA: 'Alugada', CEDIDA: 'Cedida',
  CARTEIRA_ASSINADA: 'Carteira assinada', AUTONOMO: 'Autônomo',
  ABERTA: 'Aberta', EM_ANDAMENTO: 'Em andamento', CONCLUIDA: 'Concluída', CANCELADA: 'Cancelada',
};

const humanValue = (key, value) => {
  if (value === null || value === undefined || value === '') return 'vazio';
  if (value instanceof Date) {
    const midnight = value.getUTCHours() === 0 && value.getUTCMinutes() === 0 && value.getUTCSeconds() === 0;
    return midnight ? value.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : value.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  }
  if (CAMPOS_VALOR.has(key)) return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return ROTULOS_VALOR[value] || String(value);
};

const comparable = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && typeof value.toNumber === 'function') return value.toNumber().toFixed(2);
  if (typeof value === 'number') return value.toFixed(2);
  return String(value);
};

const diffFields = (before, patch) => Object.keys(patch)
  .filter((key) => CAMPOS[key] && comparable(before?.[key]) !== comparable(patch[key]))
  .map((key) => ({ campo: CAMPOS[key], antes: humanValue(key, before?.[key]), depois: humanValue(key, patch[key]) }));

const refsSummary = (rows) => (rows.length ? rows.map((row) => `${row.nome} (${row.tipo}) ${row.telefone || ''}`.trim()).join('; ') : 'vazio');
const opcoesSummary = (rows) => (rows.length
  ? rows.map((row, index) => `${index + 1}ª: ${[row.marca, row.modelo, `${row.anoModelo ?? ''}/${row.anoFabricacao ?? ''}`].join(' ')} - ${(row.parcelas || []).map((parcel) => `${parcel.quantidade}x ${Number(parcel.parcelaMinima ?? 0).toFixed(2)}-${Number(parcel.parcelaMaxima ?? 0).toFixed(2)}`).join(', ')}`).join('; ')
  : 'vazio');

export const updateFicha = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 'Identificador de ficha inválido.');
  const existing = await prisma.fichaRecuperacao.findFirst({ where: { id, ...scopeFor(req.user) }, include: { cliente: true, referencias: { orderBy: { id: 'asc' } }, opcoes: { orderBy: { ordem: 'asc' }, include: { parcelas: { orderBy: { id: 'asc' } } } }, vendedor: { select: { nome: true } }, gerente: { select: { nome: true } } } });
  if (!existing) return notFound(res, 'Ficha de recuperação não encontrada.');
  const ficha = parseFicha(req.body);
  const clientePatch = parseClientePatch(req.body.cliente);
  const referencias = parseReferencias(req.body.referencias);
  const opcoes = parseOpcoes(req.body.opcoes);
  const problem = [ficha, clientePatch, referencias, opcoes].find((item) => item.error);
  if (problem) return fail(res, problem.error);
  const valorVeiculo = ficha.data.valorVeiculo === undefined ? existing.valorVeiculo : ficha.data.valorVeiculo;
  const valorEntrada = ficha.data.valorEntrada === undefined ? existing.valorEntrada : ficha.data.valorEntrada;
  if (valorVeiculo != null && valorEntrada != null && Number(valorEntrada) > Number(valorVeiculo)) return fail(res, 'O valor de entrada não pode ser maior que o valor do veículo.');
  const wantsPeople = req.body.vendedorId !== undefined || req.body.gerenteId !== undefined;
  const people = wantsPeople ? await resolveResponsaveis(req, existing.lojaId, req.body, existing) : null;
  if (people?.error) return fail(res, people.error, 'INVALID_RESPONSIBLE');
  await prisma.$transaction(async (tx) => {
    if (Object.keys(clientePatch.data).length) await tx.cliente.update({ where: { id: existing.clienteId }, data: clientePatch.data });
    await tx.fichaRecuperacao.update({ where: { id }, data: { ...ficha.data, ...(people ? { vendedorId: people.vendedorId, gerenteId: people.gerenteId } : {}) } });
    if (!referencias.skip) {
      await tx.fichaReferencia.deleteMany({ where: { fichaId: id } });
      if (referencias.rows.length) await tx.fichaReferencia.createMany({ data: referencias.rows.map((row) => ({ ...row, fichaId: id })) });
    }
    if (!opcoes.skip) {
      await tx.fichaOpcaoVeiculo.deleteMany({ where: { fichaId: id } });
      for (const [index, option] of opcoes.rows.entries()) {
        const { parcelas, ...vehicle } = option;
        await tx.fichaOpcaoVeiculo.create({ data: { ...vehicle, ordem: index + 1, fichaId: id, parcelas: { create: parcelas } } });
      }
    }
    const alteracoes = [...diffFields(existing, ficha.data), ...diffFields(existing.cliente, clientePatch.data)];
    if (!referencias.skip) {
      const antes = refsSummary(existing.referencias); const depois = refsSummary(referencias.rows);
      if (antes !== depois) alteracoes.push({ campo: 'Referências pessoais', antes, depois });
    }
    if (!opcoes.skip) {
      const antes = opcoesSummary(existing.opcoes); const depois = opcoesSummary(opcoes.rows);
      if (antes !== depois) alteracoes.push({ campo: 'Opções de veículo e parcelas', antes, depois });
    }
    if (people && (people.vendedorId !== existing.vendedorId || people.gerenteId !== existing.gerenteId)) {
      const ids = [people.vendedorId, people.gerenteId].filter(Boolean);
      const names = new Map((await tx.usuario.findMany({ where: { id: { in: ids } }, select: { id: true, nome: true } })).map((user) => [user.id, user.nome]));
      if (people.vendedorId !== existing.vendedorId) alteracoes.push({ campo: 'Vendedor', antes: existing.vendedor?.nome || 'vazio', depois: names.get(people.vendedorId) || 'vazio' });
      if (people.gerenteId !== existing.gerenteId) alteracoes.push({ campo: 'Gerente', antes: existing.gerente?.nome || 'vazio', depois: names.get(people.gerenteId) || 'vazio' });
    }
    if (alteracoes.length) await audit(tx, req, 'FICHA_RECUPERACAO_UPDATED', { fichaId: id, alteracoes });
  });
  return ok(res, await loadFicha(req.user, id), 'Ficha atualizada.');
};

export const updateScore = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 'Identificador de ficha inválido.');
  const existing = await prisma.fichaRecuperacao.findFirst({ where: { id, ...scopeFor(req.user) } });
  if (!existing) return notFound(res, 'Ficha de recuperação não encontrada.');
  const data = {};
  for (const [field, stamp] of [['scoreInicio', 'scoreInicioEm'], ['scoreTermino', 'scoreTerminoEm']]) {
    if (req.body[field] === undefined) continue;
    const parsed = integer(req.body[field], 'Score', 0, 1000);
    if (parsed.error) return fail(res, parsed.error);
    data[field] = parsed.value;
    if (parsed.value !== existing[field]) data[stamp] = parsed.value === null ? null : new Date();
  }
  await prisma.$transaction(async (tx) => {
    await tx.fichaRecuperacao.update({ where: { id }, data });
    await audit(tx, req, 'FICHA_RECUPERACAO_SCORE_UPDATED', { fichaId: id, scoreInicio: data.scoreInicio, scoreTermino: data.scoreTermino, anteriorInicio: existing.scoreInicio, anteriorTermino: existing.scoreTermino });
  });
  return ok(res, await loadFicha(req.user, id), 'Score atualizado.');
};

const markInProgress = (tx, ficha) => ficha.status === 'ABERTA' ? tx.fichaRecuperacao.update({ where: { id: ficha.id }, data: { status: 'EM_ANDAMENTO' } }) : null;

const withFicha = (handler) => async (req, res) => {
  const fichaId = parseId(req.params.id);
  if (!fichaId) return fail(res, 'Identificador de ficha inválido.');
  const ficha = await prisma.fichaRecuperacao.findFirst({ where: { id: fichaId, ...scopeFor(req.user) } });
  if (!ficha) return notFound(res, 'Ficha de recuperação não encontrada.');
  return handler(req, res, ficha);
};
const canRemove = (req, res) => {
  if (['ADMIN', 'SUPPORT', 'MANAGER'].includes(roleOf(req.user))) return true;
  fail(res, 'Seu perfil não pode excluir registros da ficha.', 'FORBIDDEN', 403);
  return false;
};
const subId = (req, res) => {
  const subId = parseId(req.params.itemId);
  if (!subId) fail(res, 'Identificador do registro inválido.');
  return subId;
};

export const addContato = withFicha(async (req, res, ficha) => {
  const parsed = parseContato(req.body);
  if (parsed.error) return fail(res, parsed.error);
  const data = { ...parsed.data };
  if (!data.protocolo) data.protocolo = protocolFor(data.data, data.inicio);
  try {
    await prisma.$transaction(async (tx) => {
      const last = await tx.fichaContato.aggregate({ where: { fichaId: ficha.id }, _max: { ordem: true } });
      const row = await tx.fichaContato.create({ data: { ...data, fichaId: ficha.id, ordem: (last._max.ordem || 0) + 1, registradoPorId: userId(req.user) } });
      await markInProgress(tx, ficha);
      await audit(tx, req, 'FICHA_CONTATO_CREATED', { fichaId: ficha.id, contatoId: row.id });
    });
  } catch (error) {
    if (error.code === 'P2002') return fail(res, 'Outro contato foi registrado ao mesmo tempo. Tente novamente.', 'CONFLICT', 409);
    throw error;
  }
  return created(res, await loadFicha(req.user, ficha.id), 'Contato registrado.');
});

export const updateContato = withFicha(async (req, res, ficha) => {
  const itemId = subId(req, res);
  if (!itemId) return null;
  const current = await prisma.fichaContato.findFirst({ where: { id: itemId, fichaId: ficha.id } });
  if (!current) return notFound(res, 'Contato não encontrado.');
  const parsed = parseContato(req.body, true);
  if (parsed.error) return fail(res, parsed.error);
  const data = { ...parsed.data };
  if (data.data === null) delete data.data;
  await prisma.$transaction(async (tx) => {
    await tx.fichaContato.update({ where: { id: itemId }, data });
    await audit(tx, req, 'FICHA_CONTATO_UPDATED', { fichaId: ficha.id, contatoId: itemId });
  });
  return ok(res, await loadFicha(req.user, ficha.id), 'Contato atualizado.');
});

const ACOES = {
  FICHA_RECUPERACAO_CREATED: 'Ficha de recuperação criada',
  FICHA_RECUPERACAO_UPDATED: 'Ficha cadastral atualizada',
  FICHA_RECUPERACAO_SCORE_UPDATED: 'Score atualizado',
  FICHA_CONTATO_CREATED: 'Contato registrado no controle administrativo',
  FICHA_CONTATO_UPDATED: 'Contato do controle administrativo alterado',
  FICHA_CONTATO_DELETED: 'Contato do controle administrativo removido',
  FICHA_ANALISE_CREATED: 'Análise bancária registrada',
  FICHA_ANALISE_UPDATED: 'Análise bancária atualizada',
  FICHA_ANALISE_DELETED: 'Análise bancária removida',
  FICHA_ACOMPANHAMENTO_CREATED: 'Contato de acompanhamento financeiro registrado',
  FICHA_ACOMPANHAMENTO_UPDATED: 'Contato de acompanhamento financeiro alterado',
  FICHA_ACOMPANHAMENTO_DELETED: 'Contato de acompanhamento financeiro removido',
  FICHA_DELETED: 'Ficha excluída',
};

const scoreText = (value) => (value === null || value === undefined ? 'sem valor' : String(value));

const describeLog = (log) => {
  const details = log.details || {};
  const base = ACOES[log.action] || log.action;
  if (log.action === 'FICHA_RECUPERACAO_SCORE_UPDATED') {
    const parts = [];
    for (const [label, novo, antes] of [['início', details.scoreInicio, details.anteriorInicio], ['término', details.scoreTermino, details.anteriorTermino]]) {
      if (novo === undefined || novo === antes || (novo === null && antes === undefined)) continue;
      parts.push(`${label}: ${scoreText(antes)} para ${scoreText(novo)}`);
    }
    return { acao: base, detalhe: parts.join('; ') };
  }
  if (log.action === 'FICHA_RECUPERACAO_UPDATED') {
    if (Array.isArray(details.alteracoes)) return { acao: base, detalhe: details.alteracoes.map((item) => `${item.campo}: ${item.antes} para ${item.depois}`).join('\n') };
    if (Array.isArray(details.campos)) return { acao: base, detalhe: `Campos: ${details.campos.join(', ')}` };
  }
  if (log.action === 'FICHA_ANALISE_UPDATED' && details.resposta) return { acao: base, detalhe: `Resposta: ${details.resposta}` };
  return { acao: base, detalhe: '' };
};

const loadHistorico = async (fichaId) => {
  const logs = await prisma.auditLog.findMany({
    where: { action: { startsWith: 'FICHA_' }, details: { path: '$.fichaId', equals: fichaId } },
    orderBy: { createdAt: 'asc' },
    include: { actor: { select: { nome: true, perfil: true } } },
  });
  return logs.map((log) => ({ id: log.id, em: log.createdAt, por: log.actor?.nome || '—', perfil: log.actor?.perfil || null, ...describeLog(log) }));
};

export const getFichaHistorico = withFicha(async (req, res, ficha) => ok(res, await loadHistorico(ficha.id)));

export const downloadFichaPdf = withFicha(async (req, res, ficha) => {
  const full = await loadFicha(req.user, ficha.id);
  const loja = await prisma.loja.findUnique({ where: { id: full.lojaId } });
  const dossie = req.path.endsWith('/dossie');
  const historico = dossie ? await loadHistorico(full.id) : null;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fichaPdfFilename(full, dossie)}"`);
  if (dossie) await audit(prisma, req, 'FICHA_DOSSIE_GENERATED', { fichaId: full.id });
  renderFichaPdf(full, loja, res, { historico });
});

export const removeFicha = withFicha(async (req, res, ficha) => {
  if (!canRemove(req, res)) return null;
  await prisma.fichaRecuperacao.update({ where: { id: ficha.id }, data: { deletedAt: new Date() } });
  await audit(prisma, req, 'FICHA_DELETED', { fichaId: ficha.id, clienteId: ficha.clienteId });
  return ok(res, { id: ficha.id }, 'Ficha removida.');
});

export const removeContato = withFicha(async (req, res, ficha) => {
  if (!canRemove(req, res)) return null;
  const itemId = subId(req, res);
  if (!itemId) return null;
  const { count } = await prisma.fichaContato.deleteMany({ where: { id: itemId, fichaId: ficha.id } });
  if (!count) return notFound(res, 'Contato não encontrado.');
  await audit(prisma, req, 'FICHA_CONTATO_DELETED', { fichaId: ficha.id, contatoId: itemId });
  return ok(res, await loadFicha(req.user, ficha.id), 'Contato removido.');
});

export const addAnalise = withFicha(async (req, res, ficha) => {
  const parsed = parseAnalise(req.body);
  if (parsed.error) return fail(res, parsed.error);
  const data = { ...parsed.data };
  if (data.resposta && data.resposta !== 'EM_ANALISE') data.respondidaEm = new Date();
  await prisma.$transaction(async (tx) => {
    const row = await tx.fichaAnaliseBancaria.create({ data: { ...data, fichaId: ficha.id, submetidoPorId: userId(req.user) } });
    await markInProgress(tx, ficha);
    await audit(tx, req, 'FICHA_ANALISE_CREATED', { fichaId: ficha.id, analiseId: row.id });
  });
  return created(res, await loadFicha(req.user, ficha.id), 'Análise bancária registrada.');
});

export const updateAnalise = withFicha(async (req, res, ficha) => {
  const itemId = subId(req, res);
  if (!itemId) return null;
  const current = await prisma.fichaAnaliseBancaria.findFirst({ where: { id: itemId, fichaId: ficha.id } });
  if (!current) return notFound(res, 'Análise não encontrada.');
  const parsed = parseAnalise(req.body, true);
  if (parsed.error) return fail(res, parsed.error);
  const data = { ...parsed.data };
  if (data.resposta === 'EM_ANALISE') data.respondidaEm = null;
  else if (data.resposta && (current.resposta !== data.resposta || !current.respondidaEm)) data.respondidaEm = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.fichaAnaliseBancaria.update({ where: { id: itemId }, data });
    await audit(tx, req, 'FICHA_ANALISE_UPDATED', { fichaId: ficha.id, analiseId: itemId, resposta: data.resposta });
  });
  return ok(res, await loadFicha(req.user, ficha.id), 'Análise atualizada.');
});

export const removeAnalise = withFicha(async (req, res, ficha) => {
  if (!canRemove(req, res)) return null;
  const itemId = subId(req, res);
  if (!itemId) return null;
  const { count } = await prisma.fichaAnaliseBancaria.deleteMany({ where: { id: itemId, fichaId: ficha.id } });
  if (!count) return notFound(res, 'Análise não encontrada.');
  await audit(prisma, req, 'FICHA_ANALISE_DELETED', { fichaId: ficha.id, analiseId: itemId });
  return ok(res, await loadFicha(req.user, ficha.id), 'Análise removida.');
});

export const addAcompanhamento = withFicha(async (req, res, ficha) => {
  const when = dateTime(req.body.realizadoEm, 'Data e hora do contato');
  const observacoes = text(req.body.observacoes, 500, 'Observações');
  const itens = parseItens(req.body.itens);
  const problem = [when, observacoes, itens].find((item) => item.error);
  if (problem) return fail(res, problem.error);
  const rows = itens.skip ? REQUISITOS_PLANO_ACAO.map((requisito) => ({ requisito, cumprido: false })) : itens.rows;
  try {
    await prisma.$transaction(async (tx) => {
      const last = await tx.fichaAcompanhamento.aggregate({ where: { fichaId: ficha.id }, _max: { ordem: true } });
      const row = await tx.fichaAcompanhamento.create({
        data: { fichaId: ficha.id, ordem: (last._max.ordem || 0) + 1, realizadoEm: when.value || new Date(), realizadoPorId: userId(req.user), observacoes: observacoes.skip ? null : observacoes.value, itens: { create: rows } },
      });
      await markInProgress(tx, ficha);
      await audit(tx, req, 'FICHA_ACOMPANHAMENTO_CREATED', { fichaId: ficha.id, acompanhamentoId: row.id });
    });
  } catch (error) {
    if (error.code === 'P2002') return fail(res, 'Outro contato foi registrado ao mesmo tempo. Tente novamente.', 'CONFLICT', 409);
    throw error;
  }
  return created(res, await loadFicha(req.user, ficha.id), 'Acompanhamento registrado.');
});

export const updateAcompanhamento = withFicha(async (req, res, ficha) => {
  const itemId = subId(req, res);
  if (!itemId) return null;
  const current = await prisma.fichaAcompanhamento.findFirst({ where: { id: itemId, fichaId: ficha.id } });
  if (!current) return notFound(res, 'Acompanhamento não encontrado.');
  const when = dateTime(req.body.realizadoEm, 'Data e hora do contato');
  const observacoes = text(req.body.observacoes, 500, 'Observações');
  const itens = parseItens(req.body.itens);
  const problem = [when, observacoes, itens].find((item) => item.error);
  if (problem) return fail(res, problem.error);
  await prisma.$transaction(async (tx) => {
    await tx.fichaAcompanhamento.update({ where: { id: itemId }, data: { ...(when.skip || !when.value ? {} : { realizadoEm: when.value }), ...(observacoes.skip ? {} : { observacoes: observacoes.value }) } });
    if (!itens.skip) {
      await tx.fichaAcompanhamentoItem.deleteMany({ where: { acompanhamentoId: itemId } });
      await tx.fichaAcompanhamentoItem.createMany({ data: itens.rows.map((row) => ({ ...row, acompanhamentoId: itemId })) });
    }
    await audit(tx, req, 'FICHA_ACOMPANHAMENTO_UPDATED', { fichaId: ficha.id, acompanhamentoId: itemId });
  });
  return ok(res, await loadFicha(req.user, ficha.id), 'Acompanhamento atualizado.');
});

export const removeAcompanhamento = withFicha(async (req, res, ficha) => {
  if (!canRemove(req, res)) return null;
  const itemId = subId(req, res);
  if (!itemId) return null;
  const { count } = await prisma.fichaAcompanhamento.deleteMany({ where: { id: itemId, fichaId: ficha.id } });
  if (!count) return notFound(res, 'Acompanhamento não encontrado.');
  await audit(prisma, req, 'FICHA_ACOMPANHAMENTO_DELETED', { fichaId: ficha.id, acompanhamentoId: itemId });
  return ok(res, await loadFicha(req.user, ficha.id), 'Acompanhamento removido.');
});

// Chamado na recusa de crédito para migrar o cliente à ficha de recuperação.
export const ensureFichaFromRejection = async (tx, { proposal, oportunidadeId }) => {
  const existing = await tx.fichaRecuperacao.findUnique({ where: { oportunidadeId } });
  if (existing) return existing;
  const [cliente, vehicle, responsible] = await Promise.all([
    tx.cliente.findUnique({ where: { id: proposal.clienteId } }),
    tx.veiculo.findUnique({ where: { id: proposal.veiculoId } }),
    proposal.vendedor?.usuarioId ? tx.usuario.findUnique({ where: { id: proposal.vendedor.usuarioId }, select: { id: true, perfil: true, gerenteId: true } }) : null,
  ]);
  const isManager = ['MANAGER', 'GERENTE'].includes(String(responsible?.perfil || '').toUpperCase());
  return tx.fichaRecuperacao.create({
    data: {
      lojaId: proposal.lojaId,
      clienteId: proposal.clienteId,
      oportunidadeId,
      propostaId: proposal.id,
      vendedorId: responsible?.id ?? null,
      gerenteId: isManager ? responsible.id : responsible?.gerenteId ?? null,
      telefoneCelular: cliente?.telefone || null,
      renda: cliente?.rendaMensal ?? null,
      valorVeiculo: proposal.valorProposta,
      valorEntrada: proposal.entrada ?? null,
      valorFinanciado: proposal.totalFinanciado ?? null,
      ...(vehicle ? { opcoes: { create: [{ ordem: 1, marca: vehicle.marca, modelo: vehicle.modelo, anoModelo: vehicle.anoModelo ?? vehicle.ano, anoFabricacao: vehicle.anoFabricacao ?? null }] } } : {}),
    },
  });
};
