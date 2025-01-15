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
  server.post("/", createUserRoute); // POST /usuarios
  server.get<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [authMiddleware, authorizeUserById] },
    getUserByIdRoute
  ); // GET /usuarios/{id}
  server.delete<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [authMiddleware, authorizeUserById] },
    deleteUserRoute
  ); // DELETE /usuarios/{id}
  server.put<{
    Params: { id: string };
    Body: Partial<CadastreUser>;
  }>(
    "/:id",
    { preHandler: [authMiddleware, authorizeUserById] },
    updateUserRoute
  ); // PUT /usuarios/{id}
  server.patch("/recuperacao/atualizar-senha", updateUserPasswordRoute); // PATCH usuarios/recuperacao/atualizar-senha
  server.post("/validate-credentials", validateUserCredentialsRoute); // POST /usuarios/validate-credentials
}
