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

// --- Autenticação ---
export const loginSchema = z.object({
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  senha: z.string().min(6, "Senha muito curta"),
});

// --- Funcionario ---
export const funcionarioSchema = z.object({
  id_usuario: z.number().int(),
  id_agencia: z.number().int(),
  codigo_funcionario: z.string().min(1, "Código é obrigatório"),
  cargo: z.enum(["ESTAGIARIO", "ATENDENTE", "GERENTE"]),
  id_supervisor: z.number().int().optional().nullable(),
});

// --- Cliente ---
export const clienteSchema = z.object({
  id_usuario: z.number().int(),
  score_credito: z.number().min(0).max(100).optional().default(0),
});

// --- Agencia ---
export const agenciaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  codigo_agencia: z.string().min(1, "Código é obrigatório"),
  endereco: z.object({
    cep: z.string().min(8),
    local: z.string().min(1),
    numero: z.number().int(),
    bairro: z.string().min(1),
    cidade: z.string().min(1),
    estado: z.string().length(2),
    complemento: z.string().optional().nullable(),
  }),
});

// --- Conta ---
export const contaSchema = z.object({
  id_agencia: z.number().int(),
  tipo_conta: z.enum(["POUPANCA", "CORRENTE", "INVESTIMENTO"]),
  id_cliente: z.number().int(),
  // Campos específicos por tipo de conta
  taxa_rendimento: z.number().optional(), // Para poupança
  limite: z.number().optional(), // Para corrente
  data_vencimento: z.string().optional(), // Para corrente
  perfil_risco: z.enum(["BAIXO", "MEDIO", "ALTO"]).optional(), // Para investimento
  valor_minimo: z.number().optional(), // Para investimento
});

// --- Transacao ---
export const depositoSchema = z.object({
  id_conta_destino: z.number().int(),
  valor: z.number().positive("Valor deve ser positivo"),
  descricao: z.string().optional(),
});

export const saqueSchema = z.object({
  id_conta_origem: z.number().int(),
  valor: z.number().positive("Valor deve ser positivo"),
  descricao: z.string().optional(),
});

export const transferenciaSchema = z.object({
  id_conta_origem: z.number().int(),
  id_conta_destino: z.number().int(),
  valor: z.number().positive("Valor deve ser positivo"),
  descricao: z.string().optional(),
});

// --- Relatório ---
export const relatorioSchema = z.object({
  id_funcionario: z.number().int(),
  tipo_relatorio: z.string().min(1, "Tipo é obrigatório"),
  conteudo: z.any(), // JSON livre
});

// --- Validações Customizadas ---
export function validarSenhaForte(senha: string): { valida: boolean; mensagem?: string } {
  if (senha.length < 8) {
    return { valida: false, mensagem: "Senha deve ter no mínimo 8 caracteres" };
  }
  if (!/[A-Z]/.test(senha)) {
    return { valida: false, mensagem: "Senha deve conter ao menos uma letra maiúscula" };
  }
  if (!/[0-9]/.test(senha)) {
    return { valida: false, mensagem: "Senha deve conter ao menos um número" };
  }
  if (!/[^a-zA-Z0-9]/.test(senha)) {
    return { valida: false, mensagem: "Senha deve conter ao menos um caractere especial" };
  }
  return { valida: true };
}

export function validarLimiteDeposito(valor: number): boolean {
  return valor <= 10000;
}