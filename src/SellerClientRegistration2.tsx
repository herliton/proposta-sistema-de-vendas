import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "./api/baseUrl";
import MoneyInput from "./MoneyInput";
import { generateFichaPdf, calcularSimulacoes } from "./components/FichaPdfGenerator";
import { savePdfToServer, sendPdfByEmail } from "./api/pdfStorage";
import { saveFichaToBackend, FichaDados } from "./api/fichasApi";

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const maskCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

type ClientData = {
  id: number;
  nome: string;
  documento?: string;
};

type FormData = {
  telefoneFixo: string;
  telefoneCelular: string;
  whatsapp: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  residenciaTipo: string;
  tempoResidencia: string;
  empresaNome: string;
  cargoFuncao: string;
  classificacaoTrabalho: string;
  renda: string;
  valorVeiculo: string;
  valorEntrada: string;
  valorFinanciado: string;
  taxaMensal: string;
  // Produtos e Serviços
  garantiaEstendida: boolean;
  garantiaEstendidaValor: string;
  seguroVeiculo: boolean;
  seguroVeiculoValor: string;
  protecaoFinanceira: boolean;
  protecaoFinanceiraValor: string;
  rastreamentoGps: boolean;
  rastreamentoGpsValor: string;
  assessoriaJuridica: boolean;
  assessoriaJuridicaValor: string;
};

type FichaSalva = {
  id: number;
  clienteId: number;
  cliente?: ClientData;
  createdAt: string;
} & FormData;

