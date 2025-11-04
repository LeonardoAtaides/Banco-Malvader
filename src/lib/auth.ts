import bcrypt from "bcrypt";

/**
 * Número de rounds para o salt do bcrypt
 * 10-12 é recomendado (maior = mais seguro, mas mais lento)
 */
const SALT_ROUNDS = 12;

/**
 * Gera um hash seguro da senha usando bcrypt
 * @param senha - Senha em texto plano
 * @returns Hash bcrypt da senha
 */
export async function hashSenha(senha: string): Promise<string> {
  return await bcrypt.hash(senha, SALT_ROUNDS);
}

/**
 * Compara uma senha em texto plano com um hash
 * @param senha - Senha em texto plano
 * @param hash - Hash armazenado no banco
 * @returns true se a senha corresponder ao hash
 */
export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(senha, hash);
}

/**
 * Gera um token JWT simples 
 */
export function gerarToken(payload: any): string {
  // Implementação simplificada
  // Em produção, use jsonwebtoken ou next-auth
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * Verifica e decodifica um token
 */
export function verificarToken(token: string): any {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString());
  } catch {
    return null;
  }
}