import { FastifyReply, FastifyRequest } from "fastify";
import { handleError } from "../utils/handlers/handleError.js";
import { favoriteService } from "../services/favoriteService.js";
import { Favorite } from "@prisma/client";
import { userService } from "../services/userService.js";

export async function createFavoriteRoute(request:FastifyRequest<{Params: {userId: string}, Body: Favorite}>, reply: FastifyReply) {
    try {
        const newFavorite = await favoriteService.createFavorite(request.body)
        return reply.status(200).send(newFavorite)
    } catch (error) {
        handleError(error, reply)
    }
}

export async function listFavoritesRoute(request:FastifyRequest<{Params: {userId: string}}>, reply: FastifyReply) {
    try {
        const eventFavorites = await favoriteService.listFavorites(request.params.userId)
        return reply.status(200).send(eventFavorites)
    } catch (error) {
        handleError(error, reply)
    }
}

export async function getFavoriteByIdRoute(request:FastifyRequest<{Params: {userId: string, favoriteId: string}}>, reply: FastifyReply) {
    try {
        await userService.getUserById(request.params.userId)
        const eventFavorite = await favoriteService.getFavoriteById(request.params.favoriteId)
        return reply.status(200).send(eventFavorite)
    } catch (error) {
        handleError(error, reply)
    }
}

export async function deleteFavoriteRoute(request:FastifyRequest<{Params: {userId: string, favoriteId: string}}>, reply: FastifyReply) {
    try {
        await favoriteService.deleteFavorite(request.params.favoriteId)
        return reply.status(200).send({message: "Favorito excluído com sucesso"})
    } catch (error) {
        handleError(error, reply)
    }
}