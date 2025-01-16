import { FastifyReply, FastifyRequest } from "fastify";
import { userService } from "../services/userService.js";
import { handleError } from "../utils/handlers/handleError.js";
import { CadastreUser } from "../interfaces/cadastreUserInterface.js";
import { LoginUser } from "../interfaces/loginUserInterface.js";

export async function createUserRoute(
  request: FastifyRequest<{ Body: CadastreUser }>,
  reply: FastifyReply
) {
  try {
    const user = await userService.createUser(request.body);
    return reply.status(201).send(user);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getUserByIdRoute(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const user = await userService.getUserById(request.params.id);
    return reply.status(200).send(user);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function deleteUserRoute(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    await userService.deleteUser(request.params.id);
    return reply.status(200).send({ message: "Usuário excluído com sucesso" });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateUserRoute(
  request: FastifyRequest<{
    Params: { id: string };
    Body: Partial<CadastreUser>;
  }>,
  reply: FastifyReply
) {
  try {
    await userService.updateUser(request.params.id, request.body);
    return reply
      .status(200)
      .send({ message: "Usuário atualizado com sucesso" });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateUserPasswordRoute(
  request: FastifyRequest<{
    Body: {
      email: string;
      newPassword: string;
      recoveryCode: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    await userService.updateUserPassword(request.body);
    return reply.status(200).send({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function validateUserCredentialsRoute(
  request: FastifyRequest<{ Body: LoginUser }>,
  reply: FastifyReply
) {
  try {
    const validatedUser = await userService.validateUserCredentials(
      request.body
    );
    console.log(validatedUser);
    
    return reply.status(200).send(validatedUser);
  } catch (error) {
    return handleError(error, reply);
  }
}
