import { PrismaClient } from '@prisma/client';

// Se já tiver um arquivo que exporta a instância do Prisma (ex: config/database.ts),
// prefira importar ele. Ex: import prisma from '../config/database';
const prisma = new PrismaClient();

// ATENÇÃO: substitua `usuario` pelo nome exato do modelo no seu schema.prisma
// por exemplo: prisma.usuario ou prisma.User
export default {
  async getAll() {
    return prisma.usuario.findMany();
  },

  async getById(id: number) {
    return prisma.usuario.findUnique({ where: { id } });
  },

  async create(data: any) {
    // Ajuste os campos conforme seu schema (ex: nome, cpf, email, senha)
    return prisma.usuario.create({ data });
  },

  async update(id: number, data: any) {
    return prisma.usuario.update({
      where: { id },
      data,
    });
  },

  async remove(id: number) {
    return prisma.usuario.delete({ where: { id } });
  },
};