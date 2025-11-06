/**
 * Cliente para integração com Ollama (LLM local)
 * Não requer API key - roda 100% localmente
 */

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  text: string;
  model: string;
  tokensUsed?: number;
  duration?: number;
}

export interface OllamaClientConfig {
  baseUrl?: string;
  model?: string;
}

const DEFAULT_MODEL = "llama3.2:1b";
const DEFAULT_BASE_URL = "http://localhost:11434";

export class OllamaClient {
  private baseUrl: string;
  private model: string;

  constructor(config?: OllamaClientConfig) {
    this.baseUrl = config?.baseUrl || process.env.OLLAMA_BASE_URL || DEFAULT_BASE_URL;
    this.model = config?.model || process.env.OLLAMA_MODEL || DEFAULT_MODEL;
  }

  /**
   * Envia mensagens para o modelo e recebe resposta
   */
  async chat(messages: AIChatMessage[]): Promise<AIResponse> {
    try {
      const requestBody = {
        model: this.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: false,
        options: {
          num_ctx: 2048,        // Contexto menor (padrão 4096)
          num_predict: 256,      // Máximo de tokens na resposta
          temperature: 0.7,
        },
      };
      
      console.log("🤖 Chamando Ollama:");
      console.log("  - Model:", this.model);
      console.log("  - URL:", `${this.baseUrl}/api/chat`);
      console.log("  - Messages:", messages.length);
      
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📡 Ollama response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Ollama error body:", errorText);
        throw new Error(
          `Ollama error (${response.status}): ${response.statusText}`
        );
      }

      const data = await response.json();

      return {
        text: data.message.content,
        model: data.model,
        tokensUsed: data.eval_count || 0,
        duration: data.total_duration ? data.total_duration / 1e9 : undefined,
      };
    } catch (error) {
      console.error("Erro ao chamar Ollama:", error);
      throw error;
    }
  }

  /**
   * Verifica se o Ollama está rodando
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Lista modelos disponíveis
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      return data.models.map((m: any) => m.name);
    } catch {
      return [];
    }
  }
}

/**
 * Helper para redação de PII (dados sensíveis)
 */
export function redactPII(text: string): string {
  return text
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "[CPF_REDACTED]")
    .replace(/\b\d{11}\b/g, "[CPF_REDACTED]")
    .replace(/\b\d{4,20}\b/g, "[NUMERO_CONTA_REDACTED]")
    .replace(/R\$\s*[\d.,]+/gi, "[VALOR_REDACTED]");
}

/**
 * Detecta se texto contém PII sensível
 */
export function containsSensitiveData(text: string): boolean {
  const patterns = [
    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/,
    /\b\d{11}\b/,
    /senha|password/i,
    /\d{4,20}/,
  ];

  return patterns.some((pattern) => pattern.test(text));
}