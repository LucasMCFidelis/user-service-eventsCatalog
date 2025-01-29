import { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponse } from "../types/errorResponseType.js";

export async function authorizeUserById(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) {
  const { user } = request;
  const targetUserId = request.params.userId; // Supõe que o ID alvo está nos parâmetros da rota

  // Verifica se o usuário logado é o mesmo que o alvo da operação
  if (!user || targetUserId !== user.userId) {
    const errorValue: ErrorResponse = "Erro de autorização";
    return reply.status(403).send({
      error: errorValue,
      message:
        "Acesso negado. O ID do usuário logado não corresponde ao ID solicitado para a operação.",
    });
  }
}
