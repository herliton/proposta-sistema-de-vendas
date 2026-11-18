import { prisma } from '../config/database.js';
import { ok, created, notFound, badRequest, serverError } from '../utils/response.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { sendEmail } from '../services/emailService.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(currentDir, '..', '..', 'uploads', 'fichas', 'pdfs');

/**
 * POST /fichas
 * Criar uma nova ficha
 */
export const createFicha = async (req, res) => {
  try {
    const lojaId = req.user?.lojaId ?? 1;
    const vendedorId = req.user?.id;

    const {
      clienteId,
      telefoneFixo,
      telefoneCelular,
      whatsapp,
      dataNascimento,
      sexo,
      estadoCivil,
      residenciaTipo,
      tempoResidencia,
      empresaNome,
      cargoFuncao,
      classificacaoTrabalho,
      renda,
      valorVeiculo,
      valorEntrada,
      valorFinanciado,
      taxaMensal,
      marcaModelo,
      anoVeiculo,
      valorFipe,
      garantiaEstendida,
      garantiaEstendidaValor,
      seguroVeiculo,
      seguroVeiculoValor,
      protecaoFinanceira,
      protecaoFinanceiraValor,
      rastreamentoGps,
      rastreamentoGpsValor,
      assessoriaJuridica,
      assessoriaJuridicaValor,
    } = req.body;

    // Validações obrigatórias
    if (!clienteId) return badRequest(res, 'clienteId é obrigatório');

    // Verificar se cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente || cliente.lojaId !== lojaId) {
      return notFound(res, 'Cliente não encontrado');
    }

    // Verificar se já existe uma ficha em aberto para esse cliente
    let ficha = await prisma.fichaRecuperacao.findFirst({
      where: { clienteId, lojaId, status: { in: ['ABERTA', 'EM_ANDAMENTO'] } },
      orderBy: { id: 'desc' },
    });

    if (ficha) {
      // Atualizar a ficha existente com os novos dados
      ficha = await prisma.fichaRecuperacao.update({
        where: { id: ficha.id },
        data: {
          vendedorId: vendedorId || ficha.vendedorId,
          telefoneFixo: telefoneFixo ?? ficha.telefoneFixo,
          telefoneCelular: telefoneCelular ?? ficha.telefoneCelular,
          whatsapp: whatsapp ?? ficha.whatsapp,
          dataNascimento: dataNascimento ? new Date(dataNascimento) : ficha.dataNascimento,
          sexo: sexo ?? ficha.sexo,
          estadoCivil: estadoCivil ?? ficha.estadoCivil,
          residenciaTipo: residenciaTipo ?? ficha.residenciaTipo,
          tempoResidencia: tempoResidencia ?? ficha.tempoResidencia,
          empresaNome: empresaNome ?? ficha.empresaNome,
          cargoFuncao: cargoFuncao ?? ficha.cargoFuncao,
          classificacaoTrabalho: classificacaoTrabalho ?? ficha.classificacaoTrabalho,
          renda: renda ? parseFloat(renda) : ficha.renda,
          valorVeiculo: valorVeiculo ? parseFloat(valorVeiculo) : ficha.valorVeiculo,
          valorEntrada: valorEntrada ? parseFloat(valorEntrada) : ficha.valorEntrada,
          valorFinanciado: valorFinanciado ? parseFloat(valorFinanciado) : ficha.valorFinanciado,
        },
        include: {
          cliente: true,
          opcoes: true,
        },
      });

      if (marcaModelo) {
        await prisma.fichaOpcaoVeiculo.deleteMany({ where: { fichaId: ficha.id } });
        await prisma.fichaOpcaoVeiculo.create({
          data: {
            fichaId: ficha.id,
            ordem: 1,
            marca: marcaModelo.trim().split(' ')[0] || 'Veículo',
            modelo: marcaModelo.trim(),
            anoModelo: anoVeiculo ? parseInt(anoVeiculo, 10) : null,
          },
        });
      }

      return ok(res, {
        id: ficha.id,
        clienteId: ficha.clienteId,
        createdAt: ficha.dataEntradaFicha,
      }, 'Ficha atualizada com sucesso');
    }

    // Caso não exista ficha em aberto, garantir oportunidade de crédito sem ficha vinculada
    let oportunidade = await prisma.oportunidadeCredito.findFirst({
      where: {
        clienteId,
        status: { in: ['ABERTA', 'EM_ANDAMENTO'] },
        ficha: null,
      },
    });
    if (!oportunidade) {
      oportunidade = await prisma.oportunidadeCredito.create({
        data: {
          clienteId,
          lojaId,
          responsavelId: vendedorId,
          tipo: 'REANALISE_CREDITO',
          status: 'ABERTA',
          motivo: 'Captação inicial realizada pelo vendedor via Ficha do Cliente',
          observacoes: `Veículo pretendido: ${valorVeiculo ? 'R$ ' + valorVeiculo : 'A definir'}. Entrada: ${valorEntrada ? 'R$ ' + valorEntrada : '0'}. Financiado: ${valorFinanciado ? 'R$ ' + valorFinanciado : '0'}.`,
        },
      });
    }

    // Criar nova ficha
    ficha = await prisma.fichaRecuperacao.create({
      data: {
        lojaId,
        clienteId,
        vendedorId,
        oportunidadeId: oportunidade.id,
        status: 'ABERTA',
        telefoneFixo,
        telefoneCelular,
        whatsapp,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        sexo,
        estadoCivil,
        residenciaTipo,
        tempoResidencia,
        empresaNome,
        cargoFuncao,
        classificacaoTrabalho,
        renda: renda ? parseFloat(renda) : null,
        // Financiamento
        valorVeiculo: valorVeiculo ? parseFloat(valorVeiculo) : null,
        valorEntrada: valorEntrada ? parseFloat(valorEntrada) : null,
        valorFinanciado: valorFinanciado ? parseFloat(valorFinanciado) : null,
        opcoes: marcaModelo ? {
          create: [{
            ordem: 1,
            marca: marcaModelo.trim().split(' ')[0] || 'Veículo',
            modelo: marcaModelo.trim(),
            anoModelo: anoVeiculo ? parseInt(anoVeiculo, 10) : null,
          }],
        } : undefined,
      },
      include: {
        cliente: true,
        opcoes: true,
      },
    });

    return created(res, {
      id: ficha.id,
      clienteId: ficha.clienteId,
      createdAt: ficha.dataEntradaFicha,
    }, 'Ficha salva com sucesso');
  } catch (error) {
    console.error('Erro ao criar ficha:', error);
    return serverError(res, error.message);
  }
};

