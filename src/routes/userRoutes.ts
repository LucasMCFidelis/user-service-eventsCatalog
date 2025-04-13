import { FastifyInstance } from "fastify";
import {
  createUserRoute,
  deleteUserRoute,
  getUserRoute,
  updateUserPasswordRoute,
  updateUserRoleRoute,
  updateUserRoute,
  validateUserCredentialsRoute,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeUserById } from "../middlewares/authorizeUserById.js";
import { CadastreUser } from "../interfaces/cadastreUserInterface.js";
import { checkRole } from "../utils/security/checkRole.js";

export async function userRoutes(server: FastifyInstance) {
  server.post("/", createUserRoute); // POST /users
  server.get<{ Querystring: { userId?: string; userEmail?: string } }>(
    "/",
    { preHandler: [authMiddleware] },
    getUserRoute
  ); // GET /users?userId=123 ou GET /users?userEmail=email@email.com
  server.delete<{ Querystring: { userId: string } }>(
    "/",
    { preHandler: [authMiddleware, authorizeUserById] },
    deleteUserRoute
  ); // DELETE /users/{id}
  server.put<{
    Querystring: { userId: string };
    Body: Partial<CadastreUser>;
  }>(
    "/",
    { preHandler: [authMiddleware, authorizeUserById] },
    updateUserRoute
  ); // PUT /users/{id}
  server.patch("/recuperacao/atualizar-senha", updateUserPasswordRoute); // PATCH users/recuperacao/atualizar-senha
  server.post("/validate-credentials", validateUserCredentialsRoute); // POST /users/validate-credentials
  server.put<{
    Querystring: { userId: string };
    Body: { newRole: string };
  }>(
    "/update-role-user",
    { preHandler: [authMiddleware, checkRole("Admin")] },
    updateUserRoleRoute
  );
}
