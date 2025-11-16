export interface TokenPayload {
  id_usuario: number;
  nome: string;
  tipo: "cliente" | "funcionario";
  exp: number;
  iat: number;
}
