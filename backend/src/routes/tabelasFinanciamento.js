import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { prisma } from '../config/database.js';
import { ok, notFound } from '../utils/response.js';

const router = express.Router();

// GET - Listar tabelas de financiamento ativas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status = 'ativo' } = req.query;
    
    const where = {
      ...(status && { status }),
      vigenciaInicio: { lte: new Date() },
      OR: [
        { vigenciaFim: null },
        { vigenciaFim: { gte: new Date() } }
      ]
    };

    const tabelas = await prisma.tabelaFinanciamento.findMany({
      where,
      orderBy: [{ instituicao: 'asc' }, { produto: 'asc' }],
    });

    return ok(res, tabelas, 'Tabelas de financiamento carregadas');
  } catch (error) {
    console.error('Erro ao listar tabelas:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erro ao buscar tabelas de financiamento'
    });
  }
});

// GET - Obter uma tabela específica
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const tabela = await prisma.tabelaFinanciamento.findUnique({
      where: { id }
    });

    if (!tabela) return notFound(res, 'Tabela não encontrada');
    return ok(res, tabela);
  } catch (error) {
    console.error('Erro ao obter tabela:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erro ao buscar tabela'
    });
  }
});

export default router;
