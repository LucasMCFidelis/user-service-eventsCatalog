import { FastifyReply, FastifyRequest } from "fastify";
import { ErrorResponse } from "../types/errorResponseType.js";
import { schemaId } from "../schemas/schemaId.js";
import { handleError } from "../utils/handlers/handleError.js";

export async function authorizeUserById(
  request: FastifyRequest<{ Querystring: { userId?: string } }>,
  reply: FastifyReply
) {
  const { user } = request;
  const targetUserId = request.query.userId; // Supõe que o ID alvo está nos parâmetros da rota
  try {
    await schemaId.validateAsync({ id: targetUserId });
  } catch (error) {
    handleError(error, reply);
  }

  if (user.roleName === "Admin") {
    return;
  }

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
