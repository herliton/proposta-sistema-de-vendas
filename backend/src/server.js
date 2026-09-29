import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { prisma } from './config/database.js';

const PORT = process.env.PORT || 4000;

try {
  await prisma.$connect();
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} (PostgreSQL conectado)`));
} catch (error) {
  console.error('Não foi possível conectar ao PostgreSQL:', error.message);
  process.exit(1);
}
