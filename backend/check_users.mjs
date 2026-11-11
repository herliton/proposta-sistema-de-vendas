import { prisma } from './src/config/database.js';

const users = await prisma.usuario.findMany({ 
  select: { id: true, email: true, perfil: true, nome: true }, 
  take: 10 
});
console.log(JSON.stringify(users, null, 2));
await prisma.$disconnect();