/**
 * PUT /fichas/:fichaId
 * Atualizar ficha existente
 */
export const updateFicha = async (req, res) => {
  try {
    const lojaId = req.user?.lojaId ?? 1;
    const { fichaId } = req.params;

    const {
      telefoneFixo,
      telefoneCelular,
      whatsapp,
      dataNascimento,
      sexo,
      estadoCivil,
      residenciaTipo,
      tempoResidencia,
      empresaNome,
      cargoFuncao,
      classificacaoTrabalho,
      renda,
      valorVeiculo,
      valorEntrada,
      valorFinanciado,
      taxaMensal,
      marcaModelo,
      anoVeiculo,
      valorFipe,
      garantiaEstendida,
      garantiaEstendidaValor,
      seguroVeiculo,
      seguroVeiculoValor,
      protecaoFinanceira,
      protecaoFinanceiraValor,
      rastreamentoGps,
      rastreamentoGpsValor,
      assessoriaJuridica,
      assessoriaJuridicaValor,
    } = req.body;

    // Verificar se ficha existe
    const fichaExistente = await prisma.fichaRecuperacao.findFirst({
      where: {
        id: parseInt(fichaId, 10),
        lojaId,
      },
    });

    if (!fichaExistente) {
      return notFound(res, 'Ficha não encontrada');
    }

    // Atualizar ficha
    const fichaAtualizada = await prisma.fichaRecuperacao.update({
      where: { id: parseInt(fichaId, 10) },
      data: {
        telefoneFixo,
        telefoneCelular,
        whatsapp,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
        sexo,
        estadoCivil,
        residenciaTipo,
        tempoResidencia,
        empresaNome,
        cargoFuncao,
        classificacaoTrabalho,
        renda: renda ? parseFloat(renda) : undefined,
        valorVeiculo: valorVeiculo ? parseFloat(valorVeiculo) : undefined,
        valorEntrada: valorEntrada ? parseFloat(valorEntrada) : undefined,
        valorFinanciado: valorFinanciado ? parseFloat(valorFinanciado) : undefined,
      },
      include: {
        cliente: true,
      },
    });

    return ok(res, fichaAtualizada, 'Ficha atualizada com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar ficha:', error);
    return serverError(res, error.message);
  }
};

