import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "./api/baseUrl";
import MoneyInput from "./MoneyInput";

type Person = { id: number; nome: string };
type Responsavel = Person & { perfil: string; gerenteId: number | null };
type Row = {
  id: number; status: string; dataEntradaFicha: string; scoreInicio: number | null; scoreTermino: number | null;
  cliente: { id: number; nome: string; documento?: string | null; telefone?: string | null };
  gerente: Person | null; vendedor: Person | null;
  _count: { contatos: number; analises: number; acompanhamentos: number };
};
type Contato = { id: number; ordem: number; data: string; dataLigacaoPosVenda: string | null; inicio: string | null; termino: string | null; protocolo: string | null; spc: string | null; dividaValor: string | null; dividaObservacao: string | null; consultorNome: string; setor: string | null; tratativa: string | null; registradoPor: Person | null };
type Analise = { id: number; instituicao: string; submetidaEm: string; submetidoPor: Person | null; resposta: string; respostaDetalhe: string | null; respondidaEm: string | null; veiculoMarca: string | null; veiculoModelo: string | null; anoModelo: number | null; anoFabricacao: number | null; valorVeiculo: string | null; valorEntrada: string | null; valorFinanciado: string | null; quantidadeParcelas: number | null; valorParcela: string | null; observacoes: string | null };
type Acompanhamento = { id: number; ordem: number; realizadoEm: string; realizadoPor: Person | null; observacoes: string | null; itens: { id: number; requisito: string; cumprido: boolean }[] };
type Ficha = Record<string, any> & {
  id: number; status: string; dataEntradaFicha: string; scoreInicio: number | null; scoreInicioEm: string | null; scoreTermino: number | null; scoreTerminoEm: string | null;
  cliente: Record<string, string | number | null> & { id: number; nome: string; documento: string | null };
  gerente: Person | null; vendedor: Person | null;
  referencias: { nome: string; telefone: string; tipo: string }[];
  opcoes: { ordem: number; marca: string; modelo: string; anoModelo: number | null; anoFabricacao: number | null; parcelas: { quantidade: number; parcelaMinima: string; parcelaMaxima: string }[] }[];
  contatos: Contato[]; analises: Analise[]; acompanhamentos: Acompanhamento[];
};
type Parcela = { quantidade: string; parcelaMinima: string; parcelaMaxima: string };
type Opcao = { marca: string; modelo: string; anoModelo: string; anoFabricacao: string; parcelas: Parcela[] };
type Draft = { [key: string]: any; cliente: Record<string, string>; referencias: { nome: string; telefone: string; tipo: string }[]; opcoes: Opcao[] };

const STATUS_LABELS: Record<string, string> = { ABERTA: "Aberta", EM_ANDAMENTO: "Em andamento", CONCLUIDA: "Concluída", CANCELADA: "Cancelada" };
const STATUS_TONE: Record<string, string> = { ABERTA: "yellow", EM_ANDAMENTO: "blue", CONCLUIDA: "green", CANCELADA: "red" };
const RESPOSTA_LABELS: Record<string, string> = { EM_ANALISE: "Em análise", APROVADA: "Aprovada", RECUSADA: "Recusada", CONDICIONADA: "Aprovada com condições" };
const SETORES = ["PÓS VENDA", "PÓS ANÁLISE", "PLANO DE AÇÃO", "SAC/ OUVIDORIA"];
const ESTADOS_CIVIS = ["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Viúvo(a)", "Separado(a)"];
const STEPS = ["1. Ficha cadastral", "2. Controle administrativo", "3. Análise bancária", "4. Acompanhamento financeiro", "5. Dossiê"];

