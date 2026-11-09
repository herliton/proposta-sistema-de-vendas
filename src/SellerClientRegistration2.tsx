import { useState, useEffect } from "react";
import { API_BASE_URL } from "./api/baseUrl";

const getAuthToken = () => localStorage.getItem("vfcAuthToken") || "";

export default function SellerClientRegistration2() {
  const [passo, setPasso] = useState(1);
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  const [erro, setErro] = useState("");
  const [mostrarFormNovoCliente, setMostrarFormNovoCliente] = useState(false);
  const [carregandoClientes, setCarregandoClientes] = useState(false);

  const [novoCliente, setNovoCliente] = useState({
    tipoPessoa: "PF",
    nome: "",
    documento: "",
    email: "",
    telefone: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setCarregandoClientes(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setErro("Token de autenticação não encontrado");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClientes(Array.isArray(data) ? data : data.data || []);
      } else {
        setErro(`Erro ao carregar clientes: ${res.status}`);
      }
    } catch (e) {
      setErro("Erro ao carregar clientes: " + String(e));
    } finally {
      setCarregandoClientes(false);
    }
  };

  const validarFormulario = () => {
    if (!novoCliente.nome.trim()) return "Nome é obrigatório";
    if (!novoCliente.documento.trim()) return "Documento é obrigatório";
    if (!novoCliente.telefone.trim()) return "Telefone é obrigatório";
    if (!novoCliente.cep.trim()) return "CEP é obrigatório";
    if (!novoCliente.logradouro.trim()) return "Logradouro é obrigatório";
    if (!novoCliente.numero.trim()) return "Número é obrigatório";
    if (!novoCliente.bairro.trim()) return "Bairro é obrigatório";
    if (!novoCliente.cidade.trim()) return "Cidade é obrigatória";
    if (!novoCliente.estado.trim() || novoCliente.estado.length !== 2) return "Estado (2 letras) é obrigatório";
    return "";
  };

  const handleCriarCliente = async () => {
    const validacao = validarFormulario();
    if (validacao) {
      setErro(validacao);
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        setErro("Token de autenticação não encontrado");
        return;
      }

      const payload = {
        tipoPessoa: novoCliente.tipoPessoa,
        nome: novoCliente.nome,
        documento: novoCliente.documento,
        email: novoCliente.email || null,
        telefone: novoCliente.telefone,
        cep: novoCliente.cep,
        logradouro: novoCliente.logradouro,
        numero: novoCliente.numero,
        complemento: novoCliente.complemento || null,
        bairro: novoCliente.bairro,
        cidade: novoCliente.cidade,
        estado: novoCliente.estado.toUpperCase(),
      };

      const res = await fetch(`${API_BASE_URL}/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setErro(data.error || data.message || "Erro ao criar cliente");
        return;
      }

      const novoClienteData = await res.json();
      setClienteSelecionado(novoClienteData);
      setMostrarFormNovoCliente(false);
      setNovoCliente({
        tipoPessoa: "PF",
        nome: "",
        documento: "",
        email: "",
        telefone: "",
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
      });
      setErro("");
      setPasso(2);
    } catch (e) {
      setErro("Erro ao criar cliente: " + String(e));
    }
  };

  return (
    <div className="content module-content">
      <section className="module-heading">
        <div>
          <p>CAPTAÇÃO DE CLIENTES</p>
          <h1>Ficha do Cliente</h1>
          <span>Preencha os dados para disponibilização em Recuperação de Crédito.</span>
        </div>
      </section>

      {erro && (
        <div className="panel form-panel notice-error">
          {erro}
        </div>
      )}

      {passo === 1 && (
        <div className="panel form-panel">
          <div className="step-title">
            <span>01</span>
            <div>
              <h3>SELECIONE OU CRIE UM CLIENTE</h3>
              <p>Escolha um cliente existente ou cadastre um novo</p>
            </div>
          </div>

          {carregandoClientes ? (
            <p>Carregando clientes...</p>
          ) : (
            <>
              {clientes.length > 0 && !mostrarFormNovoCliente && (
                <div className="customer-form-grid">
                  <label>
                    Clientes Existentes
                    <select
                      onChange={(e) => {
                        const c = clientes.find((x) => x.id === parseInt(e.target.value, 10));
                        if (c) {
                          setClienteSelecionado(c);
                          setPasso(2);
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Selecione um cliente...</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome} - {c.documento}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {!mostrarFormNovoCliente && (
                <button
                  type="button"
                  onClick={() => setMostrarFormNovoCliente(true)}
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                >
                  + Novo Cliente
                </button>
              )}

              {mostrarFormNovoCliente && (
                <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid #ddd" }}>
                  <h4>Criar Novo Cliente</h4>
                  <div className="customer-form-grid">
                    <label>
                      Tipo de Pessoa *
                      <select
                        value={novoCliente.tipoPessoa}
                        onChange={(e) =>
                          setNovoCliente({ ...novoCliente, tipoPessoa: e.target.value })
                        }
                      >
                        <option value="PF">Pessoa Física</option>
                        <option value="PJ">Pessoa Jurídica</option>
                      </select>
                    </label>

                    <label>
                      Nome Completo *
                      <input
                        type="text"
                        value={novoCliente.nome}
                        onChange={(e) =>
                          setNovoCliente({ ...novoCliente, nome: e.target.value })
                        }
                        placeholder="Nome ou Razão Social"
                      />
                    </label>

                    <label>
                      Documento (CPF/CNPJ) *
                      <input
                        type="text"
                        value={novoCliente.documento}
                        onChange={(e) =>
                          setNovoCliente({ ...novoCliente, documento: e.target.value })
                        }
                        placeholder="Apenas números"
                      />
                    </label>

                    <label>
                      Email
                      <input
                        type="email"
                        value={novoCliente.email}
                        onChange={(e) =>
                          setNovoCliente({ ...novoCliente, email: e.target.value })
                        }
                        placeholder="email@example.com"
                      />
                    </label>

                    <label>
                      Telefone *
                      <input
                        type="text"
                        value={novoCliente.telefone}
                        onChange={(e) =>
                          setNovoCliente({ ...novoCliente, telefone: e.target.value })
                        }
                        placeholder="(11) 99999-9999"
                      />
                    </label>

                    <label>
                      CEP *
                      <input
                        type="text"
                        value={novoCliente.cep}
                        onChange={(e) =>
                          setNovoCliente({ ...novoCliente, cep: e.target.value })
                        }
                        placeholder="12345-678 ou 12345678"
                      />
                    </label>

                    <label>
                      Logradouro (Rua/Avenida) *
                      <input
                        type="text"
                        value={novoCliente.logradouro}
                        onChange={(e) =>
                          setNovoCliente({ ...novoCliente, logradouro: e.target.value })
                        }
                        placeholder="Rua, Avenida, etc"
                      />
                    </label>

                    <label>
                      Número *
                      <input
                        type="text"
                        value={novoCliente.numero}
                        onChange={(e) =>
                          setNovoCliente({ ...novoCliente, numero: e.target.value })
                        }
                        placeholder="Número"
                      />
                    </label>

                    <label>
                      Complemento
                      <input
                        type="text"
                        value={novoCliente.complemento}
                        onChange={(e) =>
                          setNovoCliente({ ...novoCliente, complemento: e.target.value })
                        }
                        placeholder="Apto, sala, etc (opcional)"
                      />
                    </label>

                    <label>
                      Bairro *
                      <input
                        type="text"
                        value={novoCliente.bairro}
                        onChange={(e) =>
                          setNovoCliente({ ...novoCliente, bairro: e.target.value })
                        }
                        placeholder="Bairro"
                      />
                    </label>

                    <label>
                      Cidade *
                      <input
                        type="text"
                        value={novoCliente.cidade}
                        onChange={(e) =>
                          setNovoCliente({ ...novoCliente, cidade: e.target.value })
                        }
                        placeholder="Cidade"
                      />
                    </label>

                    <label>
                      Estado (UF) *
                      <input
                        type="text"
                        value={novoCliente.estado}
                        onChange={(e) =>
                          setNovoCliente({
                            ...novoCliente,
                            estado: e.target.value.slice(0, 2).toUpperCase(),
                          })
                        }
                        placeholder="SP, RJ, MG, etc"
                        maxLength={2}
                      />
                    </label>
                  </div>

                  <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                    <button
                      type="button"
                      onClick={handleCriarCliente}
                      className="btn btn-primary"
                    >
                      Salvar Cliente
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarFormNovoCliente(false);
                        setErro("");
                      }}
                      className="btn"
                      style={{ background: "#999" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {passo === 2 && clienteSelecionado && (
        <div className="panel form-panel">
          <div className="step-title">
            <span>02</span>
            <div>
              <h3>DADOS DO CLIENTE SELECIONADO</h3>
              <p>{clienteSelecionado.nome}</p>
            </div>
          </div>
          <p style={{ color: "#666", marginTop: "1rem" }}>
            Cliente {clienteSelecionado.nome} selecionado com sucesso!
          </p>
          <p>Próximas etapas de preenchimento da Ficha virão aqui...</p>
          <button
            type="button"
            onClick={() => {
              setPasso(1);
              setClienteSelecionado(null);
            }}
            className="btn"
            style={{ marginTop: "1rem" }}
          >
            ← Voltar
          </button>
        </div>
      )}
    </div>
  );
}
