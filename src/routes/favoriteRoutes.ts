import { FastifyInstance } from "fastify";
import {
  createFavoriteRoute,
  getFavoriteByIdRoute,
  listFavoritesRoute,
} from "../controllers/favoriteController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeUserById } from "../middlewares/authorizeUserById.js";
import { Favorite } from "@prisma/client";

export async function favoriteRoutes(server: FastifyInstance) {
  server.post<{ Params: { userId: string }; Body: Favorite }>(
    "/:userId",
    { preHandler: [authMiddleware, authorizeUserById] },
    createFavoriteRoute
  );
  server.get<{ Params: { userId: string } }>(
    "/:userId",
    { preHandler: [authMiddleware, authorizeUserById] },
    listFavoritesRoute
  );
  server.get<{ Params: { userId: string; favoriteId: string } }>(
    "/:userId/:favoriteId",
    { preHandler: [authMiddleware, authorizeUserById] },
    getFavoriteByIdRoute
  );
}
