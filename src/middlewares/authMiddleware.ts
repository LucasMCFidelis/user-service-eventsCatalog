import axios from "axios";
import { FastifyReply, FastifyRequest } from "fastify";
import { handleAxiosError } from "../utils/handlers/handleAxiosError.js";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authorizationHeader = request.headers.authorization;
  if (!authorizationHeader) {
    throw reply.status(401).send({ message: "Token não fornecido", error: "Erro de autenticação", });
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
    handleAxiosError(error)
  }
}
