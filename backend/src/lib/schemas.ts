import { z } from 'zod';

// Schema para Usuario
export const UsuarioSchema = z.object({
  id_usuario: z.number().optional(),
  nome: z.string().min(1).max(100),
  cpf: z.string().length(11),
  data_nascimento: z.string(),
  telefone: z.string().max(15),
  tipo_usuario: z.enum(['FUNCIONARIO', 'CLIENTE']),
  senha_hash: z.string().optional()
});

// Schema para Endereco Usuario
export const EnderecoUsuarioSchema = z.object({
  id_endereco: z.number().optional(),
  id_usuario: z.number(),
  cep: z.string().max(10),
  local: z.string().max(100),
  numero_casa: z.number(),
  bairro: z.string().max(50),
  cidade: z.string().max(50),
  estado: z.string().length(2),
  complemento: z.string().max(50).optional()
});

// Schema para Agencia
export const AgenciaSchema = z.object({
  id_agencia: z.number().optional(),
  nome: z.string().max(50),
  codigo_agencia: z.string().max(10),
  endereco_id: z.number()
});

// Schema para Cliente
export const ClienteSchema = z.object({
  id_cliente: z.number().optional(),
  id_usuario: z.number(),
  score_credito: z.number().default(0.00)
});

// Schema para Funcionario
export const FuncionarioSchema = z.object({
  id_funcionario: z.number().optional(),
  id_usuario: z.number(),
  id_agencia: z.number(),
  codigo_funcionario: z.string().max(20),
  cargo: z.enum(['ESTAGIARIO', 'ATENDENTE', 'GERENTE']),
  id_supervisor: z.number().optional()
});

// Schema para Conta
export const ContaSchema = z.object({
  id_conta: z.number().optional(),
  numero_conta: z.string().max(20).optional(),
  id_agencia: z.number(),
  saldo: z.number().default(0.00),
  tipo_conta: z.enum(['POUPANCA', 'CORRENTE', 'INVESTIMENTO']),
  id_cliente: z.number(),
  data_abertura: z.string().optional(),
  status: z.enum(['ATIVA', 'ENCERRADA', 'BLOQUEADA']).default('ATIVA')
});

// Schema para Transacao
export const TransacaoSchema = z.object({
  id_transacao: z.number().optional(),
  id_conta_origem: z.number().optional(),
  id_conta_destino: z.number().optional(),
  tipo_transacao: z.enum(['DEPOSITO', 'SAQUE', 'TRANSFERENCIA', 'TAXA', 'RENDIMENTO']),
  valor: z.number().positive(),
  data_hora: z.string().optional(),
  descricao: z.string().max(100).optional()
});

// Schema para Login
export const LoginSchema = z.object({
  cpf: z.string().length(11),
  senha: z.string().min(8)
});

// Schema para alteração de senha
export const AlterarSenhaSchema = z.object({
  id_usuario: z.number(),
  senha_atual: z.string(),
  nova_senha: z.string().min(8)
});

// Types exportados
export type Usuario = z.infer<typeof UsuarioSchema>;
export type EnderecoUsuario = z.infer<typeof EnderecoUsuarioSchema>;
export type Agencia = z.infer<typeof AgenciaSchema>;
export type Cliente = z.infer<typeof ClienteSchema>;
export type Funcionario = z.infer<typeof FuncionarioSchema>;
export type Conta = z.infer<typeof ContaSchema>;
export type Transacao = z.infer<typeof TransacaoSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type AlterarSenha = z.infer<typeof AlterarSenhaSchema>;
