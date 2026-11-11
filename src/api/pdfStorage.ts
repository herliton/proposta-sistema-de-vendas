import { API_BASE_URL } from "./baseUrl";
import type jsPDF from "jspdf";

export type PdfStorageResult = {
  success: boolean;
  pdfId?: string;
  fileName?: string;
  message: string;
  emailSent?: boolean;
};

/**
 * Salva o PDF no servidor local (/uploads/fichas)
 * @param pdf - Objeto jsPDF já gerado
 * @param clienteNome - Nome do cliente para nomear o arquivo
 * @param clienteEmail - Email do cliente para enviar cópia
 * @param authToken - Token de autenticação
 * @returns Resultado da operação
 */
export const savePdfToServer = async (
  pdf: jsPDF,
  clienteNome: string,
  clienteEmail: string,
  authToken: string
): Promise<PdfStorageResult> => {
  try {
    const pdfBlob = pdf.output("blob");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const fileName = `ficha-${clienteNome.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.pdf`;

    const formData = new FormData();
    formData.append("file", pdfBlob, fileName);
    formData.append("clienteNome", clienteNome);
    formData.append("clienteEmail", clienteEmail);

    const response = await fetch(`${API_BASE_URL}/fichas/upload-pdf`, {
      method: "POST",
      headers: {
        Authorization: `****** `,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.message || "Erro ao salvar PDF no servidor",
      };
    }

    const result = await response.json();
    return {
      success: true,
      pdfId: result.data?.pdfId,
      fileName: result.data?.fileName || fileName,
      message: "PDF salvo com sucesso no servidor",
      emailSent: result.data?.emailSent || false,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao salvar PDF: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
};

/**
 * Baixa um PDF específico do servidor
 * @param pdfId - ID do PDF a ser baixado
 * @param authToken - Token de autenticação
 */
export const downloadPdfFromServer = async (pdfId: string, authToken: string): Promise<Blob | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fichas/download-pdf/${pdfId}`, {
      method: "GET",
      headers: {
        Authorization: `****** `,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao baixar PDF");
    }

    return await response.blob();
  } catch (error) {
    console.error("Erro ao baixar PDF:", error);
    return null;
  }
};

/**
 * Lista todos os PDFs salvos do cliente
 * @param clienteId - ID do cliente
 * @param authToken - Token de autenticação
 */
export const listClientPdfs = async (clienteId: number, authToken: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fichas/pdfs/${clienteId}`, {
      method: "GET",
      headers: {
        Authorization: `****** `,
      },
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Erro ao listar PDFs:", error);
    return [];
  }
};

/**
 * Envia email com o PDF anexado
 * @param pdfId - ID do PDF já salvo no servidor
 * @param destinatario - Email do destinatário
 * @param authToken - Token de autenticação
 */
export const sendPdfByEmail = async (pdfId: string, destinatario: string, authToken: string): Promise<PdfStorageResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fichas/email-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `****** `,
      },
      body: JSON.stringify({
        pdfId,
        destinatario,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.message || "Erro ao enviar email",
      };
    }

    return {
      success: true,
      message: "Email enviado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao enviar email: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
};

/**
 * Deleta um PDF do servidor
 * @param pdfId - ID do PDF a ser deletado
 * @param authToken - Token de autenticação
 */
export const deletePdfFromServer = async (pdfId: string, authToken: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fichas/pdf/${pdfId}`, {
      method: "DELETE",
      headers: {
        Authorization: `****** `,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Erro ao deletar PDF:", error);
    return false;
  }
};