/**
 * GET /fichas/:fichaId
 * Recuperar uma ficha específica
 */
export const getFicha = async (req, res) => {
  try {
    const lojaId = req.user?.lojaId ?? 1;
    const { fichaId } = req.params;

    const ficha = await prisma.fichaRecuperacao.findFirst({
      where: {
        id: parseInt(fichaId, 10),
        lojaId,
      },
      include: {
        cliente: true,
        vendedor: true,
      },
    });

    if (!ficha) {
      return notFound(res, 'Ficha não encontrada');
    }

    return ok(res, ficha, 'Ficha recuperada com sucesso');
  } catch (error) {
    console.error('Erro ao recuperar ficha:', error);
    return serverError(res, error.message);
  }
};

/**
 * GET /fichas/cliente/:clienteId
 * Listar todas as fichas de um cliente
 */
export const listClientFichas = async (req, res) => {
  try {
    const lojaId = req.user?.lojaId ?? 1;
    const { clienteId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [fichas, total] = await Promise.all([
      prisma.fichaRecuperacao.findMany({
        where: {
          lojaId,
          clienteId: parseInt(clienteId, 10),
        },
        include: {
          cliente: true,
          vendedor: true,
        },
        orderBy: { dataEntradaFicha: 'desc' },
        take: limitNum,
        skip,
      }),
      prisma.fichaRecuperacao.count({
        where: {
          lojaId,
          clienteId: parseInt(clienteId, 10),
        },
      }),
    ]);

    return ok(res, {
      fichas,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }, 'Fichas recuperadas com sucesso');
  } catch (error) {
    console.error('Erro ao listar fichas:', error);
    return serverError(res, error.message);
  }
};

/**
 * DELETE /fichas/:fichaId
 * Deletar uma ficha
 */
export const deleteFicha = async (req, res) => {
  try {
    const lojaId = req.user?.lojaId ?? 1;
    const { fichaId } = req.params;

    // Verificar se ficha existe
    const ficha = await prisma.fichaRecuperacao.findFirst({
      where: {
        id: parseInt(fichaId, 10),
        lojaId,
      },
    });

    if (!ficha) {
      return notFound(res, 'Ficha não encontrada');
    }

    // Deletar ficha
    await prisma.fichaRecuperacao.delete({
      where: { id: parseInt(fichaId, 10) },
    });

    return ok(res, null, 'Ficha deletada com sucesso');
  } catch (error) {
    console.error('Erro ao deletar ficha:', error);
    return serverError(res, error.message);
  }
};

/**
 * POST /fichas/upload-pdf
 * Upload de PDF
 */
export const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return badRequest(res, 'Arquivo PDF é obrigatório');
    }

    const { clienteNome, clienteEmail } = req.body;

    // Criar diretório se não existir
    await fs.mkdir(uploadsDir, { recursive: true });

    // Gerar nome único para o arquivo
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedName = clienteNome?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'ficha';
    const fileName = `ficha-${sanitizedName}-${timestamp}-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    // Salvar arquivo
    await fs.writeFile(filePath, req.file.buffer);

    // Enviar email se fornecido
    let emailSent = false;
    if (clienteEmail) {
      try {
        await sendEmail({
          to: clienteEmail,
          subject: 'Sua Ficha do Cliente',
          html: '<p>Segue em anexo sua ficha de cliente.</p>',
          attachments: [
            {
              filename: fileName,
              content: req.file.buffer,
            },
          ],
        });
        emailSent = true;
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Não falha a requisição se email não for enviado
      }
    }

    const pdfId = `pdf_${Date.now()}`;

    return created(res, {
      pdfId,
      fileName,
      emailSent,
    }, 'PDF salvo com sucesso');
  } catch (error) {
    console.error('Erro ao fazer upload de PDF:', error);
    return serverError(res, error.message);
  }
};

/**
 * GET /fichas/download-pdf/:pdfId
 * Download de PDF
 */
export const downloadPdf = async (req, res) => {
  try {
    const { pdfId } = req.params;

    // Buscar arquivo no diretório
    // Para simplicidade, assumindo que pdfId é o fileName
    const files = await fs.readdir(uploadsDir);
    const pdfFile = files.find((f) => f.includes(pdfId) || f === pdfId);

    if (!pdfFile) {
      return notFound(res, 'PDF não encontrado');
    }

    const filePath = path.join(uploadsDir, pdfFile);
    const fileContent = await fs.readFile(filePath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfFile}"`);
    return res.send(fileContent);
  } catch (error) {
    console.error('Erro ao fazer download de PDF:', error);
    return serverError(res, error.message);
  }
};

