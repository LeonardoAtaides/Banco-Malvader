import { API_CONFIG, API_ROUTES, ApiResponse, LoginResponse, AccountsResponse, TransactionsResponse } from './api';

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Método genérico para fazer requisições
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Adicionar token se estiver no localStorage
    const token = this.getStoredToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Gerenciamento de token
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  public removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Métodos de autenticação
  async login(cpf: string, senha: string): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>(API_ROUTES.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ cpf, senha }),
    }) as Promise<LoginResponse>;
  }

  async register(userData: any) {
    return this.makeRequest(API_ROUTES.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(senhaAtual: string, novaSenha: string) {
    return this.makeRequest(API_ROUTES.CHANGE_PASSWORD, {
      method: 'PUT',
      body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha }),
    });
  }

  // Métodos para usuários
  async getUsers() {
    return this.makeRequest(API_ROUTES.USERS);
  }

  async getUserById(id: number) {
    return this.makeRequest(API_ROUTES.USER_BY_ID(id));
  }

  async updateUser(id: number, userData: any) {
    return this.makeRequest(API_ROUTES.USER_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Métodos para contas
  async getAccounts(): Promise<AccountsResponse> {
    return this.makeRequest<AccountsResponse>(API_ROUTES.ACCOUNTS) as Promise<AccountsResponse>;
  }

  async getAccountById(id: number) {
    return this.makeRequest(API_ROUTES.ACCOUNT_BY_ID(id));
  }

  async createAccount(accountData: any) {
    return this.makeRequest(API_ROUTES.ACCOUNTS, {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  async updateAccountStatus(id: number, status: string) {
    return this.makeRequest(API_ROUTES.ACCOUNT_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async closeAccount(id: number, motivo: string) {
    return this.makeRequest(API_ROUTES.CLOSE_ACCOUNT(id), {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    });
  }

  // Métodos para transações
  async getTransactions(params?: { conta_id?: number; limite?: number; offset?: number }): Promise<TransactionsResponse> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    const endpoint = queryString ? `${API_ROUTES.TRANSACTIONS}?${queryString}` : API_ROUTES.TRANSACTIONS;
    return this.makeRequest<TransactionsResponse>(endpoint) as Promise<TransactionsResponse>;
  }

  async createTransaction(transactionData: any) {
    return this.makeRequest(API_ROUTES.TRANSACTIONS, {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Métodos para agências
  async getAgencies() {
    return this.makeRequest(API_ROUTES.AGENCIES);
  }

  async createAgency(agencyData: any) {
    return this.makeRequest(API_ROUTES.AGENCIES, {
      method: 'POST',
      body: JSON.stringify(agencyData),
    });
  }

  // Métodos para funcionários
  async getEmployees() {
    return this.makeRequest(API_ROUTES.EMPLOYEES);
  }

  async createEmployee(employeeData: any) {
    return this.makeRequest(API_ROUTES.EMPLOYEES, {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  // Métodos para clientes
  async calculateClientScore(id: number) {
    return this.makeRequest(API_ROUTES.CLIENT_SCORE(id), {
      method: 'POST',
    });
  }

  // Métodos para relatórios
  async getReports(params?: { tipo?: string; data_inicio?: string; data_fim?: string }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    const endpoint = queryString ? `${API_ROUTES.REPORTS}?${queryString}` : API_ROUTES.REPORTS;
    return this.makeRequest(endpoint);
  }

  // Métodos para dashboard
  async getDashboardAccounts() {
    return this.makeRequest(API_ROUTES.DASHBOARD_ACCOUNTS);
  }

  async getDashboardMovements(limite?: number) {
    const queryString = limite ? `?limite=${limite}` : '';
    return this.makeRequest(`${API_ROUTES.DASHBOARD_MOVEMENTS}${queryString}`);
  }

  // Adicione dentro da classe ApiClient

async createUser(userData: any) {
  return this.makeRequest(API_ROUTES.USERS, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

async deleteUser(id: number) {
  return this.makeRequest(API_ROUTES.USER_BY_ID(id), {
    method: 'DELETE',
  });
}
}

// Instância única do cliente
export const apiClient = new ApiClient();

// Export para uso direto
export default apiClient;
