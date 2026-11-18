import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateFichaPdf = async (data: any, htmlElementId: string) => {
  const element = document.getElementById(htmlElementId);
  if (!element) {
    throw new Error('Elemento HTML não encontrado');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 10;

  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
  heightLeft -= pageHeight - 20;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return pdf;
};

export const calcularSimulacoes = (valorFinanciado: number, taxaMensal: number, customPrazos?: number[]) => {
  const prazos = customPrazos || [24, 36, 48, 60];
  const simulacoes = prazos.map((parcelas) => {
    const taxaDecimal = taxaMensal / 100;
    const numerador = valorFinanciado * taxaDecimal * Math.pow(1 + taxaDecimal, parcelas);
    const denominador = Math.pow(1 + taxaDecimal, parcelas) - 1;
    const valorParcela = numerador / denominador;
    const totalParcelas = valorParcela * parcelas;
    const jurosEstimados = totalParcelas - valorFinanciado;

    return {
      parcelas,
      valorParcela: Number(valorParcela.toFixed(2)),
      totalParcelas: Number(totalParcelas.toFixed(2)),
      jurosEstimados: Number(jurosEstimados.toFixed(2)),
    };
  });

  return simulacoes;
};
