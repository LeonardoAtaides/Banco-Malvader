import { z } from 'zod';

// Validação de CPF
export const validarCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

// Schema de login
export const loginSchema = z.object({
  cpf: z.string()
    .min(11, 'CPF deve ter 11 dígitos')
    .max(11, 'CPF deve ter 11 dígitos')
    .refine(validarCPF, 'CPF inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

// Schema de criação de usuário
export const usuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  cpf: z.string()
    .length(11, 'CPF deve ter 11 dígitos')
    .refine(validarCPF, 'CPF inválido'),
  dataNascimento: z.string().or(z.date()),
  telefone: z.string().min(10).max(15),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  tipoUsuario: z.enum(['FUNCIONARIO', 'CLIENTE']),
});

// Schema de endereço
export const enderecoSchema = z.object({
  cep: z.string().min(8, 'CEP deve ter no mínimo 8 dígitos').max(10, 'CEP inválido'),
  local: z.string().max(100),
  numeroCasa: z.string().max(10),
  bairro: z.string().max(50),
  cidade: z.string().max(50),
  estado: z.string().length(2, 'Estado deve ter 2 letras'),
  complemento: z.string().max(50).optional(),
});

// Schema de abertura de conta
export const contaSchema = z.object({
  idCliente: z.number().int().positive(),
  idAgencia: z.number().int().positive(),
  tipoConta: z.enum(['POUPANCA', 'CORRENTE', 'INVESTIMENTO']),
  senha: z.string().min(6),
});

// Schema de conta poupança
export const contaPoupancaSchema = z.object({
  idCliente: z.number().int().positive(),
  idAgencia: z.number().int().positive(),
  senha: z.string().min(6),
  taxaRendimento: z.number().positive().max(1, 'Taxa não pode ser maior que 100%'),
});

// Schema de conta corrente
export const contaCorrenteSchema = z.object({
  idCliente: z.number().int().positive(),
  idAgencia: z.number().int().positive(),
  senha: z.string().min(6),
  limite: z.number().positive().optional(),
  dataVencimento: z.string().or(z.date()),
  taxaManutencao: z.number().positive().optional(),
});

// Schema de conta investimento
export const contaInvestimentoSchema = z.object({
  idCliente: z.number().int().positive(),
  idAgencia: z.number().int().positive(),
  senha: z.string().min(6),
  perfilRisco: z.enum(['BAIXO', 'MEDIO', 'ALTO']),
  valorMinimo: z.number().positive(),
  taxaRendimentoBase: z.number().positive().max(1, 'Taxa não pode ser maior que 100%'),
});

// Schema de transação
export const transacaoSchema = z.object({
  idContaOrigem: z.number().int().positive().optional(),
  idContaDestino: z.number().int().positive().optional(),
  tipoTransacao: z.enum(['DEPOSITO', 'SAQUE', 'TRANSFERENCIA', 'RENDIMENTO', 'TAXA']),
  valor: z.number().positive('Valor deve ser positivo'),
  descricao: z.string().max(100).optional(),
});

// Schema de alteração de conta
export const alterarContaSchema = z.object({
  limite: z.number().positive().optional(),
  dataVencimento: z.string().or(z.date()).optional(),
  taxaRendimento: z.number().positive().max(1).optional(),
  taxaManutencao: z.number().positive().optional(),
});

// Schema de encerramento de conta
export const encerrarContaSchema = z.object({
  idConta: z.number().int().positive(),
  motivo: z.string().min(10, 'Motivo deve ter no mínimo 10 caracteres').max(200),
});

// Tipos exportados
export type LoginInput = z.infer<typeof loginSchema>;
export type UsuarioInput = z.infer<typeof usuarioSchema>;
export type EnderecoInput = z.infer<typeof enderecoSchema>;
export type ContaInput = z.infer<typeof contaSchema>;
export type ContaPoupancaInput = z.infer<typeof contaPoupancaSchema>;
export type ContaCorrenteInput = z.infer<typeof contaCorrenteSchema>;
export type ContaInvestimentoInput = z.infer<typeof contaInvestimentoSchema>;
export type TransacaoInput = z.infer<typeof transacaoSchema>;
export type AlterarContaInput = z.infer<typeof alterarContaSchema>;
export type EncerrarContaInput = z.infer<typeof encerrarContaSchema>;