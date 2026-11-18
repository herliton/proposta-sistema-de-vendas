import { API_BASE_URL } from "./baseUrl";

/**
 * Tipos de resposta da API de Fichas
 */
export type FichaResponse = {
  success: boolean;
  fichaId?: number;
  pdfId?: string;
  fileName?: string;
  message: string;
  data?: any;
};

/**
 * Dados da Ficha para envio ao backend
 */
export type FichaDados = {
  clienteId: number;
  // Contato
  telefoneFixo: string;
  telefoneCelular: string;
  whatsapp: string;
  // Pessoal
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  // Residência
  residenciaTipo: string;
  tempoResidencia: string;
  // Profissional
  empresaNome: string;
  cargoFuncao: string;
  classificacaoTrabalho: string;
  renda: string;
  // Financiamento
  valorVeiculo: string;
  valorEntrada: string;
  valorFinanciado: string;
  taxaMensal: string;
  marcaModelo?: string;
  anoVeiculo?: string;
  valorFipe?: string;
  cidadeData?: string;
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

/**
 * Salva a ficha no backend
 * POST /fichas
 */
export const saveFichaToBackend = async (
  dados: FichaDados,
  authToken: string
): Promise<FichaResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fichas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.message || "Erro ao salvar ficha",
      };
    }

    const result = await response.json();
    return {
      success: true,
      fichaId: result.data?.id,
      message: "Ficha salva com sucesso no backend",
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao salvar ficha: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
};

/**
 * Atualiza a ficha no backend
 * PUT /fichas/:fichaId
 */
export const updateFichaOnBackend = async (
  fichaId: number,
  dados: Partial<FichaDados>,
  authToken: string
): Promise<FichaResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fichas/${fichaId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.message || "Erro ao atualizar ficha",
      };
    }

    const result = await response.json();
    return {
      success: true,
      fichaId: result.data?.id,
      message: "Ficha atualizada com sucesso",
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao atualizar ficha: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
};

/**
 * Recupera uma ficha do backend
 * GET /fichas/:fichaId
 */
export const getFichaFromBackend = async (
  fichaId: number,
  authToken: string
): Promise<FichaResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fichas/${fichaId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Ficha não encontrada",
      };
    }

    const result = await response.json();
    return {
      success: true,
      fichaId: result.data?.id,
      message: "Ficha recuperada com sucesso",
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao recuperar ficha: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
};

/**
 * Lista todas as fichas de um cliente
 * GET /fichas/cliente/:clienteId
 */
export const listClientFichas = async (
  clienteId: number,
  authToken: string
): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fichas/cliente/${clienteId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Erro ao listar fichas:", error);
    return [];
  }
};

/**
 * Deleta uma ficha do backend
 * DELETE /fichas/:fichaId
 */
export const deleteFichaFromBackend = async (
  fichaId: number,
  authToken: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fichas/${fichaId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Erro ao deletar ficha:", error);
    return false;
  }
};

/**
 * Persiste a ficha E o PDF no backend
 * POST /fichas/persist-with-pdf
 * Combines ficha save + PDF upload in one request
 */
export const persistFichaWithPdf = async (
  fichaData: FichaDados,
  pdfBlob: Blob,
  fileName: string,
  authToken: string
): Promise<FichaResponse> => {
  try {
    const formData = new FormData();
    formData.append("ficha", JSON.stringify(fichaData));
    formData.append("pdf", pdfBlob, fileName);

    const response = await fetch(`${API_BASE_URL}/fichas/persist-with-pdf`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.message || "Erro ao persistir ficha com PDF",
      };
    }

    const result = await response.json();
    return {
      success: true,
      fichaId: result.data?.fichaId,
      pdfId: result.data?.pdfId,
      fileName: result.data?.fileName,
      message: "Ficha e PDF salvos com sucesso",
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao persistir ficha: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
};

/**
 * Envia email com a ficha (com PDF ou link)
 * POST /fichas/:fichaId/send-email
 */
export const sendFichaByEmail = async (
  fichaId: number,
  destinatario: string,
  incluirPdf: boolean = true,
  authToken: string
): Promise<FichaResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fichas/${fichaId}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        destinatario,
        incluirPdf,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.message || "Erro ao enviar email",
      };
    }

    const result = await response.json();
    return {
      success: true,
      message: "Email enviado com sucesso",
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao enviar email: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
};

/**
 * Gera estatísticas de fichas
 * GET /fichas/stats
 */
export const getFichasStats = async (
  authToken: string
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fichas/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error("Erro ao recuperar estatísticas:", error);
    return null;
  }
};
