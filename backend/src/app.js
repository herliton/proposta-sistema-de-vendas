import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/auth.js';
import clientesRoutes from './routes/clientes.js';
import vendedoresRoutes from './routes/vendedores.js';
import veiculosRoutes from './routes/veiculos.js';
import propostasRoutes from './routes/propostas.js';
import contratosRoutes from './routes/contratos.js';
import financeiroRoutes from './routes/financeiro.js';
import permissionsRoutes from './routes/permissions.js';
import reportsRoutes from './routes/reports.js';
import creditRecoveryRoutes from './routes/creditRecovery.js';
import dealsRoutes from './routes/deals.js';
import lojasRoutes from './routes/lojas.js';
import { prisma } from './config/database.js';

dotenv.config();

const app = express();
const currentDir = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(currentDir, '..', 'uploads'), { fallthrough: false, index: false }));

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ success: true, message: 'API VFC Multimarcas online', data: { status: 'ok', database: 'connected', timestamp: new Date().toISOString() } });
  } catch {
    return res.status(503).json({ success: false, message: 'Banco de dados indisponível', data: { status: 'degraded', database: 'disconnected', timestamp: new Date().toISOString() } });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/vendedores', vendedoresRoutes);
app.use('/api/veiculos', veiculosRoutes);
app.use('/api/propostas', propostasRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/credit-recovery', creditRecoveryRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/stores', lojasRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: err.message,
  });
});

export default app;