export default function SellerClientRegistration() {
  const token = localStorage.getItem("vfcAuthToken") || "";
  const [currentStep, setCurrentStep] = useState<"formulario" | "preview" | "pdf">("formulario");
  const [clienteId, setClienteId] = useState("");
  const [clientes, setClientes] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [fichaData, setFichaData] = useState<FichaSalva | null>(null);
  const fichaPreviewRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormData>({
    telefoneFixo: "",
    telefoneCelular: "",
    whatsapp: "",
    dataNascimento: "",
    sexo: "",
    estadoCivil: "",
    residenciaTipo: "",
    tempoResidencia: "",
    empresaNome: "",
    cargoFuncao: "",
    classificacaoTrabalho: "",
    renda: "",
    valorVeiculo: "",
    valorEntrada: "",
    valorFinanciado: "",
    taxaMensal: "1.2",
    garantiaEstendida: false,
    garantiaEstendidaValor: "",
    seguroVeiculo: false,
    seguroVeiculoValor: "",
    protecaoFinanceira: false,
    protecaoFinanceiraValor: "",
    rastreamentoGps: false,
    rastreamentoGpsValor: "",
    assessoriaJuridica: false,
    assessoriaJuridicaValor: "",
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/clientes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setClientes(data.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
  }, [token]);

  const resetForm = () => {
    setForm({
      telefoneFixo: "",
      telefoneCelular: "",
      whatsapp: "",
      dataNascimento: "",
      sexo: "",
      estadoCivil: "",
      residenciaTipo: "",
      tempoResidencia: "",
      empresaNome: "",
      cargoFuncao: "",
      classificacaoTrabalho: "",
      renda: "",
      valorVeiculo: "",
      valorEntrada: "",
      valorFinanciado: "",
      taxaMensal: "1.2",
      garantiaEstendida: false,
      garantiaEstendidaValor: "",
      seguroVeiculo: false,
      seguroVeiculoValor: "",
      protecaoFinanceira: false,
      protecaoFinanceiraValor: "",
      rastreamentoGps: false,
      rastreamentoGpsValor: "",
      assessoriaJuridica: false,
      assessoriaJuridicaValor: "",
    });
    setClienteId("");
  };

  const selectedClient = clientes.find((c) => c.id === Number(clienteId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("vfcAuthToken") || "";

      const fichaPayload: FichaDados = {
        clienteId: parseInt(clienteId, 10),
        telefoneFixo: form.telefoneFixo,
        telefoneCelular: form.telefoneCelular,
        whatsapp: form.whatsapp,
        dataNascimento: form.dataNascimento,
        sexo: form.sexo,
        estadoCivil: form.estadoCivil,
        residenciaTipo: form.residenciaTipo,
        tempoResidencia: form.tempoResidencia,
        empresaNome: form.empresaNome,
        cargoFuncao: form.cargoFuncao,
        classificacaoTrabalho: form.classificacaoTrabalho,
        renda: form.renda,
        valorVeiculo: form.valorVeiculo,
        valorEntrada: form.valorEntrada,
        valorFinanciado: form.valorFinanciado,
        taxaMensal: form.taxaMensal,
        garantiaEstendida: form.garantiaEstendida,
        garantiaEstendidaValor: form.garantiaEstendidaValor,
        seguroVeiculo: form.seguroVeiculo,
        seguroVeiculoValor: form.seguroVeiculoValor,
        protecaoFinanceira: form.protecaoFinanceira,
        protecaoFinanceiraValor: form.protecaoFinanceiraValor,
        rastreamentoGps: form.rastreamentoGps,
        rastreamentoGpsValor: form.rastreamentoGpsValor,
        assessoriaJuridica: form.assessoriaJuridica,
        assessoriaJuridicaValor: form.assessoriaJuridicaValor,
      };

      // Salvar no backend via nova API
      const backendResult = await saveFichaToBackend(fichaPayload, token);

      if (!backendResult.success) {
        throw new Error(backendResult.message);
      }

      setFichaData({
        ...form,
        id: backendResult.fichaId || 0,
        clienteId: parseInt(clienteId, 10),
        cliente: selectedClient,
        createdAt: new Date().toISOString(),
      });

      setMessage({ type: "success", text: "Ficha criada com sucesso! Visualizando..." });
      setTimeout(() => setCurrentStep("preview"), 1000);
    } catch (e) {
      setMessage({ type: "error", text: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!fichaData) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("vfcAuthToken") || "";
      const clienteData = clientes.find((c) => c.id === Number(clienteId));
      const clienteEmail = clienteData?.email || "";

      // Gerar PDF
      const pdf = await generateFichaPdf(fichaData, "ficha-preview-content");

      // Baixar localmente também
      pdf.save(`Ficha_${selectedClient?.nome || "Cliente"}_${new Date().toISOString().split("T")[0]}.pdf`);

      // Salvar no servidor
      const saveResult = await savePdfToServer(pdf, selectedClient?.nome || "Cliente", clienteEmail, token);

      if (saveResult.success) {
        setMessage({
          type: "success",
          text: `PDF gerado e salvo com sucesso! ${saveResult.emailSent ? "Email enviado para o cliente." : "Preparado para envio de email."}`,
        });

        // Se tiver email, enviar também
        if (saveResult.pdfId && clienteEmail && !saveResult.emailSent) {
          setTimeout(() => {
            sendPdfByEmail(saveResult.pdfId!, clienteEmail, token).then((emailResult) => {
              if (emailResult.success) {
                setMessage({ type: "success", text: "Email com PDF enviado com sucesso!" });
              }
            });
          }, 1000);
        }
      } else {
        setMessage({
          type: "error",
          text: `PDF gerado localmente, mas erro ao salvar: ${saveResult.message}`,
        });
      }
    } catch (e) {
      setMessage({ type: "error", text: `Erro ao gerar PDF: ${String(e)}` });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep("formulario");
    resetForm();
    setFichaData(null);
  };

  const simulacoes =
    fichaData && fichaData.valorFinanciado && fichaData.taxaMensal
      ? calcularSimulacoes(
          parseFloat(fichaData.valorFinanciado.toString().replace(/[^\d.-]/g, "")),
          parseFloat(fichaData.taxaMensal.toString())
        )
      : [];

  return (
    <div className="content module-content">
      {/* Etapa 1: Formulário */}
      {currentStep === "formulario" && (
        <>
          <section className="module-heading">
            <div>
              <p>CAPTAÇÃO DE CLIENTES</p>
              <h1>Ficha do Cliente</h1>
              <span>Preencha os dados do cliente para disponibilização em Recuperação de Crédito.</span>
            </div>
          </section>

          {message && (
            <div className={`panel form-panel ${message.type === "success" ? "notice-success" : "notice-error"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="panel form-panel">
            <div className="step-title">
              <span>01</span>
              <div>
                <h3>INFORMAÇÕES DO CLIENTE</h3>
                <p>Dados pessoais e de contato</p>
              </div>
            </div>

            <div className="customer-form-grid">
              <label>
                Cliente *
                <select required value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                  <option value="">Selecione um cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.documento || "Sem CPF"})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Data de Nascimento
                <input
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
                  className="form-input"
                />
              </label>
              <label>
                Sexo
                <select value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })}>
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </label>
              <label>
                Estado Civil
                <select
                  value={form.estadoCivil}
                  onChange={(e) => setForm({ ...form, estadoCivil: e.target.value })}
                >
                  <option value="">Selecione</option>
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="União estável">União estável</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                </select>
              </label>
            </div>

            <div className="step-title">
              <span>02</span>
              <div>
                <h3>CONTATO</h3>
                <p>Informações para comunicação</p>
              </div>
            </div>

            <div className="customer-form-grid">
              <label>
                Telefone Fixo
                <input
                  type="tel"
                  value={form.telefoneFixo}
                  onChange={(e) => setForm({ ...form, telefoneFixo: maskPhone(e.target.value) })}
                />
              </label>
              <label>
                Celular
                <input
                  type="tel"
                  value={form.telefoneCelular}
                  onChange={(e) => setForm({ ...form, telefoneCelular: maskPhone(e.target.value) })}
                />
              </label>
              <label>
                WhatsApp
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: maskPhone(e.target.value) })}
                />
              </label>
            </div>

            <div className="step-title">
              <span>03</span>
              <div>
                <h3>INFORMAÇÕES PROFISSIONAIS</h3>
                <p>Dados de renda e profissão</p>
              </div>
            </div>

            <div className="customer-form-grid">
              <label>
                Empresa
                <input
                  type="text"
                  value={form.empresaNome}
                  onChange={(e) => setForm({ ...form, empresaNome: e.target.value })}
                />
              </label>
              <label>
                Cargo / Função
                <input
                  type="text"
                  value={form.cargoFuncao}
                  onChange={(e) => setForm({ ...form, cargoFuncao: e.target.value })}
                />
              </label>
              <label>
                Classificação do Trabalho
                <select
                  value={form.classificacaoTrabalho}
                  onChange={(e) => setForm({ ...form, classificacaoTrabalho: e.target.value })}
                >
                  <option value="">Selecione</option>
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                  <option value="Autônomo">Autônomo</option>
                  <option value="Servidor Público">Servidor Público</option>
                  <option value="Aposentado">Aposentado</option>
                </select>
              </label>
              <label>
                Renda Mensal
                <MoneyInput
                  value={form.renda}
                  onValueChange={(v) => setForm({ ...form, renda: v })}
                  placeholder="0,00"
                />
              </label>
            </div>

            <div className="step-title">
              <span>04</span>
              <div>
                <h3>RESIDÊNCIA</h3>
                <p>Dados do imóvel onde reside</p>
              </div>
            </div>

            <div className="customer-form-grid">
              <label>
                Tipo de Residência
                <select
                  value={form.residenciaTipo}
                  onChange={(e) => setForm({ ...form, residenciaTipo: e.target.value })}
                >
                  <option value="">Selecione</option>
                  <option value="Própria">Própria</option>
                  <option value="Alugada">Alugada</option>
                  <option value="Cedida">Cedida</option>
                </select>
              </label>
              <label>
                Tempo na Residência (anos)
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.tempoResidencia}
                  onChange={(e) => setForm({ ...form, tempoResidencia: e.target.value })}
                  className="form-input"
                />
              </label>
            </div>

            <div className="step-title">
              <span>05</span>
              <div>
                <h3>VALORES DE FINANCIAMENTO</h3>
                <p>Projeção do investimento do cliente</p>
              </div>
            </div>

            <div className="customer-form-grid">
              <label>
                Valor do Veículo
                <MoneyInput
                  value={form.valorVeiculo}
                  onValueChange={(v) => setForm({ ...form, valorVeiculo: v })}
                  placeholder="0,00"
                />
              </label>
              <label>
                Valor de Entrada (Investimento)
                <MoneyInput
                  value={form.valorEntrada}
                  onValueChange={(v) => setForm({ ...form, valorEntrada: v })}
                  placeholder="0,00"
                />
              </label>
              <label>
                Valor a Financiar
                <MoneyInput
                  value={form.valorFinanciado}
                  onValueChange={(v) => setForm({ ...form, valorFinanciado: v })}
                  placeholder="0,00"
                />
              </label>
              <label>
                Taxa Mensal (%) *
                <input
                  type="number"
                  step="0.01"
                  value={form.taxaMensal}
                  onChange={(e) => setForm({ ...form, taxaMensal: e.target.value })}
                  required
                  className="form-input"
                />
              </label>
            </div>

            <div className="step-title">
              <span>06</span>
              <div>
                <h3>PRODUTOS E SERVIÇOS</h3>
                <p>Adicione serviços complementares ao financiamento</p>
              </div>
            </div>

            <div className="customer-form-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.garantiaEstendida}
                  onChange={(e) => setForm({ ...form, garantiaEstendida: e.target.checked })}
                />
                Garantia Estendida (12-24 meses)
              </label>
              <label>
                Valor *
                <MoneyInput
                  value={form.garantiaEstendidaValor}
                  onValueChange={(v) => setForm({ ...form, garantiaEstendidaValor: v })}
                  placeholder="0,00"
                  disabled={!form.garantiaEstendida}
                />
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.seguroVeiculo}
                  onChange={(e) => setForm({ ...form, seguroVeiculo: e.target.checked })}
                />
                Seguro do Veículo (Proteção Total)
              </label>
              <label>
                Valor *
                <MoneyInput
                  value={form.seguroVeiculoValor}
                  onValueChange={(v) => setForm({ ...form, seguroVeiculoValor: v })}
                  placeholder="0,00"
                  disabled={!form.seguroVeiculo}
                />
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.protecaoFinanceira}
                  onChange={(e) => setForm({ ...form, protecaoFinanceira: e.target.checked })}
                />
                Proteção Financeira (Seguro de Perda)
              </label>
              <label>
                Valor *
                <MoneyInput
                  value={form.protecaoFinanceiraValor}
                  onValueChange={(v) => setForm({ ...form, protecaoFinanceiraValor: v })}
                  placeholder="0,00"
                  disabled={!form.protecaoFinanceira}
                />
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.rastreamentoGps}
                  onChange={(e) => setForm({ ...form, rastreamentoGps: e.target.checked })}
                />
                Rastreamento GPS
              </label>
              <label>
                Valor *
                <MoneyInput
                  value={form.rastreamentoGpsValor}
                  onValueChange={(v) => setForm({ ...form, rastreamentoGpsValor: v })}
                  placeholder="0,00"
                  disabled={!form.rastreamentoGps}
                />
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.assessoriaJuridica}
                  onChange={(e) => setForm({ ...form, assessoriaJuridica: e.target.checked })}
                />
                Assessoria Jurídica
              </label>
              <label>
                Valor *
                <MoneyInput
                  value={form.assessoriaJuridicaValor}
                  onValueChange={(v) => setForm({ ...form, assessoriaJuridicaValor: v })}
                  placeholder="0,00"
                  disabled={!form.assessoriaJuridica}
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading || !clienteId} className="auth-submit">
                {loading ? "Salvando..." : "Visualizar Ficha"}
              </button>
            </div>
          </form>
        </>
      )}

      {/* Etapa 2: Preview da Ficha */}
      {currentStep === "preview" && fichaData && (
        <>
          <section className="module-heading">
            <div>
              <p>FICHA DO CLIENTE</p>
              <h1>Visualização e Geração de PDF</h1>
              <span>Revise os dados e gere o PDF para download.</span>
            </div>
          </section>

          {message && (
            <div className={`panel form-panel ${message.type === "success" ? "notice-success" : "notice-error"}`}>
              {message.text}
            </div>
          )}

          <div ref={fichaPreviewRef} id="ficha-preview-content" className="panel form-panel ficha-preview">
            <div className="ficha-preview-header">
              <h2>FICHA DO CLIENTE</h2>
              <p>VFC Multimarcas - {new Date().toLocaleDateString("pt-BR")}</p>
            </div>

            <div>
              <h3>DADOS PESSOAIS</h3>
              <div className="ficha-data-grid">
                <div>
                  <strong>Nome:</strong>
                  <p>{fichaData.cliente?.nome || "N/A"}</p>
                </div>
                <div>
                  <strong>CPF:</strong>
                  <p>{fichaData.cliente?.documento || "N/A"}</p>
                </div>
                <div>
                  <strong>Data de Nascimento:</strong>
                  <p>{fichaData.dataNascimento ? new Date(fichaData.dataNascimento).toLocaleDateString("pt-BR") : "N/A"}</p>
                </div>
                <div>
                  <strong>Sexo:</strong>
                  <p>{fichaData.sexo === "M" ? "Masculino" : fichaData.sexo === "F" ? "Feminino" : "N/A"}</p>
                </div>
                <div>
                  <strong>Estado Civil:</strong>
                  <p>{fichaData.estadoCivil || "N/A"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3>CONTATO</h3>
              <div className="ficha-data-grid-contact">
                <div>
                  <strong>Telefone Fixo:</strong>
                  <p>{fichaData.telefoneFixo || "N/A"}</p>
                </div>
                <div>
                  <strong>Celular:</strong>
                  <p>{fichaData.telefoneCelular || "N/A"}</p>
                </div>
                <div>
                  <strong>WhatsApp:</strong>
                  <p>{fichaData.whatsapp || "N/A"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3>INFORMAÇÕES PROFISSIONAIS</h3>
              <div className="ficha-data-grid">
                <div>
                  <strong>Empresa:</strong>
                  <p>{fichaData.empresaNome || "N/A"}</p>
                </div>
                <div>
                  <strong>Cargo/Função:</strong>
                  <p>{fichaData.cargoFuncao || "N/A"}</p>
                </div>
                <div>
                  <strong>Classificação:</strong>
                  <p>{fichaData.classificacaoTrabalho || "N/A"}</p>
                </div>
                <div>
                  <strong>Renda Mensal:</strong>
                  <p>
                    {fichaData.renda
                      ? `R$ ${parseFloat(fichaData.renda.toString()).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3>RESIDÊNCIA</h3>
              <div className="ficha-data-grid">
                <div>
                  <strong>Tipo:</strong>
                  <p>{fichaData.residenciaTipo || "N/A"}</p>
                </div>
                <div>
                  <strong>Tempo na Residência:</strong>
                  <p>{fichaData.tempoResidencia ? `${fichaData.tempoResidencia} anos` : "N/A"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3>FINANCIAMENTO</h3>
              <div className="ficha-data-grid-contact">
                <div>
                  <strong>Valor do Veículo:</strong>
                  <p>
                    {fichaData.valorVeiculo
                      ? `R$ ${parseFloat(fichaData.valorVeiculo.toString()).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <strong>Valor de Entrada:</strong>
                  <p>
                    {fichaData.valorEntrada
                      ? `R$ ${parseFloat(fichaData.valorEntrada.toString()).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <strong>Valor a Financiar:</strong>
                  <p>
                    {fichaData.valorFinanciado
                      ? `R$ ${parseFloat(fichaData.valorFinanciado.toString()).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {simulacoes.length > 0 && (
              <div>
                <h3>SIMULAÇÕES DE PARCELAMENTO</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Parcelamento</th>
                      <th>Valor Parcela</th>
                      <th>Total Parcelas</th>
                      <th>Juros Estimados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulacoes.map((sim) => (
                      <tr key={sim.parcelas}>
                        <td>{sim.parcelas}x</td>
                        <td>
                          R$ {sim.valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td>
                          R$ {sim.totalParcelas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td>
                          R$ {sim.jurosEstimados.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(fichaData.garantiaEstendida || fichaData.seguroVeiculo || fichaData.protecaoFinanceira || fichaData.rastreamentoGps || fichaData.assessoriaJuridica) && (
              <div>
                <h3>PRODUTOS E SERVIÇOS</h3>
                <div className="ficha-data-grid">
                  {fichaData.garantiaEstendida && (
                    <div>
                      <strong>✓ Garantia Estendida</strong>
                      <p>
                        R$ {parseFloat(fichaData.garantiaEstendidaValor?.toString() || "0").toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  )}
                  {fichaData.seguroVeiculo && (
                    <div>
                      <strong>✓ Seguro do Veículo</strong>
                      <p>
                        R$ {parseFloat(fichaData.seguroVeiculoValor?.toString() || "0").toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  )}
                  {fichaData.protecaoFinanceira && (
                    <div>
                      <strong>✓ Proteção Financeira</strong>
                      <p>
                        R$ {parseFloat(fichaData.protecaoFinanceiraValor?.toString() || "0").toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  )}
                  {fichaData.rastreamentoGps && (
                    <div>
                      <strong>✓ Rastreamento GPS</strong>
                      <p>
                        R$ {parseFloat(fichaData.rastreamentoGpsValor?.toString() || "0").toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  )}
                  {fichaData.assessoriaJuridica && (
                    <div>
                      <strong>✓ Assessoria Jurídica</strong>
                      <p>
                        R$ {parseFloat(fichaData.assessoriaJuridicaValor?.toString() || "0").toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button onClick={handleBackToForm} className="secondary-button" disabled={loading}>
              Editar Ficha
            </button>
            <button onClick={handleGeneratePdf} className="auth-submit" disabled={loading}>
              {loading ? "Gerando PDF..." : "Gerar e Baixar PDF"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
