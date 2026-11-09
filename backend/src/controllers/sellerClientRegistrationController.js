import { prisma } from '../config/database.js';
import { ok, created, notFound, badRequest } from '../utils/response.js';
import { generateSellerFichaPdf } from '../services/sellerFichaPdfService.js';

export const listSellerFichas = async (req, res) => {
  const userId = req.user?.id;
  const lojaId = req.user?.lojaId ?? 1;
  const { page = 1, limit = 20, status, search } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const where = {
    lojaId,
    vendedorId: userId,
    deletedAt: null,
    ...(status && { status }),
    ...(search && {
      OR: [
        { cliente: { nome: { contains: search, mode: 'insensitive' } } },
        { cliente: { documento: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [fichas, total] = await Promise.all([
    prisma.fichaRecuperacao.findMany({
      where,
      select: {
        id: true,
        status: true,
        dataEntradaFicha: true,
        cliente: { select: { id: true, nome: true, documento: true, telefone: true } },
        vendedor: { select: { id: true, nome: true } },
        gerente: { select: { id: true, nome: true } },
        _count: { select: { referencias: true, opcoes: true } },
      },
      orderBy: { dataEntradaFicha: 'desc' },
      take: limitNum,
      skip,
    }),
    prisma.fichaRecuperacao.count({ where }),
  ]);

  return ok(res, {
    fichas,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
};

export const createSellerFicha = async (req, res) => {
  const userId = req.user?.id;
  const lojaId = req.user?.lojaId ?? 1;
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
    opcoes = [],
    referencias = [],
  } = req.body;

  if (!clienteId) return badRequest(res, 'clienteId é obrigatório.');

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
  if (!cliente || cliente.lojaId !== lojaId) return notFound(res, 'Cliente não encontrado.');

  const ficha = await prisma.fichaRecuperacao.create({
    data: {
      lojaId,
      clienteId,
      vendedorId: userId,
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
      valorVeiculo: valorVeiculo ? parseFloat(valorVeiculo) : null,
      valorEntrada: valorEntrada ? parseFloat(valorEntrada) : null,
      valorFinanciado: valorFinanciado ? parseFloat(valorFinanciado) : null,
      referencias: {
        createMany: {
          data: referencias.map((ref) => ({
            nome: ref.nome,
            telefone: ref.telefone,
            tipo: ref.tipo,
          })),
        },
      },
      opcoes: {
        createMany: {
          data: opcoes.map((opt, idx) => ({
            ordem: idx + 1,
            marca: opt.marca,
            modelo: opt.modelo,
            anoModelo: opt.anoModelo ? parseInt(opt.anoModelo, 10) : null,
            anoFabricacao: opt.anoFabricacao ? parseInt(opt.anoFabricacao, 10) : null,
            parcelas: {
              createMany: {
                data: (opt.parcelas || []).map((p) => ({
                  quantidade: parseInt(p.quantidade, 10),
                  parcelaMinima: parseFloat(p.parcelaMinima),
                  parcelaMaxima: parseFloat(p.parcelaMaxima),
                })),
              },
            },
          })),
        },
      },
    },
    include: {
      cliente: true,
      vendedor: true,
      referencias: true,
      opcoes: { include: { parcelas: true } },
    },
  });

  return ok(res, { ficha }, 'Ficha criada com sucesso.', 201);
};

export const getSellerFicha = async (req, res) => {
  const userId = req.user?.id;
  const lojaId = req.user?.lojaId ?? 1;
  const { id } = req.params;

  const ficha = await prisma.fichaRecuperacao.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      cliente: true,
      vendedor: true,
      gerente: true,
      referencias: true,
      opcoes: { include: { parcelas: true } },
    },
  });

  if (!ficha || ficha.lojaId !== lojaId || (ficha.vendedorId !== userId && ficha.gerenteId !== userId)) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Acesso negado.' });
  }

  return ok(res, { ficha });
};

export const updateSellerFicha = async (req, res) => {
  const userId = req.user?.id;
  const lojaId = req.user?.lojaId ?? 1;
  const { id } = req.params;
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
    opcoes = [],
    referencias = [],
  } = req.body;

  const fichaId = parseInt(id, 10);
  const ficha = await prisma.fichaRecuperacao.findUnique({ where: { id: fichaId } });

  if (!ficha || ficha.lojaId !== lojaId || ficha.vendedorId !== userId) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Acesso negado.' });
  }

  const updated = await prisma.fichaRecuperacao.update({
    where: { id: fichaId },
    data: {
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
      valorVeiculo: valorVeiculo ? parseFloat(valorVeiculo) : null,
      valorEntrada: valorEntrada ? parseFloat(valorEntrada) : null,
      valorFinanciado: valorFinanciado ? parseFloat(valorFinanciado) : null,
      updatedAt: new Date(),
      referencias: {
        deleteMany: {},
        createMany: {
          data: referencias.map((ref) => ({
            nome: ref.nome,
            telefone: ref.telefone,
            tipo: ref.tipo,
          })),
        },
      },
      opcoes: {
        deleteMany: {},
        createMany: {
          data: opcoes.map((opt, idx) => ({
            ordem: idx + 1,
            marca: opt.marca,
            modelo: opt.modelo,
            anoModelo: opt.anoModelo ? parseInt(opt.anoModelo, 10) : null,
            anoFabricacao: opt.anoFabricacao ? parseInt(opt.anoFabricacao, 10) : null,
            parcelas: {
              createMany: {
                data: (opt.parcelas || []).map((p) => ({
                  quantidade: parseInt(p.quantidade, 10),
                  parcelaMinima: parseFloat(p.parcelaMinima),
                  parcelaMaxima: parseFloat(p.parcelaMaxima),
                })),
              },
            },
          })),
        },
      },
    },
    include: {
      cliente: true,
      vendedor: true,
      referencias: true,
      opcoes: { include: { parcelas: true } },
    },
  });

  return ok(res, { ficha: updated }, 'Ficha atualizada com sucesso.');
};

export const downloadSellerFichaPdf = async (req, res) => {
  const userId = req.user?.id;
  const lojaId = req.user?.lojaId ?? 1;
  const { id } = req.params;

  const fichaId = parseInt(id, 10);
  const ficha = await prisma.fichaRecuperacao.findUnique({
    where: { id: fichaId },
    include: {
      cliente: true,
      vendedor: true,
      loja: true,
      referencias: true,
      opcoes: { include: { parcelas: true } },
    },
  });

  if (!ficha || ficha.lojaId !== lojaId || (ficha.vendedorId !== userId)) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Acesso negado.' });
  }

  try {
    const pdfBuffer = await generateSellerFichaPdf(ficha);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ficha-cliente-${ficha.cliente.nome.replace(/\s+/g, '-')}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Erro ao gerar PDF.' });
  }
};
