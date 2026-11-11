import { useState, useEffect } from "react";
import { API_BASE_URL } from "./api/baseUrl";
import MoneyInput from "./MoneyInput";

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export default function SellerClientRegistration() {
  const token = localStorage.getItem("vfcAuthToken") || "";
  const [clienteId, setClienteId] = useState("");
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: "success"|"error", text: string} | null>(null);
  const [form, setForm] = useState({
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
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/clientes`, { headers: { Authorization: `Bearer ${token}` } });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        clienteId: parseInt(clienteId, 10),
        ...form,
        renda: form.renda ? parseFloat(form.renda) : null,
        valorVeiculo: form.valorVeiculo ? parseFloat(form.valorVeiculo) : null,
        valorEntrada: form.valorEntrada ? parseFloat(form.valorEntrada) : null,
        valorFinanciado: form.valorFinanciado ? parseFloat(form.valorFinanciado) : null,
      };

      const res = await fetch(`${API_BASE_URL}/seller-client-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao salvar");

      setMessage({ type: "success", text: "Ficha criada com sucesso!" });
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
      });
      setClienteId("");
    } catch (e) {
      setMessage({ type: "error", text: String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content module-content">
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
            <select value={form.estadoCivil} onChange={(e) => setForm({ ...form, estadoCivil: e.target.value })}>
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
            Renda Mensal
            <div className="money-input-wrapper">
              <MoneyInput
                value={form.renda}
                onChange={(v) => setForm({ ...form, renda: String(v || "") })}
                placeholder="0,00"
              />
            </div>
          </label>
        </div>

        <div className="step-title">
          <span>04</span>
          <div>
            <h3>VALORES DE FINANCIAMENTO</h3>
            <p>Projeção do investimento do cliente</p>
          </div>
        </div>

        <div className="customer-form-grid">
          <label>
            Valor do Veículo
            <div className="money-input-wrapper">
              <MoneyInput
                value={form.valorVeiculo}
                onChange={(v) => setForm({ ...form, valorVeiculo: String(v || "") })}
                placeholder="0,00"
              />
            </div>
          </label>
          <label>
            Valor de Entrada (Investimento)
            <div className="money-input-wrapper">
              <MoneyInput
                value={form.valorEntrada}
                onChange={(v) => setForm({ ...form, valorEntrada: String(v || "") })}
                placeholder="0,00"
              />
            </div>
          </label>
          <label>
            Valor a Financiar
            <div className="money-input-wrapper">
              <MoneyInput
                value={form.valorFinanciado}
                onChange={(v) => setForm({ ...form, valorFinanciado: String(v || "") })}
                placeholder="0,00"
              />
            </div>
          </label>
        </div>

        <button type="submit" disabled={loading || !clienteId} className="auth-submit">
          {loading ? "Salvando..." : "Criar Ficha do Cliente"}
        </button>
      </form>
    </div>
  );
}
