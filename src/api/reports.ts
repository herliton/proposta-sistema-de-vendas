import { toApiDate, type DateRange } from "../utils/dateRange";
import { API_BASE_URL } from "./baseUrl";

export async function downloadCommissionReport(range: DateRange, authToken: string) {
  const query = new URLSearchParams({
    startDate: toApiDate(range.startDate),
    endDate: toApiDate(range.endDate),
  });
  const response = await fetch(`${API_BASE_URL}/reports/commissions.pdf?${query}`, { headers: { Authorization: `Bearer ${authToken}` } });

  if (!response.ok) {
    throw new Error("Não foi possível gerar o relatório no servidor.");
  }

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = `comissoes-${toApiDate(range.startDate)}-${toApiDate(range.endDate)}.pdf`;
  anchor.click();
  URL.revokeObjectURL(downloadUrl);
}
