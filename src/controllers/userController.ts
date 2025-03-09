import { FastifyReply, FastifyRequest } from "fastify";
import { userService } from "../services/userService.js";
import { handleError } from "../utils/handlers/handleError.js";
import { CadastreUser } from "../interfaces/cadastreUserInterface.js";
import { LoginUser } from "../interfaces/loginUserInterface.js";
import { UpdateUserPasswordProps } from "../interfaces/UpdateUserPasswordProps.js";

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

export async function getUserRoute(
  request: FastifyRequest<{
    Querystring: { userId?: string; userEmail?: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { userId, userEmail } = request.query;

    if (!userId && !userEmail) {
      return reply.status(400).send({
        status: 400,
        message: "Informe um userId ou userEmail para a busca.",
        error: "Bad Request",
      });
    }

    const user = await userService.getUserByIdOrEmail({ userId, userEmail });
    return reply.status(200).send(user);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function deleteUserRoute(
  request: FastifyRequest<{ Querystring: { userId: string } }>,
  reply: FastifyReply
) {
  try {
    await userService.deleteUser(request.query.userId);
    return reply.status(200).send({ message: "Usuário excluído com sucesso" });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateUserRoute(
  request: FastifyRequest<{
    Querystring: { userId: string };
    Body: Partial<CadastreUser>;
  }>,
  reply: FastifyReply
) {
  try {
    await userService.updateUser(request.query.userId, request.body);
    return reply
      .status(200)
      .send({ message: "Usuário atualizado com sucesso" });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateUserPasswordRoute(
  request: FastifyRequest<{
    Body: UpdateUserPasswordProps;
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