/**
 * GET /fichas/pdfs/:clienteId
 * Listar PDFs de um cliente
 */
export const listClientPdfs = async (req, res) => {
  try {
    const { clienteId } = req.params;

    // Listar arquivos no diretório
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      const files = await fs.readdir(uploadsDir);

      // Filtrar arquivos relacionados ao cliente (simplificado)
      const pdfs = await Promise.all(
        files.map(async (fileName) => {
          const filePath = path.join(uploadsDir, fileName);
          const stat = await fs.stat(filePath);
          return {
            pdfId: fileName,
            fileName,
            createdAt: stat.birthtime,
            fileSize: stat.size,
          };
        })
      );

      return ok(res, pdfs, 'PDFs recuperados com sucesso');
    } catch {
      return ok(res, [], 'Nenhum PDF encontrado');
    }
  } catch (error) {
    console.error('Erro ao listar PDFs:', error);
    return serverError(res, error.message);
  }
};

/**
 * DELETE /fichas/pdf/:pdfId
 * Deletar um PDF
 */
export const deletePdf = async (req, res) => {
  try {
    const { pdfId } = req.params;

    const files = await fs.readdir(uploadsDir);
    const pdfFile = files.find((f) => f.includes(pdfId) || f === pdfId);

    if (!pdfFile) {
      return notFound(res, 'PDF não encontrado');
    }

    const filePath = path.join(uploadsDir, pdfFile);
    await fs.unlink(filePath);

    return ok(res, null, 'PDF deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar PDF:', error);
    return serverError(res, error.message);
  }
};

/**
 * POST /fichas/email-pdf
 * Enviar PDF por email
 */
export const emailPdf = async (req, res) => {
  try {
    const { pdfId, destinatario } = req.body;

    if (!pdfId || !destinatario) {
      return badRequest(res, 'pdfId e destinatario são obrigatórios');
    }

    // Buscar arquivo
    const files = await fs.readdir(uploadsDir);
    const pdfFile = files.find((f) => f.includes(pdfId) || f === pdfId);

    if (!pdfFile) {
      return notFound(res, 'PDF não encontrado');
    }

    const filePath = path.join(uploadsDir, pdfFile);
    const fileContent = await fs.readFile(filePath);

    // Enviar email
    await sendEmail({
      to: destinatario,
      subject: 'Sua Ficha do Cliente',
      html: '<p>Segue em anexo sua ficha de cliente.</p>',
      attachments: [
        {
          filename: pdfFile,
          content: fileContent,
        },
      ],
    });

    const messageId = `msg_${Date.now()}`;

    return ok(res, { messageId }, 'Email enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar email com PDF:', error);
    return serverError(res, error.message);
  }
};

