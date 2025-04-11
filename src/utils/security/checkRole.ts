import { FastifyReply, FastifyRequest } from "fastify";
import { UserTokenInterfaceProps } from "../../interfaces/UserTokenInterfaceProps.js";
import { ErrorResponse } from "../../types/errorResponseType.js";

declare module "fastify" {
  interface FastifyRequest {
    user: UserTokenInterfaceProps;
  }
}

export function checkRole(requiredRole: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      reply.status(401).send({
        error: "Erro de autenticação",
        message: "Usuário não autenticado.",
      });
      return; // Retorne explicitamente
    }

    const userRole = request.user.roleName;

    if (userRole !== requiredRole) {
      const errorValue: ErrorResponse = "Erro de autorização";
      reply.status(403).send({
        error: errorValue,
        message:
          `Permissão insuficiente. Requerido: ${requiredRole}, atual: ${userRole}`.toLowerCase(),
      });
      return; // Retorne explicitamente
    }
  };
}
