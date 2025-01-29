import { FastifyInstance } from "fastify";
import {
  createUserRoute,
  deleteUserRoute,
  getUserByIdRoute,
  updateUserPasswordRoute,
  updateUserRoute,
  validateUserCredentialsRoute,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeUserById } from "../middlewares/authorizeUserById.js";
import { CadastreUser } from "../interfaces/cadastreUserInterface.js";

export async function userRoutes(server: FastifyInstance) {
  server.post("/", createUserRoute); // POST /users
  server.get<{ Params: { userId: string } }>(
    "/:id",
    { preHandler: [authMiddleware, authorizeUserById] },
    getUserByIdRoute
  ); // GET /users/{id}
  server.delete<{ Params: { userId: string } }>(
    "/:id",
    { preHandler: [authMiddleware, authorizeUserById] },
    deleteUserRoute
  ); // DELETE /users/{id}
  server.put<{
    Params: { userId: string };
    Body: Partial<CadastreUser>;
  }>(
    "/:id",
    { preHandler: [authMiddleware, authorizeUserById] },
    updateUserRoute
  ); // PUT /users/{id}
  server.patch("/recuperacao/atualizar-senha", updateUserPasswordRoute); // PATCH users/recuperacao/atualizar-senha
  server.post("/validate-credentials", validateUserCredentialsRoute); // POST /users/validate-credentials
}