/**
 * POST /fichas/persist-with-pdf
 * Persistir ficha com PDF atomicamente
 */
export const persistFichaWithPdf = async (req, res) => {
  try {
    const lojaId = req.user?.lojaId ?? 1;
    const vendedorId = req.user?.id;

    if (!req.file) {
      return badRequest(res, 'PDF é obrigatório');
    }

    // Parse ficha data do body
    let fichaData = {};
    if (req.body.ficha) {
      try {
        fichaData = JSON.parse(req.body.ficha);
      } catch {
        fichaData = req.body.ficha;
      }
    } else {
      fichaData = req.body;
    }

    const { clienteId } = fichaData;

    if (!clienteId) {
      return badRequest(res, 'clienteId é obrigatório');
    }

    // Verificar cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente || cliente.lojaId !== lojaId) {
      return notFound(res, 'Cliente não encontrado');
    }

    // Criar diretório se não existir
    await fs.mkdir(uploadsDir, { recursive: true });

    // Gerar nome do arquivo
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedName = cliente.nome?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'ficha';
    const fileName = `ficha-${sanitizedName}-${timestamp}-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    // Salvar PDF no filesystem
    await fs.writeFile(filePath, req.file.buffer);

    // Verificar se já existe uma ficha em aberto para esse cliente
    let ficha = await prisma.fichaRecuperacao.findFirst({
      where: { clienteId, lojaId, status: { in: ['ABERTA', 'EM_ANDAMENTO'] } },
      orderBy: { id: 'desc' },
    });

    if (ficha) {
      ficha = await prisma.fichaRecuperacao.update({
        where: { id: ficha.id },
        data: {
          vendedorId: vendedorId || ficha.vendedorId,
          telefoneFixo: fichaData.telefoneFixo ?? ficha.telefoneFixo,
          telefoneCelular: fichaData.telefoneCelular ?? ficha.telefoneCelular,
          whatsapp: fichaData.whatsapp ?? ficha.whatsapp,
          dataNascimento: fichaData.dataNascimento ? new Date(fichaData.dataNascimento) : ficha.dataNascimento,
          sexo: fichaData.sexo ?? ficha.sexo,
          estadoCivil: fichaData.estadoCivil ?? ficha.estadoCivil,
          residenciaTipo: fichaData.residenciaTipo ?? ficha.residenciaTipo,
          tempoResidencia: fichaData.tempoResidencia ?? ficha.tempoResidencia,
          empresaNome: fichaData.empresaNome ?? ficha.empresaNome,
          cargoFuncao: fichaData.cargoFuncao ?? ficha.cargoFuncao,
          classificacaoTrabalho: fichaData.classificacaoTrabalho ?? ficha.classificacaoTrabalho,
          renda: fichaData.renda ? parseFloat(fichaData.renda) : ficha.renda,
          valorVeiculo: fichaData.valorVeiculo ? parseFloat(fichaData.valorVeiculo) : ficha.valorVeiculo,
          valorEntrada: fichaData.valorEntrada ? parseFloat(fichaData.valorEntrada) : ficha.valorEntrada,
          valorFinanciado: fichaData.valorFinanciado ? parseFloat(fichaData.valorFinanciado) : ficha.valorFinanciado,
        },
        include: {
          cliente: true,
        },
      });
    } else {
      // Garantir oportunidade de crédito vinculada que não tenha ficha
      let oportunidade = await prisma.oportunidadeCredito.findFirst({
        where: { clienteId, status: { in: ['ABERTA', 'EM_ANDAMENTO'] }, ficha: null },
      });
      if (!oportunidade) {
        oportunidade = await prisma.oportunidadeCredito.create({
          data: {
            clienteId,
            lojaId,
            responsavelId: vendedorId,
            tipo: 'REANALISE_CREDITO',
            status: 'ABERTA',
            motivo: 'Captação inicial com PDF realizada pelo vendedor via Ficha do Cliente',
          },
        });
      }

      // Criar ficha no banco de dados
      ficha = await prisma.fichaRecuperacao.create({
        data: {
          lojaId,
          clienteId,
          vendedorId,
          oportunidadeId: oportunidade.id,
          status: 'ABERTA',
          telefoneFixo: fichaData.telefoneFixo,
          telefoneCelular: fichaData.telefoneCelular,
          whatsapp: fichaData.whatsapp,
          dataNascimento: fichaData.dataNascimento ? new Date(fichaData.dataNascimento) : null,
          sexo: fichaData.sexo,
          estadoCivil: fichaData.estadoCivil,
          residenciaTipo: fichaData.residenciaTipo,
          tempoResidencia: fichaData.tempoResidencia,
          empresaNome: fichaData.empresaNome,
          cargoFuncao: fichaData.cargoFuncao,
          classificacaoTrabalho: fichaData.classificacaoTrabalho,
          renda: fichaData.renda ? parseFloat(fichaData.renda) : null,
          valorVeiculo: fichaData.valorVeiculo ? parseFloat(fichaData.valorVeiculo) : null,
          valorEntrada: fichaData.valorEntrada ? parseFloat(fichaData.valorEntrada) : null,
          valorFinanciado: fichaData.valorFinanciado ? parseFloat(fichaData.valorFinanciado) : null,
        },
        include: {
          cliente: true,
        },
      });
    }

    const pdfId = fileName;

    // Enviar email se tiver
    if (cliente.email) {
      try {
        await sendEmail({
          to: cliente.email,
          subject: 'Sua Ficha do Cliente - VFC Multimarcas',
          html: '<p>Segue em anexo sua ficha de cliente. Obrigado pela confiança!</p>',
          attachments: [
            {
              filename: fileName,
              content: req.file.buffer,
            },
          ],
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Não falha se email não enviar
      }
    }

    return created(res, {
      fichaId: ficha.id,
      pdfId,
      fileName,
    }, 'Ficha e PDF salvos com sucesso');
  } catch (error) {
    console.error('Erro ao persistir ficha com PDF:', error);
    return serverError(res, error.message);
  }
};

/**
 * GET /fichas/stats
 * Obter estatísticas de fichas
 */
export const getFichasStats = async (req, res) => {
  try {
    const lojaId = req.user?.lojaId ?? 1;

    // Data de hoje
    const hoje = new Date();
    const primeiroDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const [totalFichas, fichasEsteMes, fichasComPdf] = await Promise.all([
      prisma.fichaRecuperacao.count({ where: { lojaId } }),
      prisma.fichaRecuperacao.count({
        where: {
          lojaId,
          dataEntradaFicha: { gte: primeiroDoMes },
        },
      }),
      prisma.fichaRecuperacao.count({
        where: {
          lojaId,
          // Assumindo que fichas com PDF têm um campo específico
        },
      }),
    ]);

    // Média de valor financiado
    const result = await prisma.fichaRecuperacao.aggregate({
      where: { lojaId },
      _avg: { valorFinanciado: true },
    });

    return ok(res, {
      totalFichas,
      fichasEsteMes,
      fichasComPdf,
      emailsEnviados: 0, // Seria necessário um campo de rastreamento
      mediaValorFinanciado: result._avg.valorFinanciado || 0,
    });
  } catch (error) {
    console.error('Erro ao obter stats:', error);
    return serverError(res, error.message);
  }
};
