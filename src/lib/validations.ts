import { z } from "zod";

// --- Usuario ---
export const usuarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  data_nascimento: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: "Data de nascimento inválida",
  }),
  telefone: z.string().min(8, "Telefone inválido"),
  tipo_usuario: z.enum(["FUNCIONARIO", "CLIENTE"]),
  senha_hash: z.string().min(6, "Senha muito curta"),
});

// schema para PUT
export const usuarioUpdateSchema = z.object({
  id_usuario: z.number().int(),
  nome: z.string().optional(),
  telefone: z.string().optional(),
  tipo_usuario: z.enum(["FUNCIONARIO", "CLIENTE"]).optional(),
});

// --- Endereco ---
export const enderecoSchema = z.object({
  id_usuario: z.number().int(),
  cep: z.string().min(8, "CEP inválido"),
  local: z.string().min(1),
  numero_casa: z.number().int(),
  bairro: z.string().min(1),
  cidade: z.string().min(1),
  estado: z.string().length(2),
  complemento: z.string().optional().nullable(),
});

export const enderecoUpdateSchema = z.object({
  id_endereco: z.number().int(),
  cep: z.string().optional(),
  local: z.string().optional(),
  numero_casa: z.number().int().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2).optional(),
  complemento: z.string().optional().nullable(),
});
