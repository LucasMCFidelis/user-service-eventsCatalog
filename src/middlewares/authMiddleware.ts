import axios from "axios";
import { FastifyReply, FastifyRequest } from "fastify";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authorizationHeader = request.headers.authorization;
  if (!authorizationHeader) {
    return reply.status(401).send({ message: "Token não fornecido" });
  }

  const token = authorizationHeader.replace("Bearer ", "");

  try {
    // Envia o token para o serviço de autenticação
    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/validate-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Validação bem-sucedida: anexa os dados do usuário ao request
    request.user = response.data.decoded;
  } catch (error) {
    // Garantia de tipo para `error`
    if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 500;
        const errorMessage =
          error.response?.data?.message || "Erro ao validar token";
  
        return reply.status(statusCode).send({
          message: errorMessage,
          error: "Autenticação falhou",
        });
      }
  
      // Tratamento genérico para erros desconhecidos
      return reply.status(500).send({
        message: "Erro interno ao validar token",
        error: "Erro desconhecido",
      });
  }
}
