import { FastifyReply, FastifyRequest } from "fastify";
import { userService } from "../services/userService.js";
import { handleError } from "../utils/handlers/handleError.js";
import { CadastreUser } from "../interfaces/cadastreUserInterface.js";

export async function createUserRoute(req: FastifyRequest<{Body: CadastreUser}>, reply: FastifyReply) {
    try {
        const user = await userService.createUser(req.body);
        return reply.status(201).send(user);
    } catch (error) {
        return handleError(error, reply);
    }
}

export async function getUserByIdRoute(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
        const user = await userService.getUserById(req.params.id);
        return reply.status(200).send(user);
    } catch (error) {
        return handleError(error, reply);
    }
}

export async function deleteUserRoute(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
        await userService.deleteUser(req.params.id);
        return reply.status(204).send({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
        return handleError(error, reply);
    }
}