const digits = (value: unknown) => String(value ?? "").replace(/\D/g, "");
const maskPhone = (value: string) => {
  const d = digits(value).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
const maskDoc = (value: string) => {
  const d = digits(value).slice(0, 14);
  if (d.length <= 11) return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};
const maskCep = (value: string) => digits(value).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
const fmtMoney = (value: unknown) => value === null || value === undefined || value === "" ? "—" : Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (value: string | null) => value ? new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—";
const fmtDateTime = (value: string | null) => value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";
const dateInput = (value: unknown) => value ? String(value).slice(0, 10) : "";
const toLocalInput = (value?: string | null) => {
  const date = value ? new Date(value) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const numOrNull = (value: string) => value === "" ? null : Number(value);
const decimalOf = (value: unknown) => value === null || value === undefined || value === "" ? "" : String(Number(value));
const suggestProtocol = (date: string, inicio: string) => date && inicio ? `${date.slice(8, 10)}${date.slice(5, 7)}${inicio.replace(":", "")}` : "";

const makeApi = (token: string) => async <T,>(path: string, method = "GET", body?: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}/credit-recovery${path}`, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: body === undefined ? undefined : JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Não foi possível concluir a operação.");
  return payload.data as T;
};

const emptyOpcao = (): Opcao => ({ marca: "", modelo: "", anoModelo: "", anoFabricacao: "", parcelas: [{ quantidade: "", parcelaMinima: "", parcelaMaxima: "" }] });

const evolution = (start: number | null | undefined, end: number | null | undefined) => {
  if (start == null || end == null) return null;
  const diff = end - start;
  return { diff, label: `${diff > 0 ? "+" : ""}${diff} pts`, tone: diff > 0 ? "green" : diff < 0 ? "red" : "yellow" };
};
const toDraft = (ficha: Ficha): Draft => {
  const text = (key: string) => String(ficha[key] ?? "");
  const dates = ["dataEmissaoRg", "dataNascimento", "cnhValidade", "dataAdmissao"];
  const base: Record<string, string> = {};
  for (const key of ["rg", "orgaoEmissor", "ufEmissor", "naturalidade", "naturalidadeUf", "cnhNumero", "cnhCategoria", "sexo", "estadoCivil", "residenciaTipo", "tempoResidencia", "empresaNome", "cargoFuncao", "classificacaoTrabalho", "status"]) base[key] = text(key);
  for (const key of dates) base[key] = dateInput(ficha[key]);
  for (const key of ["telefoneFixo", "telefoneCelular", "whatsapp"]) base[key] = maskPhone(text(key));
  base.empresaCnpj = maskDoc(text("empresaCnpj"));
  for (const key of ["renda", "valorVeiculo", "valorEntrada", "valorFinanciado", "valorTarifaTramite"]) base[key] = decimalOf(ficha[key]);
  base.vendedorId = ficha.vendedor ? String(ficha.vendedor.id) : "";
  base.gerenteId = ficha.gerente ? String(ficha.gerente.id) : "";
  const c = ficha.cliente;
  const opcoes: Opcao[] = [0, 1].map((index) => {
    const option = ficha.opcoes.find((item) => item.ordem === index + 1);
    if (!option) return emptyOpcao();
    return {
      marca: option.marca, modelo: option.modelo, anoModelo: String(option.anoModelo ?? ""), anoFabricacao: String(option.anoFabricacao ?? ""),
      parcelas: option.parcelas.length ? option.parcelas.map((p) => ({ quantidade: String(p.quantidade), parcelaMinima: decimalOf(p.parcelaMinima), parcelaMaxima: decimalOf(p.parcelaMaxima) })) : [{ quantidade: "", parcelaMinima: "", parcelaMaxima: "" }],
    };
  });
  return {
    ...base,
    cliente: { nome: String(c.nome ?? ""), email: String(c.email ?? ""), telefone: maskPhone(String(c.telefone ?? "")), cep: maskCep(String(c.cep ?? "")), logradouro: String(c.logradouro ?? ""), numero: String(c.numero ?? ""), complemento: String(c.complemento ?? ""), bairro: String(c.bairro ?? ""), cidade: String(c.cidade ?? ""), estado: String(c.estado ?? "") },
    referencias: ficha.referencias.map((r) => ({ nome: r.nome, telefone: maskPhone(r.telefone), tipo: r.tipo })),
    opcoes,
  } as Draft;
};

const moneyKeys = ["renda", "valorVeiculo", "valorEntrada", "valorFinanciado", "valorTarifaTramite"];
const toPayload = (draft: Draft, canAssign: boolean) => {
  const payload: Record<string, unknown> = { cliente: { ...draft.cliente, telefone: digits(draft.cliente.telefone), cep: digits(draft.cliente.cep) }, referencias: draft.referencias.map((r) => ({ ...r, telefone: digits(r.telefone) })) };
  for (const [key, value] of Object.entries(draft)) {
    if (["cliente", "referencias", "opcoes", "vendedorId", "gerenteId"].includes(key)) continue;
    if (moneyKeys.includes(key)) payload[key] = value === "" ? null : Number(value);
    else if (["telefoneFixo", "telefoneCelular", "whatsapp", "empresaCnpj"].includes(key)) payload[key] = digits(value);
    else payload[key] = value;
  }
  payload.opcoes = draft.opcoes.map((o) => ({ marca: o.marca, modelo: o.modelo, anoModelo: numOrNull(o.anoModelo), anoFabricacao: numOrNull(o.anoFabricacao), parcelas: o.parcelas.map((p) => ({ quantidade: numOrNull(p.quantidade), parcelaMinima: p.parcelaMinima === "" ? null : Number(p.parcelaMinima), parcelaMaxima: p.parcelaMaxima === "" ? null : Number(p.parcelaMaxima) })) }));
  if (canAssign) {
    payload.vendedorId = draft.vendedorId ? Number(draft.vendedorId) : null;
    payload.gerenteId = draft.gerenteId ? Number(draft.gerenteId) : null;
  }
  return payload;
};

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={wide ? "ficha-wide" : undefined}>{label}{children}</label>;
}

type Common = { authToken: string; profile: string; userName: string };

function FichaDetail({ id, authToken, profile, userName, onBack }: Common & { id: number; onBack: () => void }) {
  const api = useMemo(() => makeApi(authToken), [authToken]);
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [cepStatus, setCepStatus] = useState("");
  const [people, setPeople] = useState<Responsavel[]>([]);
  const [requisitos, setRequisitos] = useState<string[]>([]);
  const canAssign = profile !== "SELLER";
  const canRemove = profile !== "SELLER";

  const apply = (data: Ficha, resetDraft = false) => { setFicha(data); if (resetDraft) setDraft(toDraft(data)); };
  const run = async (action: () => Promise<void>, success: string) => {
    setSaving(true); setError(""); setNotice("");
    try { await action(); setNotice(success); } catch (e) { setError(e instanceof Error ? e.message : "Falha na operação."); } finally { setSaving(false); }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [data, reqs, resp] = await Promise.all([api<Ficha>(`/fichas/${id}`), api<string[]>("/fichas/requisitos"), api<Responsavel[]>("/fichas/responsaveis").catch(() => [])]);
        if (!active) return;
        apply(data, true); setRequisitos(reqs); setPeople(resp);
      } catch (e) { if (active) setError(e instanceof Error ? e.message : "Falha ao carregar a ficha."); }
    })();
    return () => { active = false; };
  }, [api, id]);

  if (!ficha || !draft) return <div>{error ? <div className="auth-notice">{error}</div> : <div className="support-note">Carregando ficha...</div>}<button className="secondary-button" onClick={onBack}>Voltar</button></div>;

  const set = (key: string, value: string) => setDraft((current) => current && ({ ...current, [key]: value }));
  const setCliente = (key: string, value: string) => setDraft((current) => current && ({ ...current, cliente: { ...current.cliente, [key]: value } }));
  const setMoney = (key: string, value: string) => setDraft((current) => {
    if (!current) return current;
    const next = { ...current, [key]: value } as Draft;
    if (key === "valorVeiculo" || key === "valorEntrada") {
      const total = Number(next.valorVeiculo || 0) - Number(next.valorEntrada || 0);
      next.valorFinanciado = next.valorVeiculo ? String(Math.max(0, Math.round(total * 100) / 100)) : "";
    }
    return next;
  });
  const updateOpcao = (index: number, patch: Partial<Opcao>) => setDraft((current) => current && ({ ...current, opcoes: current.opcoes.map((o, i) => i === index ? { ...o, ...patch } : o) }));
  const updateParcela = (oi: number, pi: number, patch: Partial<Parcela>) => setDraft((current) => current && ({ ...current, opcoes: current.opcoes.map((o, i) => i === oi ? { ...o, parcelas: o.parcelas.map((p, j) => j === pi ? { ...p, ...patch } : p) } : o) }));
  const lookupCep = async () => {
    const cep = digits(draft.cliente.cep);
    if (cep.length !== 8) { setCepStatus("Informe um CEP com 8 dígitos."); return; }
    setCepStatus("Consultando ViaCEP...");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const result = await response.json();
      if (!response.ok || result.erro) throw new Error();
      setDraft((current) => current && ({ ...current, cliente: { ...current.cliente, logradouro: result.logradouro || "", bairro: result.bairro || "", cidade: result.localidade || "", estado: result.uf || "" } }));
      setCepStatus("Endereço preenchido pela ViaCEP.");
    } catch { setCepStatus("CEP não encontrado. Preencha o endereço manualmente."); }
  };
  const saveFicha = () => run(async () => { apply(await api<Ficha>(`/fichas/${id}`, "PUT", toPayload(draft, canAssign)), true); }, "Ficha cadastral salva.");

  const sellers = people.filter((p) => p.perfil === "SELLER" || p.perfil === "MANAGER");
  const managers = people.filter((p) => p.perfil === "MANAGER");

  const stepOne = <>
    <div className="form-section-title">Identificação</div>
    <div className="modal-row">
      <Field label="Gerente">{canAssign && profile !== "MANAGER" ? <select value={draft.gerenteId} onChange={(e) => set("gerenteId", e.target.value)}><option value="">Sem gerente</option>{managers.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select> : <input value={ficha.gerente?.nome || "Sem gerente"} disabled/>}</Field>
      <Field label="Vendedor">{canAssign ? <select value={draft.vendedorId} onChange={(e) => set("vendedorId", e.target.value)}><option value="">Sem vendedor</option>{sellers.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select> : <input value={ficha.vendedor?.nome || "—"} disabled/>}</Field>
    </div>
    <div className="form-section-title">Dados do cliente</div>
    <div className="ficha-grid">
      <Field label="CPF/CNPJ"><input value={maskDoc(String(ficha.cliente.documento || ""))} disabled/></Field>
      <Field label="Nome completo" wide><input value={draft.cliente.nome} onChange={(e) => setCliente("nome", e.target.value)}/></Field>
      <Field label="RG"><input value={draft.rg} onChange={(e) => set("rg", e.target.value)}/></Field>
      <Field label="Órgão emissor"><input value={draft.orgaoEmissor} onChange={(e) => set("orgaoEmissor", e.target.value)} placeholder="SSP"/></Field>
      <Field label="UF do órgão"><input maxLength={2} value={draft.ufEmissor} onChange={(e) => set("ufEmissor", e.target.value.toUpperCase())}/></Field>
      <Field label="Data de emissão do RG"><input type="date" value={draft.dataEmissaoRg} onChange={(e) => set("dataEmissaoRg", e.target.value)}/></Field>
      <Field label="Naturalidade (cidade)"><input value={draft.naturalidade} onChange={(e) => set("naturalidade", e.target.value)}/></Field>
      <Field label="UF"><input maxLength={2} value={draft.naturalidadeUf} onChange={(e) => set("naturalidadeUf", e.target.value.toUpperCase())}/></Field>
      <Field label="Data de nascimento"><input type="date" value={draft.dataNascimento} onChange={(e) => set("dataNascimento", e.target.value)}/></Field>
      <Field label="Número da CNH"><input value={draft.cnhNumero} onChange={(e) => set("cnhNumero", e.target.value)}/></Field>
      <Field label="Validade da CNH"><input type="date" value={draft.cnhValidade} onChange={(e) => set("cnhValidade", e.target.value)}/></Field>
      <Field label="Categoria da CNH"><select value={draft.cnhCategoria} onChange={(e) => set("cnhCategoria", e.target.value)}><option value="">—</option>{["A", "B", "AB", "C", "D", "E", "AC", "AD", "AE", "ACC"].map((c) => <option key={c}>{c}</option>)}</select></Field>
      <Field label="Sexo"><select value={draft.sexo} onChange={(e) => set("sexo", e.target.value)}><option value="">—</option><option value="MASCULINO">Masculino</option><option value="FEMININO">Feminino</option></select></Field>
      <Field label="Estado civil"><select value={draft.estadoCivil} onChange={(e) => set("estadoCivil", e.target.value)}><option value="">—</option>{ESTADOS_CIVIS.map((c) => <option key={c}>{c}</option>)}</select></Field>
    </div>
    <div className="form-section-title">Endereço residencial</div>
    <div className="cep-row"><label>CEP<input value={draft.cliente.cep} onChange={(e) => setCliente("cep", maskCep(e.target.value))} onBlur={() => void lookupCep()} placeholder="00000-000"/></label><button type="button" onClick={() => void lookupCep()}>Buscar ViaCEP</button><span>{cepStatus}</span></div>
    <div className="modal-row address-main"><Field label="Logradouro"><input value={draft.cliente.logradouro} onChange={(e) => setCliente("logradouro", e.target.value)}/></Field><Field label="Número"><input value={draft.cliente.numero} onChange={(e) => setCliente("numero", e.target.value)}/></Field></div>
    <div className="ficha-grid">
      <Field label="Complemento"><input value={draft.cliente.complemento} onChange={(e) => setCliente("complemento", e.target.value)}/></Field>
      <Field label="Bairro"><input value={draft.cliente.bairro} onChange={(e) => setCliente("bairro", e.target.value)}/></Field>
      <Field label="Cidade"><input value={draft.cliente.cidade} onChange={(e) => setCliente("cidade", e.target.value)}/></Field>
      <Field label="UF"><input maxLength={2} value={draft.cliente.estado} onChange={(e) => setCliente("estado", e.target.value.toUpperCase())}/></Field>
      <Field label="Residência"><select value={draft.residenciaTipo} onChange={(e) => set("residenciaTipo", e.target.value)}><option value="">—</option><option value="PROPRIA">Própria</option><option value="ALUGADA">Alugada</option><option value="CEDIDA">Cedida</option></select></Field>
      <Field label="Tempo de residência"><input value={draft.tempoResidencia} onChange={(e) => set("tempoResidencia", e.target.value)} placeholder="Ex.: 3 anos"/></Field>
    </div>
    <div className="form-section-title">Dados de contato</div>
    <div className="ficha-grid">
      <Field label="E-mail"><input type="email" value={draft.cliente.email} onChange={(e) => setCliente("email", e.target.value)}/></Field>
      <Field label="Telefone fixo"><input value={draft.telefoneFixo} onChange={(e) => set("telefoneFixo", maskPhone(e.target.value))}/></Field>
      <Field label="Telefone celular"><input value={draft.telefoneCelular} onChange={(e) => set("telefoneCelular", maskPhone(e.target.value))}/></Field>
      <Field label="WhatsApp"><input value={draft.whatsapp} onChange={(e) => set("whatsapp", maskPhone(e.target.value))}/></Field>
    </div>
    <div className="form-section-title">Referências pessoais</div>
    {draft.referencias.map((ref, index) => <div className="ficha-grid ficha-ref" key={index}>
      <Field label="Nome da referência"><input value={ref.nome} onChange={(e) => setDraft({ ...draft, referencias: draft.referencias.map((r, i) => i === index ? { ...r, nome: e.target.value } : r) })}/></Field>
      <Field label="Telefone"><input value={ref.telefone} onChange={(e) => setDraft({ ...draft, referencias: draft.referencias.map((r, i) => i === index ? { ...r, telefone: maskPhone(e.target.value) } : r) })}/></Field>
      <Field label="Tipo"><select value={ref.tipo} onChange={(e) => setDraft({ ...draft, referencias: draft.referencias.map((r, i) => i === index ? { ...r, tipo: e.target.value } : r) })}><option value="">Selecione</option><option value="AMIGO">Amigo(a)</option><option value="PAI">Pai</option><option value="MAE">Mãe</option><option value="FILHO">Filho(a)</option><option value="OUTROS">Outros</option></select></Field>
      <button type="button" className="ficha-remove" onClick={() => setDraft({ ...draft, referencias: draft.referencias.filter((_, i) => i !== index) })}>Remover</button>
    </div>)}
    {draft.referencias.length < 10 && <button type="button" className="secondary-button" onClick={() => setDraft({ ...draft, referencias: [...draft.referencias, { nome: "", telefone: "", tipo: "" }] })}>+ Adicionar referência</button>}
    <div className="form-section-title">Dados da empresa onde trabalha</div>
    <div className="ficha-grid">
      <Field label="CNPJ"><input value={draft.empresaCnpj} onChange={(e) => set("empresaCnpj", maskDoc(e.target.value))} placeholder="00.000.000/0000-00"/></Field>
      <Field label="Nome da empresa" wide><input value={draft.empresaNome} onChange={(e) => set("empresaNome", e.target.value)}/></Field>
      <Field label="Data da admissão"><input type="date" value={draft.dataAdmissao} onChange={(e) => set("dataAdmissao", e.target.value)}/></Field>
      <Field label="Renda"><MoneyInput value={draft.renda} onValueChange={(v) => set("renda", v)}/></Field>
      <Field label="Cargo/função"><input value={draft.cargoFuncao} onChange={(e) => set("cargoFuncao", e.target.value)}/></Field>
      <Field label="Classificação de trabalho"><select value={draft.classificacaoTrabalho} onChange={(e) => set("classificacaoTrabalho", e.target.value)}><option value="">—</option><option value="CARTEIRA_ASSINADA">Carteira assinada</option><option value="AUTONOMO">Autônomo</option></select></Field>
    </div>
    <div className="form-section-title">Simulação das parcelas</div>
    <div className="ficha-grid">
      <Field label="Valor do veículo"><MoneyInput value={draft.valorVeiculo} onValueChange={(v) => setMoney("valorVeiculo", v)}/></Field>
      <Field label="Valor de entrada"><MoneyInput value={draft.valorEntrada} onValueChange={(v) => setMoney("valorEntrada", v)}/></Field>
      <Field label="Valor financiado"><MoneyInput value={draft.valorFinanciado} onValueChange={(v) => set("valorFinanciado", v)}/></Field>
      <Field label="Tarifa de trâmite"><MoneyInput value={draft.valorTarifaTramite} onValueChange={(v) => set("valorTarifaTramite", v)}/></Field>
    </div>
    {draft.opcoes.map((option, oi) => <div className="ficha-card" key={oi}>
      <strong>{oi === 0 ? "Veículo para financiamento" : "Segunda opção de veículo (opcional)"}</strong>
      <div className="ficha-grid">
        <Field label="Marca"><input value={option.marca} onChange={(e) => updateOpcao(oi, { marca: e.target.value })}/></Field>
        <Field label="Modelo"><input value={option.modelo} onChange={(e) => updateOpcao(oi, { modelo: e.target.value })}/></Field>
        <Field label="Ano modelo"><input inputMode="numeric" maxLength={4} value={option.anoModelo} onChange={(e) => updateOpcao(oi, { anoModelo: digits(e.target.value) })}/></Field>
        <Field label="Ano fabricação"><input inputMode="numeric" maxLength={4} value={option.anoFabricacao} onChange={(e) => updateOpcao(oi, { anoFabricacao: digits(e.target.value) })}/></Field>
      </div>
      {option.parcelas.map((parcel, pi) => <div className="ficha-grid ficha-ref" key={pi}>
        <Field label="Qtd. de parcelas"><input inputMode="numeric" value={parcel.quantidade} onChange={(e) => updateParcela(oi, pi, { quantidade: digits(e.target.value) })} placeholder="12, 24, 36..."/></Field>
        <Field label="Parcela mínima"><MoneyInput value={parcel.parcelaMinima} onValueChange={(v) => updateParcela(oi, pi, { parcelaMinima: v })}/></Field>
        <Field label="Parcela máxima"><MoneyInput value={parcel.parcelaMaxima} onValueChange={(v) => updateParcela(oi, pi, { parcelaMaxima: v })}/></Field>
        <button type="button" className="ficha-remove" disabled={option.parcelas.length === 1} onClick={() => updateOpcao(oi, { parcelas: option.parcelas.filter((_, i) => i !== pi) })}>Remover</button>
      </div>)}
      <button type="button" className="secondary-button" onClick={() => updateOpcao(oi, { parcelas: [...option.parcelas, { quantidade: "", parcelaMinima: "", parcelaMaxima: "" }] })}>+ Adicionar quantidade de parcelas</button>
    </div>)}
    <div className="modal-actions"><button className="primary-button" disabled={saving} onClick={() => void saveFicha()}>{saving ? "Salvando..." : "Salvar ficha cadastral"}</button></div>
  </>;

  return <div>
    <section className="module-heading"><div><p>FICHA DE RECUPERAÇÃO DE CRÉDITO</p><h1>{ficha.cliente.nome}</h1><span>CPF/CNPJ {maskDoc(String(ficha.cliente.documento || ""))} · Entrada da ficha {fmtDate(ficha.dataEntradaFicha)} · Vendedor {ficha.vendedor?.nome || "—"} · Gerente {ficha.gerente?.nome || "—"}</span></div><div className="ficha-head-actions"><select value={draft.status} disabled={saving} onChange={(e) => { set("status", e.target.value); void run(async () => { apply(await api<Ficha>(`/fichas/${id}`, "PUT", { status: e.target.value })); }, "Status atualizado."); }}>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{canRemove && <button className="secondary-button" disabled={saving} onClick={() => { if (window.confirm("Excluir esta ficha de recuperação? Os contatos, análises e acompanhamentos deixarão de aparecer.")) void run(async () => { await api(`/fichas/${id}`, "DELETE"); onBack(); }, "Ficha removida."); }}>Excluir ficha</button>}<button className="secondary-button" disabled={saving} onClick={() => void run(async () => { const response = await fetch(`${API_BASE_URL}/credit-recovery/fichas/${id}/pdf`, { headers: { Authorization: "Bearer " + authToken } }); if (!response.ok) throw new Error("Não foi possível gerar o PDF."); const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = `ficha-recuperacao-${id}.pdf`; link.click(); URL.revokeObjectURL(url); }, "PDF gerado.")}>Baixar PDF</button><button className="secondary-button" onClick={onBack}>Voltar para fichas</button></div></section>
    {error && <div className="auth-notice">{error}</div>}{notice && <div className="auth-notice success">{notice}</div>}
    <div className="ficha-tabs">{STEPS.map((label, index) => <button key={label} className={index === step ? "active" : ""} onClick={() => setStep(index)}>{label}</button>)}</div>
    <section className="panel form-panel ficha-panel">
      {step === 0 && stepOne}
      {step === 1 && <ContatosStep ficha={ficha} userName={userName} canRemove={canRemove} saving={saving} run={run} api={api} id={id} apply={apply}/>}
      {step === 2 && <AnalisesStep ficha={ficha} draft={draft} canRemove={canRemove} saving={saving} run={run} api={api} id={id} apply={apply}/>}
      {step === 3 && <AcompanhamentoStep ficha={ficha} requisitos={requisitos} canRemove={canRemove} saving={saving} run={run} api={api} id={id} apply={apply}/>}
      {step === 4 && <DossieStep id={id} authToken={authToken} api={api} saving={saving} run={run}/>}
    </section>
  </div>;
}

type HistoricoItem = { id: number; em: string; por: string; acao: string; detalhe: string };

function DossieStep({ id, authToken, api, saving, run }: { id: number; authToken: string; api: ReturnType<typeof makeApi>; saving: boolean; run: (action: () => Promise<void>, success: string) => Promise<void> }) {
  const [items, setItems] = useState<HistoricoItem[] | null>(null);
  useEffect(() => { void api<HistoricoItem[]>(`/fichas/${id}/historico`).then(setItems).catch(() => setItems([])); }, [api, id]);
  const download = () => run(async () => {
    const response = await fetch(`${API_BASE_URL}/credit-recovery/fichas/${id}/dossie`, { headers: { Authorization: "Bearer " + authToken } });
    if (!response.ok) throw new Error("Não foi possível gerar o dossiê.");
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url; link.download = `dossie-recuperacao-${id}.pdf`; link.click();
    URL.revokeObjectURL(url);
  }, "Dossiê gerado.");
  return <div className="ficha-step">
    <div className="ficha-card">
      <div className="ficha-card-head"><strong>Dossiê do cliente</strong><span><button className="primary-button" disabled={saving} onClick={() => void download()}>Gerar dossiê (PDF)</button></span></div>
      <p>PDF com a ficha cadastral, o controle administrativo, as análises bancárias, o acompanhamento financeiro, as mudanças de score e o histórico de tudo o que foi registrado, com quem fez e quando.</p>
    </div>
    <div className="ficha-card">
      <div className="ficha-card-head"><strong>Histórico de registros</strong></div>
      {items === null && <p>Carregando…</p>}
      {items?.length === 0 && <p>Nenhum registro de histórico.</p>}
      {items?.map((item) => <p key={item.id}><strong>{fmtDateTime(item.em)}</strong> · {item.por} — {item.acao}{item.detalhe && <span style={{ display: "block", whiteSpace: "pre-line", color: "#486581" }}>{item.detalhe}</span>}</p>)}
    </div>
  </div>;
}

type StepProps = { ficha: Ficha; saving: boolean; canRemove: boolean; id: number; api: ReturnType<typeof makeApi>; run: (action: () => Promise<void>, success: string) => Promise<void>; apply: (data: Ficha, resetDraft?: boolean) => void };

const emptyContato = (userName: string) => ({ id: 0, data: new Date().toISOString().slice(0, 10), dataLigacaoPosVenda: "", inicio: "", termino: "", protocolo: "", spc: "", dividaValor: "", dividaObservacao: "", consultorNome: userName, setor: "", tratativa: "" });

function ContatosStep({ ficha, userName, canRemove, saving, run, api, id, apply }: StepProps & { userName: string }) {
  const [form, setForm] = useState(() => emptyContato(userName));
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = () => run(async () => {
    const body = { ...form, dividaValor: form.dividaValor === "" ? null : Number(form.dividaValor) };
    const { id: contactId, ...payload } = body;
    apply(contactId ? await api<Ficha>(`/fichas/${id}/contatos/${contactId}`, "PUT", payload) : await api<Ficha>(`/fichas/${id}/contatos`, "POST", payload));
    setForm(emptyContato(userName));
  }, form.id ? "Contato atualizado." : "Contato registrado.");
  const edit = (c: Contato) => setForm({ id: c.id, data: dateInput(c.data), dataLigacaoPosVenda: dateInput(c.dataLigacaoPosVenda), inicio: c.inicio || "", termino: c.termino || "", protocolo: c.protocolo || "", spc: c.spc || "", dividaValor: decimalOf(c.dividaValor), dividaObservacao: c.dividaObservacao || "", consultorNome: c.consultorNome, setor: c.setor || "", tratativa: c.tratativa || "" });
  const remove = (c: Contato) => { if (window.confirm(`Excluir o ${c.ordem}º contato?`)) void run(async () => { apply(await api<Ficha>(`/fichas/${id}/contatos/${c.id}`, "DELETE")); }, "Contato removido."); };
  return <>
    <div className="form-section-title">Registro de contatos com o cliente</div>
    {ficha.contatos.length === 0 && <div className="support-note">Nenhum contato registrado ainda.</div>}
    {ficha.contatos.map((c) => <div className="ficha-card" key={c.id}>
      <div className="ficha-card-head"><strong>{c.ordem}º CONTATO</strong><span><button className="link-button" onClick={() => edit(c)}>Editar</button>{canRemove && <button className="link-button danger" onClick={() => remove(c)}>Excluir</button>}</span></div>
      <dl className="ficha-dl">
        <div><dt>Data</dt><dd>{fmtDate(c.data)}</dd></div>
        {c.dataLigacaoPosVenda && <div><dt>Ligação do pós-venda</dt><dd>{fmtDate(c.dataLigacaoPosVenda)}</dd></div>}
        {c.inicio && <div><dt>Início</dt><dd>{c.inicio}</dd></div>}
        {c.termino && <div><dt>Término</dt><dd>{c.termino}</dd></div>}
        {c.protocolo && <div><dt>Protocolo</dt><dd>{c.protocolo}</dd></div>}
        {c.spc && <div><dt>SPC</dt><dd>{c.spc}</dd></div>}
        {c.dividaValor !== null && <div><dt>Dívida</dt><dd>{fmtMoney(c.dividaValor)} {c.dividaObservacao || ""}</dd></div>}
        <div><dt>Consultor(a)</dt><dd>{c.consultorNome}</dd></div>
        {c.setor && <div><dt>Setor</dt><dd>{c.setor}</dd></div>}
        {c.tratativa && <div className="ficha-wide"><dt>Tratativa</dt><dd>{c.tratativa}</dd></div>}
      </dl>
      <small>Registrado por {c.registradoPor?.nome || "—"}</small>
    </div>)}
    <div className="form-section-title">{form.id ? "Editar contato" : `Novo contato (${ficha.contatos.length + 1}º)`}</div>
    <div className="ficha-grid">
      <Field label="Data"><input type="date" value={form.data} onChange={(e) => set("data", e.target.value)}/></Field>
      <Field label="Data da ligação do pós-venda"><input type="date" value={form.dataLigacaoPosVenda} onChange={(e) => set("dataLigacaoPosVenda", e.target.value)}/></Field>
      <Field label="Início"><input type="time" value={form.inicio} onChange={(e) => set("inicio", e.target.value)}/></Field>
      <Field label="Término"><input type="time" value={form.termino} onChange={(e) => set("termino", e.target.value)}/></Field>
      <Field label="Protocolo"><input value={form.protocolo} onChange={(e) => set("protocolo", e.target.value)} placeholder={suggestProtocol(form.data, form.inicio) || "Gerado pela data e hora"}/></Field>
      <Field label="SPC"><input value={form.spc} onChange={(e) => set("spc", e.target.value)} placeholder="OK / Negativado"/></Field>
      <Field label="Dívida"><MoneyInput value={form.dividaValor} onValueChange={(v) => set("dividaValor", v)}/></Field>
      <Field label="Observação da dívida"><input value={form.dividaObservacao} onChange={(e) => set("dividaObservacao", e.target.value)} placeholder="(total)"/></Field>
      <Field label="Consultor(a)"><input value={form.consultorNome} onChange={(e) => set("consultorNome", e.target.value)}/></Field>
      <Field label="Setor"><input list="ficha-setores" value={form.setor} onChange={(e) => set("setor", e.target.value)}/></Field>
    </div>
    <datalist id="ficha-setores">{SETORES.map((s) => <option key={s} value={s}/>)}</datalist>
    <label>Tratativa<textarea value={form.tratativa} maxLength={500} onChange={(e) => set("tratativa", e.target.value)} placeholder="O que foi tratado com o cliente"/></label>
    <div className="modal-actions">{form.id ? <button onClick={() => setForm(emptyContato(userName))}>Cancelar edição</button> : null}<button className="primary-button" disabled={saving} onClick={() => void save()}>{form.id ? "Salvar contato" : "Registrar contato"}</button></div>
  </>;
}

const emptyAnalise = { id: 0, instituicao: "", submetidaEm: "", resposta: "EM_ANALISE", respostaDetalhe: "", veiculoMarca: "", veiculoModelo: "", anoModelo: "", anoFabricacao: "", valorVeiculo: "", valorEntrada: "", valorFinanciado: "", quantidadeParcelas: "", valorParcela: "", observacoes: "" };

function AnalisesStep({ ficha, draft, canRemove, saving, run, api, id, apply }: StepProps & { draft: Draft }) {
  const [form, setForm] = useState({ ...emptyAnalise, submetidaEm: toLocalInput() });
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const reset = () => setForm({ ...emptyAnalise, submetidaEm: toLocalInput() });
  const prefill = () => {
    const option = draft.opcoes[0];
    const parcel = option.parcelas[0];
    setForm((current) => ({ ...current, veiculoMarca: option.marca, veiculoModelo: option.modelo, anoModelo: option.anoModelo, anoFabricacao: option.anoFabricacao, valorVeiculo: draft.valorVeiculo, valorEntrada: draft.valorEntrada, valorFinanciado: draft.valorFinanciado, quantidadeParcelas: parcel?.quantidade || "", valorParcela: parcel?.parcelaMaxima || "" }));
  };
  const save = () => run(async () => {
    const { id: analiseId, ...f } = form;
    const payload = { ...f, submetidaEm: f.submetidaEm ? new Date(f.submetidaEm).toISOString() : "", anoModelo: numOrNull(f.anoModelo), anoFabricacao: numOrNull(f.anoFabricacao), quantidadeParcelas: numOrNull(f.quantidadeParcelas), valorVeiculo: numOrNull(f.valorVeiculo), valorEntrada: numOrNull(f.valorEntrada), valorFinanciado: numOrNull(f.valorFinanciado), valorParcela: numOrNull(f.valorParcela) };
    apply(analiseId ? await api<Ficha>(`/fichas/${id}/analises/${analiseId}`, "PUT", payload) : await api<Ficha>(`/fichas/${id}/analises`, "POST", payload));
    reset();
  }, form.id ? "Análise atualizada." : "Análise bancária registrada.");
  const edit = (a: Analise) => setForm({ id: a.id, instituicao: a.instituicao, submetidaEm: toLocalInput(a.submetidaEm), resposta: a.resposta, respostaDetalhe: a.respostaDetalhe || "", veiculoMarca: a.veiculoMarca || "", veiculoModelo: a.veiculoModelo || "", anoModelo: String(a.anoModelo ?? ""), anoFabricacao: String(a.anoFabricacao ?? ""), valorVeiculo: decimalOf(a.valorVeiculo), valorEntrada: decimalOf(a.valorEntrada), valorFinanciado: decimalOf(a.valorFinanciado), quantidadeParcelas: String(a.quantidadeParcelas ?? ""), valorParcela: decimalOf(a.valorParcela), observacoes: a.observacoes || "" });
  const remove = (a: Analise) => { if (window.confirm(`Excluir a análise do ${a.instituicao}?`)) void run(async () => { apply(await api<Ficha>(`/fichas/${id}/analises/${a.id}`, "DELETE")); }, "Análise removida."); };
  const tone = (r: string) => r === "APROVADA" ? "green" : r === "RECUSADA" ? "red" : r === "CONDICIONADA" ? "blue" : "yellow";
  return <>
    <div className="form-section-title">Submissões às instituições financeiras</div>
    {ficha.analises.length === 0 && <div className="support-note">Nenhuma ficha submetida a instituições bancárias.</div>}
    {ficha.analises.map((a) => <div className="ficha-card" key={a.id}>
      <div className="ficha-card-head"><strong>{a.instituicao}</strong><span><span className={`status ${tone(a.resposta)}`}>{RESPOSTA_LABELS[a.resposta] || a.resposta}</span><button className="link-button" onClick={() => edit(a)}>Editar / responder</button>{canRemove && <button className="link-button danger" onClick={() => remove(a)}>Excluir</button>}</span></div>
      <dl className="ficha-dl">
        <div><dt>Submetida em</dt><dd>{fmtDateTime(a.submetidaEm)}</dd></div>
        <div><dt>Submetida por</dt><dd>{a.submetidoPor?.nome || "—"}</dd></div>
        {a.respondidaEm && <div><dt>Respondida em</dt><dd>{fmtDateTime(a.respondidaEm)}</dd></div>}
        <div><dt>Veículo</dt><dd>{[a.veiculoMarca, a.veiculoModelo, a.anoModelo && `${a.anoModelo}${a.anoFabricacao ? `/${a.anoFabricacao}` : ""}`].filter(Boolean).join(" ") || "—"}</dd></div>
        <div><dt>Valor do veículo</dt><dd>{fmtMoney(a.valorVeiculo)}</dd></div>
        <div><dt>Entrada</dt><dd>{fmtMoney(a.valorEntrada)}</dd></div>
        <div><dt>Financiado</dt><dd>{fmtMoney(a.valorFinanciado)}</dd></div>
        <div><dt>Parcelas</dt><dd>{a.quantidadeParcelas ? `${a.quantidadeParcelas}x de ${fmtMoney(a.valorParcela)}` : "—"}</dd></div>
        {a.respostaDetalhe && <div className="ficha-wide"><dt>Resposta da instituição</dt><dd>{a.respostaDetalhe}</dd></div>}
        {a.observacoes && <div className="ficha-wide"><dt>Observações</dt><dd>{a.observacoes}</dd></div>}
      </dl>
    </div>)}
    <div className="form-section-title">{form.id ? "Editar análise / registrar resposta" : "Nova submissão"}</div>
    <div className="ficha-grid">
      <Field label="Instituição bancária" wide><input value={form.instituicao} onChange={(e) => set("instituicao", e.target.value)}/></Field>
      <Field label="Data e hora da submissão"><input type="datetime-local" value={form.submetidaEm} onChange={(e) => set("submetidaEm", e.target.value)}/></Field>
      <Field label="Resposta da instituição"><select value={form.resposta} onChange={(e) => set("resposta", e.target.value)}>{Object.entries(RESPOSTA_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
    </div>
    <label>Detalhe da resposta<input value={form.respostaDetalhe} maxLength={500} onChange={(e) => set("respostaDetalhe", e.target.value)} placeholder="Motivo da recusa, condições exigidas..."/></label>
    <div className="ficha-card-head"><strong>Proposta submetida</strong><button type="button" className="link-button" onClick={prefill}>Preencher com os dados da ficha</button></div>
    <div className="ficha-grid">
      <Field label="Marca"><input value={form.veiculoMarca} onChange={(e) => set("veiculoMarca", e.target.value)}/></Field>
      <Field label="Modelo"><input value={form.veiculoModelo} onChange={(e) => set("veiculoModelo", e.target.value)}/></Field>
      <Field label="Ano modelo"><input inputMode="numeric" maxLength={4} value={form.anoModelo} onChange={(e) => set("anoModelo", digits(e.target.value))}/></Field>
      <Field label="Ano fabricação"><input inputMode="numeric" maxLength={4} value={form.anoFabricacao} onChange={(e) => set("anoFabricacao", digits(e.target.value))}/></Field>
      <Field label="Valor do veículo"><MoneyInput value={form.valorVeiculo} onValueChange={(v) => set("valorVeiculo", v)}/></Field>
      <Field label="Valor de entrada"><MoneyInput value={form.valorEntrada} onValueChange={(v) => set("valorEntrada", v)}/></Field>
      <Field label="Valor financiado"><MoneyInput value={form.valorFinanciado} onValueChange={(v) => set("valorFinanciado", v)}/></Field>
      <Field label="Qtd. de parcelas"><input inputMode="numeric" value={form.quantidadeParcelas} onChange={(e) => set("quantidadeParcelas", digits(e.target.value))}/></Field>
      <Field label="Valor da parcela"><MoneyInput value={form.valorParcela} onValueChange={(v) => set("valorParcela", v)}/></Field>
    </div>
    <label>Observações<input value={form.observacoes} maxLength={500} onChange={(e) => set("observacoes", e.target.value)}/></label>
    <div className="modal-actions">{form.id ? <button onClick={reset}>Cancelar edição</button> : null}<button className="primary-button" disabled={saving} onClick={() => void save()}>{form.id ? "Salvar análise" : "Registrar submissão"}</button></div>
  </>;
}

function AcompanhamentoStep({ ficha, requisitos, canRemove, saving, run, api, id, apply }: StepProps & { requisitos: string[] }) {
  const blank = () => ({ id: 0, realizadoEm: toLocalInput(), observacoes: "", itens: requisitos.map((requisito) => ({ requisito, cumprido: false })) });
  const [form, setForm] = useState(blank);
  const [score, setScore] = useState({ inicio: String(ficha.scoreInicio ?? ""), termino: String(ficha.scoreTermino ?? "") });
  useEffect(() => { if (!form.id && form.itens.length === 0 && requisitos.length) setForm(blank()); }, [requisitos]);
  const toggle = (index: number, value: boolean) => setForm((current) => ({ ...current, itens: current.itens.map((item, i) => i === index ? { ...item, cumprido: value } : item) }));
  const save = () => run(async () => {
    const payload = { realizadoEm: new Date(form.realizadoEm).toISOString(), observacoes: form.observacoes, itens: form.itens };
    apply(form.id ? await api<Ficha>(`/fichas/${id}/acompanhamentos/${form.id}`, "PUT", payload) : await api<Ficha>(`/fichas/${id}/acompanhamentos`, "POST", payload));
    setForm(blank());
  }, form.id ? "Acompanhamento atualizado." : "Acompanhamento registrado.");
  const saveScore = () => run(async () => { apply(await api<Ficha>(`/fichas/${id}/score`, "PATCH", { scoreInicio: numOrNull(score.inicio), scoreTermino: numOrNull(score.termino) })); }, "Score salvo.");
  const edit = (a: Acompanhamento) => setForm({ id: a.id, realizadoEm: toLocalInput(a.realizadoEm), observacoes: a.observacoes || "", itens: a.itens.map((i) => ({ requisito: i.requisito, cumprido: i.cumprido })) });
  const remove = (a: Acompanhamento) => { if (window.confirm(`Excluir o ${a.ordem}º acompanhamento?`)) void run(async () => { apply(await api<Ficha>(`/fichas/${id}/acompanhamentos/${a.id}`, "DELETE")); }, "Acompanhamento removido."); };
  return <>
    <div className="form-section-title">Score</div>
    <div className="ficha-grid">
      <Field label="SCORE - início do acompanhamento"><input inputMode="numeric" maxLength={4} value={score.inicio} onChange={(e) => setScore({ ...score, inicio: digits(e.target.value) })}/></Field>
      <Field label="SCORE - término do acompanhamento"><input inputMode="numeric" maxLength={4} value={score.termino} onChange={(e) => setScore({ ...score, termino: digits(e.target.value) })}/></Field>
      <div className="ficha-score-info">{(() => { const ev = evolution(numOrNull(score.inicio), numOrNull(score.termino)); return ev ? <p><strong>Evolução do score: </strong><span className={`status ${ev.tone}`}>{ev.label}</span></p> : <p><small>Informe os dois scores para ver a evolução.</small></p>; })()}<small>Início registrado em {fmtDateTime(ficha.scoreInicioEm)}<br/>Término registrado em {fmtDateTime(ficha.scoreTerminoEm)}</small></div>
      <button type="button" className="secondary-button" disabled={saving} onClick={() => void saveScore()}>Salvar score</button>
    </div>
    <div className="form-section-title">Plano de ação - contatos realizados</div>
    {ficha.acompanhamentos.length === 0 && <div className="support-note">Nenhum contato do plano de ação registrado.</div>}
    {ficha.acompanhamentos.map((a) => <div className="ficha-card" key={a.id}>
      <div className="ficha-card-head"><strong>{a.ordem}º CONTATO · {fmtDateTime(a.realizadoEm)} · {a.realizadoPor?.nome || "—"}</strong><span><button className="link-button" onClick={() => edit(a)}>Editar</button>{canRemove && <button className="link-button danger" onClick={() => remove(a)}>Excluir</button>}</span></div>
      <ul className="ficha-checks">{a.itens.map((item) => <li key={item.id}><span>{item.requisito}</span><span className={`status ${item.cumprido ? "green" : "red"}`}>{item.cumprido ? "OK" : "Não"}</span></li>)}</ul>
      {a.observacoes && <small>{a.observacoes}</small>}
    </div>)}
    <div className="form-section-title">{form.id ? "Editar contato do plano de ação" : `Novo contato do plano de ação (${ficha.acompanhamentos.length + 1}º)`}</div>
    <Field label="Data e hora do contato"><input type="datetime-local" value={form.realizadoEm} onChange={(e) => setForm({ ...form, realizadoEm: e.target.value })}/></Field>
    <ul className="ficha-checks">{form.itens.map((item, index) => <li key={item.requisito}><span>{item.requisito}</span><span className="ficha-toggle"><button type="button" className={item.cumprido ? "on" : ""} onClick={() => toggle(index, true)}>OK</button><button type="button" className={!item.cumprido ? "off" : ""} onClick={() => toggle(index, false)}>Não</button></span></li>)}</ul>
    <label>Observações<input value={form.observacoes} maxLength={500} onChange={(e) => setForm({ ...form, observacoes: e.target.value })}/></label>
    <div className="modal-actions">{form.id ? <button onClick={() => setForm(blank())}>Cancelar edição</button> : null}<button className="primary-button" disabled={saving || form.itens.length === 0} onClick={() => void save()}>{form.id ? "Salvar contato" : "Registrar contato"}</button></div>
  </>;
}

export default function CreditRecoveryFichas({ authToken, profile, userName, onOpenChange }: Common & { onOpenChange?: (open: boolean) => void }) {
  const api = useMemo(() => makeApi(authToken), [authToken]);
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setRows(await api<Row[]>(`/fichas?search=${encodeURIComponent(search.trim())}&status=${status}`)); } catch (e) { setError(e instanceof Error ? e.message : "Falha ao carregar as fichas."); } finally { setLoading(false); }
  }, [api, search, status]);
  useEffect(() => { onOpenChange?.(openId !== null); }, [openId]);
  useEffect(() => { const timer = setTimeout(() => void load(), 300); return () => clearTimeout(timer); }, [load]);

  if (openId !== null) return <FichaDetail id={openId} authToken={authToken} profile={profile} userName={userName} onBack={() => { setOpenId(null); void load(); }}/>;
  return <>
    <section className="panel module-table">
      <div className="ficha-toolbar">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, CPF/CNPJ, vendedor ou gerente"/>
        <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos os status</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <button className="primary-button" onClick={() => setCreating(true)}>+ Nova ficha</button>
      </div>
      {error && <div className="auth-notice">{error}</div>}
      <div className="table-wrap"><table><thead><tr><th>CLIENTE</th><th>GERENTE / VENDEDOR</th><th>ENTRADA</th><th>CONTATOS</th><th>SCORE</th><th>STATUS</th><th></th></tr></thead><tbody>
        {loading ? <tr><td colSpan={7}>Carregando fichas...</td></tr> : rows.length ? rows.map((row) => <tr key={row.id}>
          <td><strong>{row.cliente.nome}</strong><br/><small>{maskDoc(row.cliente.documento || "")} {row.cliente.telefone ? `· ${maskPhone(row.cliente.telefone)}` : ""}</small></td>
          <td>{row.gerente?.nome || "—"}<br/><small>{row.vendedor?.nome || "Sem vendedor"}</small></td>
          <td>{fmtDate(row.dataEntradaFicha)}</td>
          <td>{row._count.contatos} / {row._count.acompanhamentos} plano · {row._count.analises} banco</td>
          <td>{row.scoreInicio ?? "—"} → {row.scoreTermino ?? "—"}{(() => { const ev = evolution(row.scoreInicio, row.scoreTermino); return ev ? <> <span className={`status ${ev.tone}`}>{ev.label}</span></> : null; })()}</td>
          <td><span className={`status ${STATUS_TONE[row.status] || "blue"}`}>{STATUS_LABELS[row.status] || row.status}</span></td>
          <td><button className="submit-bank" onClick={() => setOpenId(row.id)}>Abrir ficha</button></td>
        </tr>) : <tr><td colSpan={7}>Nenhuma ficha encontrada. Clientes com crédito recusado aparecem aqui automaticamente.</td></tr>}
      </tbody></table></div>
    </section>
    {creating && <NewFicha authToken={authToken} profile={profile} onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setOpenId(id); }}/>}
  </>;
}

function NewFicha({ authToken, profile, onClose, onCreated }: { authToken: string; profile: string; onClose: () => void; onCreated: (id: number) => void }) {
  const api = useMemo(() => makeApi(authToken), [authToken]);
  const [mode, setMode] = useState<"existing" | "new">("new");
  const [customers, setCustomers] = useState<{ id: number; nome: string; documento?: string | null }[] | null>(null);
  const [query, setQuery] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [novo, setNovo] = useState({ nome: "", documento: "", telefone: "", email: "" });
  const [vendedorId, setVendedorId] = useState("");
  const [people, setPeople] = useState<Responsavel[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const response = await fetch(`${API_BASE_URL}/clientes`, { headers: { Authorization: `Bearer ${authToken}` } }).catch(() => null);
      if (response?.ok) { setCustomers((await response.json()).data || []); setMode("existing"); }
      if (profile !== "SELLER") setPeople(await api<Responsavel[]>("/fichas/responsaveis").catch(() => []));
    })();
  }, [api, authToken, profile]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const d = digits(query);
    return (customers || []).filter((c) => !term || c.nome.toLowerCase().includes(term) || (d && digits(c.documento).includes(d))).slice(0, 50);
  }, [customers, query]);

  const submit = async () => {
    setSaving(true); setError("");
    try {
      const extra = vendedorId ? { vendedorId: Number(vendedorId) } : {};
      const body = mode === "existing" ? { clienteId: Number(clienteId), ...extra } : { cliente: { ...novo, documento: digits(novo.documento), telefone: digits(novo.telefone) }, ...extra };
      const created = await api<{ id: number }>("/fichas", "POST", body);
      onCreated(created.id);
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível criar a ficha."); } finally { setSaving(false); }
  };

  return <div className="modal-layer"><div className="modal-card wide-modal">
    <div className="modal-title"><div><span>RECUPERAÇÃO DE CRÉDITO</span><h2>Nova ficha</h2></div><button onClick={onClose}>✕</button></div>
    {customers && <div className="ficha-tabs"><button className={mode === "existing" ? "active" : ""} onClick={() => setMode("existing")}>Cliente já cadastrado</button><button className={mode === "new" ? "active" : ""} onClick={() => setMode("new")}>Novo cliente</button></div>}
    {mode === "existing" ? <>
      <label>Buscar cliente<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nome ou CPF/CNPJ"/></label>
      <label>Cliente<select size={6} value={clienteId} onChange={(e) => setClienteId(e.target.value)}>{filtered.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.documento ? ` — ${maskDoc(c.documento)}` : ""}</option>)}</select></label>
    </> : <>
      <div className="modal-row"><label>Nome completo<input value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })}/></label><label>CPF/CNPJ<input value={novo.documento} onChange={(e) => setNovo({ ...novo, documento: maskDoc(e.target.value) })}/></label></div>
      <div className="modal-row"><label>Telefone celular<input value={novo.telefone} onChange={(e) => setNovo({ ...novo, telefone: maskPhone(e.target.value) })}/></label><label>E-mail<input type="email" value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })}/></label></div>
      <small>Os demais dados do cliente são completados na ficha cadastral.</small>
    </>}
    {profile !== "SELLER" && people.length > 0 && <label>Vendedor responsável<select value={vendedorId} onChange={(e) => setVendedorId(e.target.value)}><option value="">Sem vendedor definido</option>{people.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>}
    {error && <div className="auth-notice">{error}</div>}
    <div className="modal-actions"><button onClick={onClose}>Cancelar</button><button className="primary-button" disabled={saving || (mode === "existing" ? !clienteId : !novo.nome || !novo.documento || !novo.telefone)} onClick={() => void submit()}>{saving ? "Criando..." : "Criar ficha"}</button></div>
  </div></div>;
}
