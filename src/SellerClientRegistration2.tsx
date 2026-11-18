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

const fmtCurrency = (val: string | number | undefined | null) => {
  if (val === null || val === undefined || val === "") return "R$ 0,00";
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^\d.-]/g, ""));
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

type FipeOption = { code: string; name: string };
const fipeVehicleTypes = [
  { value: "cars", label: "Carro" },
  { value: "motorcycles", label: "Moto" },
  { value: "trucks", label: "Caminhão" },
];

type ClientData = {
  id: number;
  nome: string;
  documento?: string;
  email?: string;
  telefone?: string;
};

type FormData = {
  // Dados do Veículo para a proposta
  marcaModelo: string;
  anoVeiculo: string;
  valorVeiculo: string;
  valorFipe: string;
  valorEntrada: string; // Investimento na proposta
  valorFinanciado: string; // Base simulada
  taxaMensal: string; // Padrão: 1.70
  // Dados do Cliente
  nomeCompleto: string;
  cpf: string;
  telefoneFixo: string;
  telefoneCelular: string;
  whatsapp: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  // Residência e Profissional
  residenciaTipo: string;
  tempoResidencia: string;
  empresaNome: string;
  cargoFuncao: string;
  classificacaoTrabalho: string;
  renda: string;
  // Produtos e Serviços adicionais
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
  // Dados da Proposta Comercial
  cnpjEmpresa: string;
  cidadeData: string;
};

type FichaSalva = {
  id: number;
  clienteId: number;
  cliente?: ClientData;
  createdAt: string;
} & FormData;

