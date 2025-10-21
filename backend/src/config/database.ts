import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export const createConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com MySQL estabelecida via Prisma');
    return prisma;
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error);
    throw error;
  }
};

export const closeConnection = async () => {
  await prisma.$disconnect();
};

export default prisma;