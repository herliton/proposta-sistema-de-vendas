import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { ensureSystemSeed, prisma } from './config/database.js';
import { getJwtSecret } from './config/security.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    getJwtSecret();
    if (process.env.NODE_ENV === 'production' && !process.env.INITIAL_ADMIN_SETUP_TOKEN) {
      throw new Error('INITIAL_ADMIN_SETUP_TOKEN must be configured in production.');
    }
    await prisma.$connect();
    await ensureSystemSeed();
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} (MySQL conectado)`));
  } catch (error) {
    console.error('Não foi possível conectar ao MySQL:', error.message);
    process.exit(1);
  }
};

startServer();