export default function SellerClientRegistration({ authToken }: { authToken?: string } = {}) {
  const token = authToken || localStorage.getItem("vfcAuthToken") || "";
  const [currentStep, setCurrentStep] = useState<"formulario" | "preview">("formulario");
  const [clienteId, setClienteId] = useState("");
  const [clientes, setClientes] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [fichaData, setFichaData] = useState<FichaSalva | null>(null);
  const fichaPreviewRef = useRef<HTMLDivElement>(null);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  // Estados da consulta FIPE
  const [tipoVeiculo, setTipoVeiculo] = useState("cars");
  const [fipeMarca, setFipeMarca] = useState("");
  const [fipeModelo, setFipeModelo] = useState("");
  const [fipeYear, setFipeYear] = useState("");
  const [fipeBrands, setFipeBrands] = useState<FipeOption[]>([]);
  const [fipeModels, setFipeModels] = useState<FipeOption[]>([]);
  const [fipeYears, setFipeYears] = useState<FipeOption[]>([]);
  const [fipeLoading, setFipeLoading] = useState("");
  const [lookingUpFipe, setLookingUpFipe] = useState(false);
  const [fipeDetails, setFipeDetails] = useState<{
    codigoFipe?: string;
    combustivel?: string;
    mesReferencia?: string;
    anoModelo?: string;
    valorFipe?: string;
  }>({});

  const [form, setForm] = useState<FormData>({
    marcaModelo: "",
    anoVeiculo: new Date().getFullYear().toString(),
    valorVeiculo: "",
    valorFipe: "",
    valorEntrada: "",
    valorFinanciado: "",
    taxaMensal: "1.70",
    nomeCompleto: "",
    cpf: "",
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
    cnpjEmpresa: "54.767.023/0001-55",
    cidadeData: "",
  });

  // Carregar lista de clientes
  useEffect(() => {
    const fetchClientes = async () => {
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
    if (token) fetchClientes();
  }, [token]);

  // Carregar marcas FIPE ao alterar tipo de veículo
  useEffect(() => {
    setFipeBrands([]);
    setFipeMarca("");
    setFipeModelo("");
    setFipeYear("");
    setFipeModels([]);
    setFipeYears([]);
    setFipeDetails({});
    if (!token) return;
    let cancelled = false;
    setFipeLoading("brands");
    fetch(`${API_BASE_URL}/veiculos/fipe/brands?type=${tipoVeiculo}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.data) {
          setFipeBrands(Array.isArray(data.data) ? data.data : []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!cancelled) setFipeLoading("");
      });
    return () => {
      cancelled = true;
    };
  }, [tipoVeiculo, token]);

  const selectedBrandId = fipeBrands.find((b) => b.name === fipeMarca)?.code || "";

  // Carregar modelos FIPE ao selecionar marca
  useEffect(() => {
    setFipeModels([]);
    setFipeModelo("");
    setFipeYear("");
    setFipeYears([]);
    setFipeDetails({});
    if (!selectedBrandId || !token) return;
    let cancelled = false;
    setFipeLoading("models");
    fetch(`${API_BASE_URL}/veiculos/fipe/brands/${selectedBrandId}/models?type=${tipoVeiculo}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.data) {
          setFipeModels(Array.isArray(data.data) ? data.data : []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!cancelled) setFipeLoading("");
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBrandId, tipoVeiculo, token]);

  const selectedModelId = fipeModels.find((m) => m.name === fipeModelo)?.code || "";

  // Carregar anos FIPE ao selecionar modelo
  useEffect(() => {
    setFipeYears([]);
    setFipeYear("");
    setFipeDetails({});
    if (!selectedBrandId || !selectedModelId || !token) return;
    let cancelled = false;
    setFipeLoading("years");
    fetch(
      `${API_BASE_URL}/veiculos/fipe/brands/${selectedBrandId}/models/${selectedModelId}/years?type=${tipoVeiculo}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.data) {
          setFipeYears(Array.isArray(data.data) ? data.data : []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!cancelled) setFipeLoading("");
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBrandId, selectedModelId, tipoVeiculo, token]);

  // Consultar dados detalhados da FIPE quando o ano for selecionado
  const chooseFipeYear = async (yearId: string) => {
    setFipeYear(yearId);
    if (!yearId || !selectedBrandId || !selectedModelId || !token) return;
    setLookingUpFipe(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/veiculos/fipe/brands/${selectedBrandId}/models/${selectedModelId}/years/${encodeURIComponent(yearId)}?type=${tipoVeiculo}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok && data?.data) {
        const result = data.data;
        const brandName = fipeMarca || result.brand || "";
        const modelName = fipeModelo || result.model || "";
        const fullTitle = `${brandName} ${modelName}`.trim();
        const priceStr = String(result.price || 0);

        setFipeDetails({
          codigoFipe: result.codeFipe || "",
          combustivel: result.fuel || "",
          mesReferencia: String(result.referenceMonth || "").trim(),
          anoModelo: String(result.modelYear || ""),
          valorFipe: priceStr,
        });

        setForm((prev) => {
          const valorVeiculoAtual = prev.valorVeiculo || priceStr;
          const numVeiculo = Number(valorVeiculoAtual || 0);
          const numEntrada = Number(prev.valorEntrada || 0);
          const total = numVeiculo - numEntrada;
          return {
            ...prev,
            marcaModelo: fullTitle,
            anoVeiculo: String(result.modelYear || prev.anoVeiculo),
            valorFipe: priceStr,
            valorVeiculo: valorVeiculoAtual,
            valorFinanciado: String(Math.max(0, Math.round(total * 100) / 100)),
          };
        });
      }
    } catch (err) {
      console.error("Falha ao consultar detalhes FIPE:", err);
    } finally {
      setLookingUpFipe(false);
    }
  };

  const handleClientSelect = (idStr: string) => {
    setClienteId(idStr);
    const c = clientes.find((item) => item.id === Number(idStr));
    if (c) {
      setForm((prev) => ({
        ...prev,
        nomeCompleto: c.nome || prev.nomeCompleto,
        cpf: c.documento ? maskCPF(c.documento) : prev.cpf,
        telefoneCelular: c.telefone ? maskPhone(c.telefone) : prev.telefoneCelular,
        whatsapp: c.telefone ? maskPhone(c.telefone) : prev.whatsapp,
      }));
    }
  };

  const handleMoneyChange = (field: "valorVeiculo" | "valorEntrada", value: string) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      const numVeiculo = Number(next.valorVeiculo || 0);
      const numEntrada = Number(next.valorEntrada || 0);
      const total = numVeiculo - numEntrada;
      next.valorFinanciado = next.valorVeiculo ? String(Math.max(0, Math.round(total * 100) / 100)) : "";
      return next;
    });
  };

  const selectedClient = clientes.find((c) => c.id === Number(clienteId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
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
        marcaModelo: form.marcaModelo,
        anoVeiculo: form.anoVeiculo,
        valorFipe: form.valorFipe,
        cidadeData: form.cidadeData,
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

      setMessage({ type: "success", text: "Proposta gerada com sucesso! Visualizando..." });
      setTimeout(() => setCurrentStep("preview"), 500);
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
      const clienteData = clientes.find((c) => c.id === Number(clienteId));
      const clienteEmail = clienteData?.email || "";
      const clientName = fichaData.nomeCompleto || selectedClient?.nome || "Cliente";

      const pdf = await generateFichaPdf(fichaData, "ficha-preview-content");
      pdf.save(`Proposta_${clientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);

      const saveResult = await savePdfToServer(pdf, clientName, clienteEmail, token);

      if (saveResult.success) {
        setMessage({
          type: "success",
          text: `PDF gerado e arquivado com sucesso! ${saveResult.emailSent ? "Email enviado ao cliente." : ""}`,
        });

        if (saveResult.pdfId && clienteEmail && !saveResult.emailSent) {
          setTimeout(() => {
            sendPdfByEmail(saveResult.pdfId!, clienteEmail, token).then((emailResult) => {
              if (emailResult.success) {
                setMessage({ type: "success", text: "Proposta enviada por e-mail com sucesso!" });
              }
            });
          }, 1000);
        }
      } else {
        setMessage({
          type: "error",
          text: `PDF baixado localmente, mas houve erro no servidor: ${saveResult.message}`,
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
  };

  // Simulações com prazos comerciais: 24, 36, 48 e 60 meses
  const baseCalculo =
    fichaData && fichaData.valorFinanciado
      ? parseFloat(fichaData.valorFinanciado.toString().replace(/[^\d.-]/g, ""))
      : fichaData && fichaData.valorVeiculo
      ? parseFloat(fichaData.valorVeiculo.toString().replace(/[^\d.-]/g, ""))
      : 0;

  const taxaCalculo = fichaData && fichaData.taxaMensal ? parseFloat(fichaData.taxaMensal) : 1.7;
  const simulacoes = baseCalculo > 0 ? calcularSimulacoes(baseCalculo, taxaCalculo, [24, 36, 48, 60]) : [];

  return (
    <div className="content module-content">
      {/* Etapa 1: Formulário */}
      {currentStep === "formulario" && (
        <>
          <section className="module-heading">
            <div>
              <p>SOLUÇÕES COMERCIAIS</p>
              <h1>Ficha de Proposta Comercial</h1>
              <span>Preencha os dados do cliente e consulte a tabela FIPE oficial para emitir a proposta de prestação de serviços.</span>
            </div>
          </section>

          {message && (
            <div className={`panel form-panel ${message.type === "success" ? "notice-success" : "notice-error"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="panel form-panel">
            {/* 01: Informações do Cliente */}
            <div className="step-title">
              <span>01</span>
              <div>
                <h3>INFORMAÇÕES DO CLIENTE</h3>
                <p>Selecione um cliente cadastrado ou preencha os dados</p>
              </div>
            </div>

            <div className="customer-form-grid">
              <label>
                Cliente Cadastrado *
                <select
                  value={clienteId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="">Selecione um cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} {c.documento ? `(${maskCPF(c.documento)})` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Nome Completo *
                <input
                  type="text"
                  value={form.nomeCompleto}
                  onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })}
                  placeholder="Nome do cliente"
                  required
                  className="form-input"
                />
              </label>

              <label>
                CPF *
                <input
                  type="text"
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  required
                  className="form-input"
                />
              </label>

              <label>
                Telefone / DDD *
                <input
                  type="text"
                  value={form.whatsapp || form.telefoneCelular}
                  onChange={(e) => {
                    const masked = maskPhone(e.target.value);
                    setForm({ ...form, whatsapp: masked, telefoneCelular: masked });
                  }}
                  placeholder="(00) 90000-0000"
                  required
                  className="form-input"
                />
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
            </div>

            {/* 02: Consulta FIPE e Dados do Veículo */}
            <div className="step-title">
              <span>02</span>
              <div>
                <h3>DADOS DO VEÍCULO (CONSULTA TABELA FIPE)</h3>
                <p>Selecione o veículo na FIPE oficial para preenchimento automático do modelo, ano e valor de referência</p>
              </div>
            </div>

            {/* Seletor em cascata FIPE */}
            <div className="customer-form-grid" style={{ marginBottom: "1rem" }}>
              <label>
                Tipo de Veículo
                <select
                  value={tipoVeiculo}
                  onChange={(e) => setTipoVeiculo(e.target.value)}
                  className="form-input"
                >
                  {fipeVehicleTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </label>

              <label>
                Marca (FIPE)
                <select
                  value={fipeMarca}
                  disabled={fipeLoading === "brands"}
                  onChange={(e) => setFipeMarca(e.target.value)}
                  className="form-input"
                >
                  <option value="">
                    {fipeLoading === "brands" ? "Carregando marcas..." : "Selecione a marca..."}
                  </option>
                  {fipeBrands.map((b) => (
                    <option key={b.code} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Modelo (FIPE)
                <select
                  value={fipeModelo}
                  disabled={!fipeMarca || fipeLoading === "models"}
                  onChange={(e) => setFipeModelo(e.target.value)}
                  className="form-input"
                >
                  <option value="">
                    {fipeLoading === "models"
                      ? "Carregando modelos..."
                      : fipeMarca
                      ? "Selecione o modelo..."
                      : "Escolha a marca primeiro"}
                  </option>
                  {fipeModels.map((m) => (
                    <option key={m.code} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Ano Modelo (FIPE)
                <select
                  value={fipeYear}
                  disabled={!selectedModelId || fipeLoading === "years" || lookingUpFipe}
                  onChange={(e) => void chooseFipeYear(e.target.value)}
                  className="form-input"
                >
                  <option value="">
                    {fipeLoading === "years"
                      ? "Carregando anos..."
                      : lookingUpFipe
                      ? "Consultando FIPE..."
                      : selectedModelId
                      ? "Selecione o ano..."
                      : "Escolha o modelo primeiro"}
                  </option>
                  {fipeYears.map((y) => (
                    <option key={y.code} value={y.code}>{y.name}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Resultado da consulta FIPE */}
            {(fipeDetails.codigoFipe || lookingUpFipe) && (
              <div className="fipe-result" style={{ marginBottom: "1.25rem" }}>
                <div>
                  <span>Mês de referência</span>
                  <strong>{fipeDetails.mesReferencia || "—"}</strong>
                </div>
                <div>
                  <span>Valor FIPE</span>
                  <strong>{fipeDetails.valorFipe ? fmtCurrency(fipeDetails.valorFipe) : "—"}</strong>
                </div>
                <div>
                  <span>Código FIPE</span>
                  <strong>{fipeDetails.codigoFipe || "—"}</strong>
                </div>
                <div>
                  <span>Combustível</span>
                  <strong>{fipeDetails.combustivel || "—"}</strong>
                </div>
                <div>
                  <span>Ano modelo</span>
                  <strong>{fipeDetails.anoModelo || "—"}</strong>
                </div>
              </div>
            )}

            {/* Campos de Valores e Proposta */}
            <div className="customer-form-grid">
              <label>
                Marca e Modelo (semelhante à FIPE) *
                <input
                  type="text"
                  value={form.marcaModelo}
                  onChange={(e) => setForm({ ...form, marcaModelo: e.target.value })}
                  placeholder="Ex: FIAT STRADA FREEDOM 1.3"
                  required
                  className="form-input"
                />
              </label>

              <label>
                Ano do Veículo
                <input
                  type="text"
                  value={form.anoVeiculo}
                  onChange={(e) => setForm({ ...form, anoVeiculo: e.target.value })}
                  placeholder="Ex: 2026"
                  className="form-input"
                />
              </label>

              <label>
                Valor do Veículo *
                <MoneyInput
                  value={form.valorVeiculo}
                  onValueChange={(v) => handleMoneyChange("valorVeiculo", v)}
                  placeholder="0,00"
                  required
                />
              </label>

              <label>
                Valor FIPE
                <MoneyInput
                  value={form.valorFipe}
                  onValueChange={(v) => setForm({ ...form, valorFipe: v })}
                  placeholder="0,00"
                />
              </label>

              <label>
                Valor de Entrada (Investimento na Proposta)
                <MoneyInput
                  value={form.valorEntrada}
                  onValueChange={(v) => handleMoneyChange("valorEntrada", v)}
                  placeholder="0,00"
                />
              </label>

              <label>
                Valor a Financiar (Base Simulada)
                <MoneyInput
                  value={form.valorFinanciado}
                  onValueChange={(v) => setForm({ ...form, valorFinanciado: v })}
                  placeholder="0,00"
                />
              </label>

              <label>
                Taxa Mensal (%) — Sistema Price
                <input
                  type="number"
                  step="0.01"
                  value={form.taxaMensal}
                  onChange={(e) => setForm({ ...form, taxaMensal: e.target.value })}
                  required
                  className="form-input"
                />
              </label>

              <label>
                CNPJ da Empresa na Proposta
                <input
                  type="text"
                  value={form.cnpjEmpresa}
                  onChange={(e) => setForm({ ...form, cnpjEmpresa: e.target.value })}
                  placeholder="54.767.023/0001-55"
                  className="form-input"
                />
              </label>
            </div>

            {/* Toggle para Campos Complementares / Opcionais */}
            <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                style={{ fontSize: "0.85rem" }}
              >
                {showAdvancedFields ? "▲ Ocultar dados adicionais (Residência, Renda, Serviços)" : "▼ Exibir dados adicionais (Residência, Renda, Serviços)"}
              </button>
            </div>

            {showAdvancedFields && (
              <>
                <div className="step-title">
                  <span>03</span>
                  <div>
                    <h3>INFORMAÇÕES PROFISSIONAIS E RESIDÊNCIA</h3>
                    <p>Dados para enriquecimento cadastral (opcional)</p>
                  </div>
                </div>

                <div className="customer-form-grid">
                  <label>
                    Nome da Empresa
                    <input
                      type="text"
                      value={form.empresaNome}
                      onChange={(e) => setForm({ ...form, empresaNome: e.target.value })}
                      placeholder="Empresa"
                      className="form-input"
                    />
                  </label>
                  <label>
                    Cargo / Função
                    <input
                      type="text"
                      value={form.cargoFuncao}
                      onChange={(e) => setForm({ ...form, cargoFuncao: e.target.value })}
                      placeholder="Cargo"
                      className="form-input"
                    />
                  </label>
                  <label>
                    Renda Mensal
                    <MoneyInput
                      value={form.renda}
                      onValueChange={(v) => setForm({ ...form, renda: v })}
                      placeholder="0,00"
                    />
                  </label>
                  <label>
                    Tipo de Residência
                    <input
                      type="text"
                      value={form.residenciaTipo}
                      onChange={(e) => setForm({ ...form, residenciaTipo: e.target.value })}
                      placeholder="Própria / Alugada"
                      className="form-input"
                    />
                  </label>
                  <label>
                    Tempo de Residência
                    <input
                      type="text"
                      value={form.tempoResidencia}
                      onChange={(e) => setForm({ ...form, tempoResidencia: e.target.value })}
                      placeholder="Ex: 5 anos"
                      className="form-input"
                    />
                  </label>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="submit" disabled={loading || !clienteId} className="auth-submit">
                {loading ? "Processando..." : "Visualizar Proposta Comercial"}
              </button>
            </div>
          </form>
        </>
      )}

      {/* Etapa 2: Preview da Proposta Comercial */}
      {currentStep === "preview" && fichaData && (
        <>
          <section className="module-heading">
            <div>
              <p>SOLUÇÕES COMERCIAIS</p>
              <h1>Proposta de Prestação de Serviços</h1>
              <span>Visualize o layout da proposta exatamente como no modelo comercial e faça o download do PDF.</span>
            </div>
          </section>

          {message && (
            <div className={`panel form-panel ${message.type === "success" ? "notice-success" : "notice-error"}`}>
              {message.text}
            </div>
          )}

          {/* DOCUMENTO OFICIAL FORMATADO */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "16px 0",
              overflowX: "auto",
              backgroundColor: "#E5E7EB",
              borderRadius: "8px",
            }}
          >
            <div
              ref={fichaPreviewRef}
              id="ficha-preview-content"
              style={{
                width: "820px",
                minWidth: "820px",
                backgroundColor: "#FFFFFF",
                color: "#17362C",
                fontFamily: "'Aptos', 'Segoe UI', 'Carlito', Arial, sans-serif",
                fontSize: "12px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                borderRadius: "4px",
                overflow: "hidden",
                border: "1px solid #CBD5E1",
              }}
            >
              {/* TOPO: LOGO + CNPJ */}
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: "50%",
                        height: "100px",
                        padding: "10px 16px",
                        backgroundColor: "#FFFFFF",
                        verticalAlign: "middle",
                        textAlign: "left",
                      }}
                    >
                      <img
                        src="/logo-proposta.png"
                        alt="Logo Proposta"
                        style={{ maxHeight: "80px", maxWidth: "340px", objectFit: "contain", display: "block" }}
                        crossOrigin="anonymous"
                      />
                    </td>
                    <td
                      style={{
                        width: "50%",
                        height: "100px",
                        backgroundColor: "#003B2B",
                        color: "#FFFFFF",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontWeight: "bold",
                        fontSize: "18px",
                        letterSpacing: "0.5px",
                        padding: "10px",
                      }}
                    >
                      CNPJ: {fichaData.cnpjEmpresa || "54.767.023/0001-55"}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* FAIXA DOURADA */}
              <div style={{ height: "5px", backgroundColor: "#BD934C", width: "100%" }}></div>

              {/* TÍTULO PRINCIPAL */}
              <div
                style={{
                  padding: "14px 10px 10px",
                  textAlign: "center",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "#003B2B",
                    letterSpacing: "0.5px",
                  }}
                >
                  REPOSICIONAMENTO DE PERFIL DE CRÉDITO PARA FINANCIAMENTO VEICULAR
                </h2>
              </div>

              {/* BARRA DE SUBTÍTULO */}
              <div
                style={{
                  backgroundColor: "#012D21",
                  color: "#FFFFFF",
                  textAlign: "center",
                  padding: "6px 8px",
                  fontWeight: "bold",
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                }}
              >
                SIMULAÇÃO DE FINANCIAMENTO &nbsp;|&nbsp; PROPOSTA DE PRESTAÇÃO DE SERVIÇOS
              </div>

              {/* BOX DE SIMULAÇÃO ENUNCIATIVA */}
              <div
                style={{
                  backgroundColor: "#FCF8EF",
                  color: "#17362C",
                  fontSize: "10.5px",
                  lineHeight: "1.4",
                  padding: "8px 12px",
                  textAlign: "justify",
                  borderBottom: "1px solid #F0E6D2",
                }}
              >
                <strong>SIMULAÇÃO ENUNCIATIVA</strong> — O reposicionamento do perfil de crédito vai tratar de buscar junto ao cliente tal condição de expectativa do cliente, não garantindo as projeções automáticas, pois as ações ficam a dever do cliente e das instituições credoras consultadas.
              </div>

              {/* ESPAÇADOR */}
              <div style={{ height: "6px", backgroundColor: "#FFFFFF" }}></div>

              {/* SEÇÃO 01: INFORMAÇÕES DO CLIENTE */}
              <div style={{ padding: "0 10px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #A2B9AD" }}>
                  <tbody>
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          backgroundColor: "#064D38",
                          color: "#FFFFFF",
                          fontWeight: "bold",
                          fontSize: "11px",
                          padding: "5px 8px",
                        }}
                      >
                        01 &nbsp; INFORMAÇÕES DO CLIENTE
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          width: "22%",
                          backgroundColor: "#EDF5F0",
                          color: "#003B2B",
                          fontWeight: "bold",
                          fontSize: "10.5px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        NOME COMPLETO
                      </td>
                      <td
                        colSpan={3}
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "#17362C",
                          fontWeight: "bold",
                          fontSize: "11px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        {fichaData.nomeCompleto || fichaData.cliente?.nome || "FULANO DE TAL COMPLETO"}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          width: "22%",
                          backgroundColor: "#EDF5F0",
                          color: "#003B2B",
                          fontWeight: "bold",
                          fontSize: "10.5px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        CPF
                      </td>
                      <td
                        style={{
                          width: "28%",
                          backgroundColor: "#FFFFFF",
                          color: "#17362C",
                          fontSize: "11px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        {fichaData.cpf || (fichaData.cliente?.documento ? maskCPF(fichaData.cliente.documento) : "—")}
                      </td>
                      <td
                        style={{
                          width: "22%",
                          backgroundColor: "#EDF5F0",
                          color: "#003B2B",
                          fontWeight: "bold",
                          fontSize: "10.5px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        TELEFONE / DDD
                      </td>
                      <td
                        style={{
                          width: "28%",
                          backgroundColor: "#FFFFFF",
                          color: "#17362C",
                          fontSize: "11px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        {fichaData.whatsapp || fichaData.telefoneCelular || fichaData.cliente?.telefone || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#EDF5F0",
                          color: "#003B2B",
                          fontWeight: "bold",
                          fontSize: "10.5px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        DATA DE NASCIMENTO
                      </td>
                      <td
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "#17362C",
                          fontSize: "11px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        {fichaData.dataNascimento
                          ? new Date(fichaData.dataNascimento + "T00:00:00").toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                      <td
                        colSpan={2}
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "#67766E",
                          fontSize: "9.5px",
                          fontStyle: "italic",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        INFORMAÇÕES DE BASE PARA CONSULTA PRÉVIA
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ESPAÇADOR */}
              <div style={{ height: "6px", backgroundColor: "#FFFFFF" }}></div>

              {/* SEÇÃO 02: DADOS DO VEÍCULO */}
              <div style={{ padding: "0 10px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #A2B9AD" }}>
                  <tbody>
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          backgroundColor: "#064D38",
                          color: "#FFFFFF",
                          fontWeight: "bold",
                          fontSize: "11px",
                          padding: "5px 8px",
                        }}
                      >
                        02 &nbsp; DADOS DO VEÍCULO
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          width: "22%",
                          backgroundColor: "#EDF5F0",
                          color: "#003B2B",
                          fontWeight: "bold",
                          fontSize: "10.5px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        MARCA E MODELO
                      </td>
                      <td
                        style={{
                          width: "48%",
                          backgroundColor: "#FFFFFF",
                          color: "#17362C",
                          fontWeight: "bold",
                          fontSize: "11px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        {fichaData.marcaModelo || "COLOCAR SEMELHANTE A FIPE"}
                      </td>
                      <td
                        style={{
                          width: "12%",
                          backgroundColor: "#EDF5F0",
                          color: "#003B2B",
                          fontWeight: "bold",
                          fontSize: "10.5px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                          textAlign: "center",
                        }}
                      >
                        ANO
                      </td>
                      <td
                        style={{
                          width: "18%",
                          backgroundColor: "#FFFFFF",
                          color: "#17362C",
                          fontSize: "11px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                          textAlign: "center",
                        }}
                      >
                        {fichaData.anoVeiculo || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#EDF5F0",
                          color: "#003B2B",
                          fontWeight: "bold",
                          fontSize: "10.5px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        VALOR DO VEÍCULO
                      </td>
                      <td
                        style={{
                          backgroundColor: "#FCF8EF",
                          color: "#215A43",
                          fontWeight: "bold",
                          fontSize: "13px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                          textAlign: "right",
                        }}
                      >
                        {fmtCurrency(fichaData.valorVeiculo)}
                      </td>
                      <td
                        style={{
                          backgroundColor: "#EDF5F0",
                          color: "#003B2B",
                          fontWeight: "bold",
                          fontSize: "10.5px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                          textAlign: "center",
                        }}
                      >
                        VALOR FIPE
                      </td>
                      <td
                        style={{
                          backgroundColor: "#FCF8EF",
                          color: "#215A43",
                          fontWeight: "bold",
                          fontSize: "13px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                          textAlign: "right",
                        }}
                      >
                        {fichaData.valorFipe ? fmtCurrency(fichaData.valorFipe) : fmtCurrency(fichaData.valorVeiculo)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#EDF5F0",
                          color: "#003B2B",
                          fontWeight: "bold",
                          fontSize: "10.5px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        BASE SIMULADA
                      </td>
                      <td
                        style={{
                          backgroundColor: "#EDF5F0",
                          color: "#003B2B",
                          fontWeight: "bold",
                          fontSize: "13px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                          textAlign: "right",
                        }}
                      >
                        {fmtCurrency(fichaData.valorFinanciado || fichaData.valorVeiculo)}
                      </td>
                      <td
                        colSpan={2}
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "#67766E",
                          fontSize: "9.5px",
                          fontStyle: "italic",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        Base: valor informado do veículo (sem outros encargos).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ESPAÇADOR */}
              <div style={{ height: "6px", backgroundColor: "#FFFFFF" }}></div>

              {/* SEÇÃO 03: PROJEÇÕES AUTOMÁTICAS DE PARCELAS */}
              <div style={{ padding: "0 10px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #A2B9AD" }}>
                  <thead>
                    <tr>
                      <th
                        colSpan={4}
                        style={{
                          backgroundColor: "#064D38",
                          color: "#FFFFFF",
                          fontWeight: "bold",
                          fontSize: "11px",
                          padding: "5px 8px",
                          textAlign: "left",
                        }}
                      >
                        03 &nbsp; PROJEÇÕES AUTOMÁTICAS DE PARCELAS
                      </th>
                    </tr>
                    <tr style={{ backgroundColor: "#012D21", color: "#FFFFFF", fontSize: "10px" }}>
                      <th style={{ padding: "6px", border: "1px solid #A2B9AD", width: "25%", textAlign: "center" }}>
                        PRAZO
                      </th>
                      <th style={{ padding: "6px", border: "1px solid #A2B9AD", width: "25%", textAlign: "center" }}>
                        PARCELA MENSAL
                      </th>
                      <th style={{ padding: "6px", border: "1px solid #A2B9AD", width: "25%", textAlign: "center" }}>
                        TOTAL DAS PARCELAS
                      </th>
                      <th style={{ padding: "6px", border: "1px solid #A2B9AD", width: "25%", textAlign: "center" }}>
                        JUROS ESTIMADOS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulacoes.map((sim, idx) => {
                      const isEven = idx % 2 === 1;
                      const bgRow = isEven ? "#F2F7F3" : "#FFFFFF";
                      return (
                        <tr key={sim.parcelas} style={{ backgroundColor: bgRow }}>
                          <td
                            style={{
                              padding: "6px 8px",
                              border: "1px solid #A2B9AD",
                              textAlign: "center",
                              fontWeight: "bold",
                              color: "#003B2B",
                              fontSize: "11px",
                            }}
                          >
                            {sim.parcelas} MESES
                          </td>
                          <td
                            style={{
                              padding: "6px 8px",
                              border: "1px solid #A2B9AD",
                              textAlign: "right",
                              fontWeight: "bold",
                              color: "#003B2B",
                              fontSize: "12px",
                            }}
                          >
                            {fmtCurrency(sim.valorParcela)}
                          </td>
                          <td
                            style={{
                              padding: "6px 8px",
                              border: "1px solid #A2B9AD",
                              textAlign: "right",
                              color: "#003B2B",
                              fontSize: "11px",
                            }}
                          >
                            {fmtCurrency(sim.totalParcelas)}
                          </td>
                          <td
                            style={{
                              padding: "6px 8px",
                              border: "1px solid #A2B9AD",
                              textAlign: "right",
                              color: "#003B2B",
                              fontSize: "11px",
                            }}
                          >
                            {fmtCurrency(sim.jurosEstimados)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          backgroundColor: "#FCF8EF",
                          color: "#17362C",
                          fontSize: "9.5px",
                          padding: "6px 8px",
                          border: "1px solid #A2B9AD",
                          lineHeight: "1.3",
                        }}
                      >
                        Critério matemático: sistema Price, hipótese de {taxaCalculo.toFixed(2).replace(".", ",")}% a.m. • Não inclui IOF, seguros, tarifas nem demais componentes do CET. SUJEITO À ANÁLISE DE CRÉDITO*
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ESPAÇADOR */}
              <div style={{ height: "6px", backgroundColor: "#FFFFFF" }}></div>

              {/* VALOR DE INVESTIMENTO NA PROPOSTA */}
              <div style={{ padding: "0 10px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #A2B9AD" }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          width: "60%",
                          backgroundColor: "#EDF5F0",
                          color: "#003B2B",
                          fontWeight: "bold",
                          fontSize: "12px",
                          padding: "10px 12px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        VALOR DE INVESTIMENTO NA PROPOSTA
                      </td>
                      <td
                        style={{
                          width: "40%",
                          backgroundColor: "#FCF8EF",
                          color: "#003B2B",
                          fontWeight: "bold",
                          fontSize: "16px",
                          textAlign: "center",
                          padding: "10px 12px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        {fmtCurrency(fichaData.valorEntrada || "5000")}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "#67766E",
                          fontSize: "9.5px",
                          padding: "5px 10px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        Valor destinado à prestação de serviços de assessoria. Não é parcela de financiamento, sinal bancário ou garantia de concessão de crédito.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ESPAÇADOR */}
              <div style={{ height: "6px", backgroundColor: "#FFFFFF" }}></div>

              {/* SEÇÃO 04: OBJETO DA PRESTAÇÃO DE SERVIÇOS */}
              <div style={{ padding: "0 10px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #A2B9AD" }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#064D38",
                          color: "#FFFFFF",
                          fontWeight: "bold",
                          fontSize: "11px",
                          padding: "5px 8px",
                        }}
                      >
                        04 &nbsp; OBJETO DA PRESTAÇÃO DE SERVIÇOS
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#F5F9F6",
                          color: "#17362C",
                          fontSize: "10px",
                          lineHeight: "1.4",
                          padding: "7px 10px",
                          textAlign: "justify",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        A contratação corresponde à assessoria para reposicionamento do perfil de crédito: avaliação do perfil, orientação cadastral e documental e planejamento de ações para futuras tentativas de financiamento veicular. A prestadora não concede crédito, não é instituição credora e não garante aprovação.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ESPAÇADOR */}
              <div style={{ height: "6px", backgroundColor: "#FFFFFF" }}></div>

              {/* SEÇÃO 05: VALIDAÇÕES, CONDIÇÕES E CIÊNCIA DO CLIENTE */}
              <div style={{ padding: "0 10px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #A2B9AD" }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#064D38",
                          color: "#FFFFFF",
                          fontWeight: "bold",
                          fontSize: "11px",
                          padding: "5px 8px",
                        }}
                      >
                        05 &nbsp; VALIDAÇÕES, CONDIÇÕES E CIÊNCIA DO CLIENTE
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "#17362C",
                          fontSize: "9.5px",
                          lineHeight: "1.35",
                          padding: "6px 10px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        <strong>SEM GARANTIA DE APROVAÇÃO:</strong> os valores, prazos e parcelas são apenas projeções matemáticas. Não constituem oferta de crédito, análise bancária, pré-aprovação, aprovação ou compromisso de liberação de recursos.
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#F7F9F7",
                          color: "#17362C",
                          fontSize: "9.5px",
                          lineHeight: "1.35",
                          padding: "6px 10px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        <strong>CONDIÇÕES REAIS E CET:</strong> aprovação, limites, prazos, taxas e condições dependem exclusivamente da instituição credora. Se houver oferta, o cliente deverá avaliar o CET (Custo Efetivo Total), IOF, tributos, tarifas, seguros e demais encargos. A hipótese de {taxaCalculo.toFixed(2).replace(".", ",")}% a.m. é somente para simulação, não uma taxa assegurada.
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "#17362C",
                          fontSize: "9.5px",
                          lineHeight: "1.35",
                          padding: "6px 10px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        <strong>VEÍCULO E BENEFÍCIOS:</strong> o veículo indicado serve como referência e pode ser substituído conforme análise posterior. Condições de CDC, primeira parcela, garantias de motor/câmbio, frete e possíveis bônus dependem da instituição credora e de condições específicas de contratação.
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#F7F9F7",
                          color: "#17362C",
                          fontSize: "9.5px",
                          lineHeight: "1.35",
                          padding: "6px 10px",
                          border: "1px solid #A2B9AD",
                        }}
                      >
                        <strong>DECLARAÇÃO DE CIÊNCIA:</strong> compreendo que o investimento indicado remunera serviços de assessoria, sujeitos a contrato próprio, e não a obtenção de financiamento. Reconheço que esta simulação não assegura aprovação nem as parcelas aqui projetadas.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ESPAÇADOR */}
              <div style={{ height: "14px", backgroundColor: "#FFFFFF" }}></div>

              {/* ASSINATURAS */}
              <div style={{ padding: "0 10px 10px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "50%", textAlign: "center", verticalAlign: "bottom", padding: "10px 16px" }}>
                        <div style={{ borderBottom: "1px solid #17362C", width: "80%", margin: "0 auto 6px" }}></div>
                        <strong style={{ fontSize: "10px", color: "#003B2B", letterSpacing: "0.5px" }}>
                          ASSINATURA DO CLIENTE / CIÊNCIA
                        </strong>
                      </td>
                      <td style={{ width: "50%", textAlign: "center", verticalAlign: "bottom", padding: "10px 16px" }}>
                        <div style={{ borderBottom: "1px solid #17362C", width: "80%", margin: "0 auto 6px" }}></div>
                        <strong style={{ fontSize: "10px", color: "#003B2B", letterSpacing: "0.5px" }}>
                          LOCAL E DATA: {fichaData.cidadeData || new Date().toLocaleDateString("pt-BR")}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* RODAPÉ FINAL */}
              <div
                style={{
                  backgroundColor: "#003B2B",
                  color: "#FFFFFF",
                  textAlign: "center",
                  fontSize: "9.5px",
                  padding: "7px 10px",
                  letterSpacing: "0.3px",
                }}
              >
                DOCUMENTO PRIVADO DE ASSESSORIA | Simulação exclusivamente informativa, sem vínculo com instituições financeiras.
              </div>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="form-actions" style={{ marginTop: "1rem" }}>
            <button onClick={handleBackToForm} className="secondary-button" disabled={loading}>
              ← Editar Proposta
            </button>
            <button onClick={handleGeneratePdf} className="auth-submit" disabled={loading}>
              {loading ? "Gerando PDF..." : "Gerar e Baixar PDF Oficial"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
