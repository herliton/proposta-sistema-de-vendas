import PDFDocument from 'pdfkit';

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

const formatMoney = (value) => {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const addTitle = (doc, title) => {
  doc.fontSize(14).font('Helvetica-Bold').text(title, { underline: false }).moveDown(0.3);
};

const addSectionHeader = (doc, title) => {
  doc.fontSize(11).font('Helvetica-Bold').text(title).moveDown(0.2);
};

const addLabel = (doc, label, value) => {
  doc.fontSize(10).font('Helvetica-Bold').text(label, { continued: true }).font('Helvetica').text(`: ${value || '—'}`).moveDown(0.15);
};

const addParagraph = (doc, text) => {
  doc.fontSize(9).font('Helvetica').text(text, { align: 'justify' }).moveDown(0.2);
};

export const generateSellerFichaPdf = (ficha) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // TEXTO INTRODUTÓRIO
      addParagraph(
        doc,
        'SIMULAÇÃO ENUNCIATIVA — O reposicionamento do perfil de crédito vai tratar de buscar junto ao cliente tal condição de expectativa do cliente, não garantindo as projeções automáticas, pois as ações ficam a dever do cliente e das instituições credoras consultadas.'
      );
      doc.moveDown(0.3);

      // SEÇÃO 01 - INFORMAÇÕES DO CLIENTE
      addSectionHeader(doc, '01   INFORMAÇÕES DO CLIENTE');
      addLabel(doc, 'Nome', ficha.cliente?.nome);
      addLabel(doc, 'CPF/CNPJ', ficha.cliente?.documento);
      addLabel(doc, 'Telefone', ficha.telefoneCelular || ficha.telefoneFixo || '—');
      addLabel(doc, 'Data de Nascimento', formatDate(ficha.dataNascimento));
      doc.moveDown(0.3);

      // SEÇÃO 02 - ENDEREÇO
      addSectionHeader(doc, '02   ENDEREÇO');
      addLabel(doc, 'Rua', ficha.cliente?.logradouro);
      addLabel(doc, 'Número', ficha.cliente?.numero);
      addLabel(doc, 'CEP', ficha.cliente?.cep);
      addLabel(doc, 'Cidade', `${ficha.cliente?.cidade}/${ficha.cliente?.estado}`);
      doc.moveDown(0.3);

      // SEÇÃO 03 - INFORMAÇÕES PROFISSIONAIS
      addSectionHeader(doc, '03   INFORMAÇÕES PROFISSIONAIS');
      addLabel(doc, 'Empresa', ficha.empresaNome);
      addLabel(doc, 'Cargo', ficha.cargoFuncao);
      addLabel(doc, 'Renda Mensal', formatMoney(ficha.renda));
      doc.moveDown(0.3);

      // SEÇÃO 04 - OPÇÕES DE VEÍCULOS
      addSectionHeader(doc, '04   OPÇÕES DE VEÍCULOS');
      if (ficha.opcoes && ficha.opcoes.length > 0) {
        ficha.opcoes.forEach((opcao, idx) => {
          doc.fontSize(10).font('Helvetica-Bold').text(`Opção ${idx + 1}:`).moveDown(0.1);
          addLabel(doc, '  Marca/Modelo', `${opcao.marca} ${opcao.modelo}`);
          addLabel(doc, '  Ano', opcao.anoModelo);
          addLabel(doc, '  Valor', formatMoney(ficha.valorVeiculo));
          if (opcao.parcelas && opcao.parcelas.length > 0) {
            doc.fontSize(9).font('Helvetica').text('  Prazos disponíveis:').moveDown(0.05);
            opcao.parcelas.forEach((p) => {
              doc.text(`    ${p.quantidade}x: R$ ${parseFloat(p.parcelaMinima).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - R$ ${parseFloat(p.parcelaMaxima).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).moveDown(0.05);
            });
          }
          doc.moveDown(0.15);
        });
      } else {
        doc.fontSize(9).font('Helvetica').text('Nenhuma opção de veículo registrada.').moveDown(0.3);
      }

      // SEÇÃO 05 - PROJEÇÕES AUTOMÁTICAS DE PARCELAS
      addSectionHeader(doc, '05   PROJEÇÕES AUTOMÁTICAS DE PARCELAS');
      if (ficha.opcoes && ficha.opcoes.length > 0) {
        ficha.opcoes.forEach((opcao, idx) => {
          if (opcao.parcelas && opcao.parcelas.length > 0) {
            doc.fontSize(9).font('Helvetica-Bold').text(`Opção ${idx + 1}: ${opcao.marca} ${opcao.modelo}`).moveDown(0.1);
            opcao.parcelas.forEach((p) => {
              const jurosEstimados = (parseFloat(p.parcelaMaxima) * p.quantidade) - parseFloat(ficha.valorFinanciado || 0);
              doc.fontSize(8).font('Helvetica').text(
                `${p.quantidade}x | Parcela: R$ ${parseFloat(p.parcelaMinima).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - R$ ${parseFloat(p.parcelaMaxima).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Juros est.: 1,70% a.m.`,
                { continued: true }
              );
              doc.moveDown(0.05);
            });
            doc.moveDown(0.1);
          }
        });
      }

      addParagraph(
        doc,
        'Critério matemático: sistema Price, hipótese de 1,70% a.m. • Não inclui IOF, seguros, tarifas nem demais componentes do CET. SUJEITO Á ANALISE DE CREDITO*'
      );
      addLabel(doc, 'Valor de Investimento na Proposta', formatMoney(ficha.valorEntrada));
      doc.moveDown(0.3);

      // PÁGINA NOVA
      doc.addPage();

      // SEÇÃO 06 - OBJETO DA PRESTAÇÃO DE SERVIÇOS
      addSectionHeader(doc, '06   OBJETO DA PRESTAÇÃO DE SERVIÇOS');
      addParagraph(
        doc,
        'A contratação corresponde à assessoria para reposicionamento do perfil de crédito: avaliação do perfil, orientação cadastral e documental e planejamento de ações para futuras tentativas de financiamento veicular. A prestadora não concede crédito, não é instituição credora e não garante aprovação.'
      );
      doc.moveDown(0.3);

      // SEÇÃO 07 - VALIDAÇÕES, CONDIÇÕES E CIÊNCIA DO CLIENTE
      addSectionHeader(doc, '07   VALIDAÇÕES, CONDIÇÕES E CIÊNCIA DO CLIENTE');

      // Texto 1
      addParagraph(
        doc,
        'SEM GARANTIA DE APROVAÇÃO: os valores, prazos e parcelas são apenas projeções matemáticas. Não constituem oferta de crédito, análise bancária, pré-aprovação, aprovação ou compromisso de liberação de recursos.'
      );

      // Texto 2
      addParagraph(
        doc,
        'CONDIÇÕES REAIS E CET: aprovação, limites, prazos, taxas e condições dependem exclusivamente da instituição credora. Se houver oferta, o cliente deverá avaliar o CET (Custo Efetivo Total), IOF, tributos, tarifas, seguros e demais encargos. A hipótese de 1,70% a.m. é somente para simulação, não uma taxa assegurada.'
      );

      // Texto 3
      addParagraph(
        doc,
        'VEÍCULO E BENEFÍCIOS: o veículo indicado serve como referência e pode ser substituído conforme análise posterior. Condições de CDC, primeira parcela, garantias de motor/câmbio, frete e possíveis bônus dependem da instituição credora e de condições específicas de contratação.'
      );

      // Texto 4
      addParagraph(
        doc,
        'DECLARAÇÃO DE CIÊNCIA: compreendo que o investimento indicado remunera serviços de assessoria, sujeitos a contrato próprio, e não a obtenção de financiamento. Reconheço que esta simulação não assegura aprovação nem as parcelas aqui projetadas.'
      );

      doc.moveDown(0.5);

      // ASSINATURAS
      doc.fontSize(10).font('Helvetica-Bold').text('ASSINATURAS');
      doc.moveDown(0.3);

      doc.fontSize(9).font('Helvetica').text('Cliente:', { continued: true }).text(`  ________________________  Data: ____ / ____ / ______`).moveDown(0.3);
      doc.text(`Nome: ${ficha.cliente?.nome || '________________________________'}`).moveDown(0.5);

      doc.fontSize(9).font('Helvetica').text('Loja:', { continued: true }).text(`  ________________________  Data: ____ / ____ / ______`).moveDown(0.3);
      doc.text(`Nome: ${ficha.loja?.nome || '________________________________'}`).moveDown(0.5);

      doc.fontSize(8).font('Helvetica').text(`Gerado em: ${new Date().toLocaleString('pt-BR')} | Ficha ID: ${ficha.id}`, { align: 'center', color: '#999999' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
