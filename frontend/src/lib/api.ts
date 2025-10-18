// Configuração da API do backend
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000, // 10 segundos
};

// URLs das APIs
export const API_ROUTES = {
  // Autenticação
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CHANGE_PASSWORD: '/auth/alterar-senha',
  
  // Usuários
  USERS: '/usuarios',
  USER_BY_ID: (id: number) => `/usuarios/${id}`,
  
  // Contas
  ACCOUNTS: '/contas',
  ACCOUNT_BY_ID: (id: number) => `/contas/${id}`,
  CLOSE_ACCOUNT: (id: number) => `/contas/${id}/encerrar`,
  
  // Transações
  TRANSACTIONS: '/transacoes',
  
  // Agências
  AGENCIES: '/agencias',
  
  // Funcionários
  EMPLOYEES: '/funcionarios',
  
  // Clientes
  CLIENTS: '/clientes',
  CLIENT_SCORE: (id: number) => `/clientes/${id}/score`,
  
  // Relatórios
  REPORTS: '/relatorios',
  
  // Dashboard
  DASHBOARD_ACCOUNTS: '/dashboard/resumo-contas',
  DASHBOARD_MOVEMENTS: '/dashboard/movimentacoes-recentes',
};

// Tipos para as requisições
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface LoginRequest {
  cpf: string;
  senha: string;
}

export interface LoginResponse extends ApiResponse {
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

export interface AccountsResponse extends ApiResponse {
  contas: any[];
}

export interface TransactionsResponse extends ApiResponse {
  transacoes: any[];
}
