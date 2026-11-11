import { prisma } from './src/config/database.js';
import bcryptjs from 'bcryptjs';

const email = 'herliton@allos.net.br';
const newPassword = '123456';

const hashedPassword = await bcryptjs.hash(newPassword, 10);
const updated = await prisma.usuario.update({
  where: { email },
  data: { senhaHash: hashedPassword, firstAccess: false }
});

console.log(`Senha resetada para ${email}: ${newPassword}`);
await prisma.$disconnect();
