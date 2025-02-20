import { FastifyInstance } from "fastify";
import {
  createFavoriteRoute,
  deleteFavoriteRoute,
  getFavoriteByIdRoute,
  listFavoritesRoute,
} from "../controllers/favoriteController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeUserById } from "../middlewares/authorizeUserById.js";
import { Favorite } from "@prisma/client";

export async function favoriteRoutes(server: FastifyInstance) {
  server.post<{ Querystring: { userId: string }; Body: Favorite }>(
    "/",
    { preHandler: [authMiddleware, authorizeUserById] },
    createFavoriteRoute
  );
  server.get<{ Querystring: { userId: string } }>(
    "/",
    { preHandler: [authMiddleware, authorizeUserById] },
    listFavoritesRoute
  );
  server.get<{ Querystring: { userId?: string }; Params: { favoriteId: string } }>(
    "/:favoriteId",
    { preHandler: [authMiddleware, authorizeUserById] },
    getFavoriteByIdRoute
  );
  server.delete<{ Querystring: { userId: string; favoriteId: string } }>(
    "/",
    { preHandler: [authMiddleware, authorizeUserById] },
    deleteFavoriteRoute
  );
}
