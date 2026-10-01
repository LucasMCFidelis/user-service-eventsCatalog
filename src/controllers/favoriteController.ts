import { FastifyReply, FastifyRequest } from "fastify";
import { handleError } from "../utils/handlers/handleError.js";
import { favoriteService } from "../services/favoriteService.js";
import { userService } from "../services/userService.js";

export async function createFavoriteRoute(request: FastifyRequest<{ Querystring: { userId: string, eventId: string } }>, reply: FastifyReply) {
    const scenarioHeader = request.headers["x-mock-event-scenario"];

    const scenario =
        process.env.ACTIVE_MOCK === "true" && typeof scenarioHeader === "string"
            ? scenarioHeader
            : undefined;

    try {
        const newFavorite = await favoriteService.createFavorite(request.query.userId, request.query.eventId, scenario)
        return reply.status(200).send(newFavorite)
    } catch (error) {
        handleError(error, reply)
    }
}

export async function listFavoritesRoute(request: FastifyRequest<{ Querystring: { userId: string } }>, reply: FastifyReply) {
    try {
        const eventFavorites = await favoriteService.listFavorites(request.query.userId)
        return reply.status(200).send(eventFavorites)
    } catch (error) {
        handleError(error, reply)
    }
}

export async function getFavoriteByIdRoute(request: FastifyRequest<{ Querystring: { userId: string, favoriteId: string } }>, reply: FastifyReply) {
    try {
        await userService.getUserByIdOrEmail({ userId: request.query.userId })
        const eventFavorite = await favoriteService.getFavoriteById(request.query.favoriteId)
        return reply.status(200).send(eventFavorite)
    } catch (error) {
        handleError(error, reply)
    }
}

export async function deleteFavoriteRoute(request: FastifyRequest<{ Querystring: { userId: string, favoriteId: string } }>, reply: FastifyReply) {
    try {
        await favoriteService.deleteFavorite(request.query.favoriteId)
        return reply.status(200).send({ message: "Favorito excluído com sucesso" })
    } catch (error) {
        handleError(error, reply)
    }
}