import { Request } from 'express';

// Tipos básicos do banco de dados
export interface Usuario {
  id_usuario?: number;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  tipo_usuario: 'FUNCIONARIO' | 'CLIENTE';
  senha_hash?: string;
}

export interface EnderecoUsuario {
  id_endereco?: number;
  id_usuario: number;
  cep: string;
  local: string;
  numero_casa: number;
  bairro: string;
  cidade: string;
  estado: string;
  complemento?: string;
}

export interface EnderecoAgencia {
  id_endereco_agencia?: number;
  cep: string;
  local: string;
  numero: number;
  bairro: string;
  cidade: string;
  estado: string;
  complemento?: string;
}

export interface Agencia {
  id_agencia?: number;
  nome: string;
  codigo_agencia: string;
  endereco_id: number;
}

export interface Cliente {
  id_cliente?: number;
  id_usuario: number;
  score_credito: number;
}

export interface Funcionario {
  id_funcionario?: number;
  id_usuario: number;
  id_agencia: number;
  codigo_funcionario: string;
  cargo: 'ESTAGIARIO' | 'ATENDENTE' | 'GERENTE';
  id_supervisor?: number;
}

export interface Conta {
  id_conta?: number;
  numero_conta?: string;
  id_agencia: number;
  saldo: number;
  tipo_conta: 'POUPANCA' | 'CORRENTE' | 'INVESTIMENTO';
  id_cliente: number;
  data_abertura?: string;
  status: 'ATIVA' | 'ENCERRADA' | 'BLOQUEADA';
}

export interface ContaPoupanca {
  id_conta_poupanca?: number;
  id_conta: number;
  taxa_rendimento: number;
  ultimo_rendimento?: string;
}

export interface ContaCorrente {
  id_conta_corrente?: number;
  id_conta: number;
  limite: number;
  data_vencimento: string;
  taxa_manutencao: number;
}

export interface ContaInvestimento {
  id_conta_investimento?: number;
  id_conta: number;
  perfil_risco: 'BAIXO' | 'MEDIO' | 'ALTO';
  valor_minimo: number;
  taxa_rendimento_base: number;
}

export interface Transacao {
  id_transacao?: number;
  id_conta_origem?: number;
  id_conta_destino?: number;
  tipo_transacao: 'DEPOSITO' | 'SAQUE' | 'TRANSFERENCIA' | 'TAXA' | 'RENDIMENTO';
  valor: number;
  data_hora?: string;
  descricao?: string;
}

export interface Relatorio {
  id_relatorio?: number;
  id_funcionario: number;
  tipo_relatorio: string;
  data_geracao?: string;
  conteudo: any;
}

// Tipos para requests/responses da API
export interface LoginRequest {
  cpf: string;
  senha: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  usuario: {
    id_usuario: number;
    nome: string;
    cpf: string;
    tipo_usuario: string;
    id_cliente?: number;
    id_funcionario?: number;
    cargo?: string;
    id_agencia?: number;
  };
}

export interface RegisterRequest {
  usuario: Omit<Usuario, 'id_usuario' | 'senha_hash'>;
  endereco: Omit<EnderecoUsuario, 'id_endereco' | 'id_usuario'>;
  senha: string;
}

export interface AlterarSenhaRequest {
  senha_atual: string;
  nova_senha: string;
}

export interface CriarContaRequest {
  id_agencia: number;
  tipo_conta: 'POUPANCA' | 'CORRENTE' | 'INVESTIMENTO';
  id_cliente: number;
  perfil_risco?: 'BAIXO' | 'MEDIO' | 'ALTO';
}

export interface CriarTransacaoRequest {
  tipo_transacao: 'DEPOSITO' | 'SAQUE' | 'TRANSFERENCIA' | 'TAXA' | 'RENDIMENTO';
  valor: number;
  id_conta_origem?: number;
  id_conta_destino?: number;
  descricao?: string;
}

export interface EncerrarContaRequest {
  motivo: string;
}

// Tipos para JWT payload
export interface JWTPayload {
  id_usuario: number;
  nome: string;
  cpf: string;
  tipo_usuario: 'FUNCIONARIO' | 'CLIENTE';
  id_cliente?: number;
  id_funcionario?: number;
  cargo?: 'ESTAGIARIO' | 'ATENDENTE' | 'GERENTE';
  id_agencia?: number;
  iat?: number;
  exp?: number;
}

// Tipos para views do banco
export interface ResumoContas {
  id_cliente: number;
  nome: string;
  total_contas: number;
  saldo_total: number;
}

export interface MovimentacaoRecente {
  id_transacao: number;
  tipo_transacao: string;
  valor: number;
  data_hora: string;
  conta_origem?: string;
  conta_destino?: string;
  cliente_origem?: string;
}

// Tipos para relatórios
export interface RelatorioResumoContas {
  total_contas: number;
  contas_corrente: number;
  contas_poupanca: number;
  contas_investimento: number;
  saldo_total: number;
  saldo_medio: number;
}

export interface RelatorioMovimentacoes {
  tipo_transacao: string;
  quantidade: number;
  valor_total: number;
  valor_medio: number;
}

export interface RelatorioClientesScore {
  total_clientes: number;
  score_medio: number;
  alto_score: number;
  medio_score: number;
  baixo_score: number;
}

// Tipos para responses da API
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  limite: number;
  offset: number;
  total?: number;
}

// Tipos para erros
export interface ApiError {
  error: string;
  details?: any;
  status: number;
}

// Estendendo Request do Express para incluir dados do usuário
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
