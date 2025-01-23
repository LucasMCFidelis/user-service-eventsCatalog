import { FastifyInstance } from "fastify";
import { createFavoriteRoute, listFavoritesRoute } from "../controllers/favoriteController.js";

export async function favoriteRoutes(server:FastifyInstance) {
    server.post("/:userId", createFavoriteRoute)
    server.get("/:userId", listFavoritesRoute)
}