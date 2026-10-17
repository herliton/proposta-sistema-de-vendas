import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { ensureSystemSeed, prisma } from './config/database.js';

const PORT = process.env.PORT || 4000;

try {
  await prisma.$connect();
  await ensureSystemSeed();
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} (MySQL conectado)`));
} catch (error) {
  console.error('Não foi possível conectar ao MySQL:', error.message);
  process.exit(1);
}
