import bcrypt from "bcrypt";
import { z } from "zod";

/**
 * Enum dos tipos de usuário conforme Prisma
 */
export const usuarioTipoEnum = z.enum(["FUNCIONARIO", "CLIENTE"]);

/**
 * Esquema de payload do JWT conforme seu modelo `usuario`
 * Inclui apenas dados úteis para autenticação/autorização
 */
export const tokenPayloadSchema = z.object({
  id_usuario: z.number(),
  id_cliente: z.number().optional(),
  id_funcionario: z.number().optional(),
  nome: z.string(),
  tipo_usuario: usuarioTipoEnum,
});

/**
 * Tipo inferido do esquema — substitui o `any`
 */
export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

/**
 * Número de rounds para o salt do bcrypt
 */
const SALT_ROUNDS = 12;

/**
 * Gera um hash seguro da senha usando bcrypt
 */
export async function hashSenha(senha: string): Promise<string> {
  return await bcrypt.hash(senha, SALT_ROUNDS);
}

/**
 * Compara uma senha em texto plano com um hash
 */
export async function verificarSenha(
  senha: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(senha, hash);
}

/**
 * Gera um token JWT simples (codificado em Base64)
 * ⚠️ Em produção use jsonwebtoken ou next-auth
 */
export function gerarToken(payload: TokenPayload): string {
  tokenPayloadSchema.parse(payload); // valida o formato
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * Verifica e decodifica um token
 * Retorna o payload validado ou null se for inválido
 */
export function verificarToken(token: string): TokenPayload | null {
  try {
    const json = JSON.parse(Buffer.from(token, "base64").toString());
    return tokenPayloadSchema.parse(json);
  } catch {
    return null;
  }
}
