import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import clientesRoutes from './routes/clientes.js';
import vendedoresRoutes from './routes/vendedores.js';
import veiculosRoutes from './routes/veiculos.js';
import propostasRoutes from './routes/propostas.js';
import contratosRoutes from './routes/contratos.js';
import financeiroRoutes from './routes/financeiro.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API VFC Multimarcas online',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/vendedores', vendedoresRoutes);
app.use('/api/veiculos', veiculosRoutes);
app.use('/api/propostas', propostasRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/financeiro', financeiroRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: err.message,
  });
});

export default app;
