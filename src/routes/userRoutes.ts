import { FastifyInstance } from "fastify";
import { createUserRoute, deleteUserRoute, getUserByIdRoute, updateUserPasswordRoute, updateUserRoute, validateUserCredentialsRoute} from "../controllers/userController.js";

export async function userRoutes(server: FastifyInstance) {
    server.post("/", createUserRoute);     // POST /usuarios
    server.get("/:id", getUserByIdRoute);     // GET /usuarios/{id}
    server.delete("/:id", deleteUserRoute);     // DELETE /usuarios/{id}
    server.put("/:id", updateUserRoute);     // PUT /usuarios/{id}
    server.patch("/recuperacao/atualizar-senha", updateUserPasswordRoute);     // PATCH usuarios/recuperacao/atualizar-senha
    server.post('/validate-credentials', validateUserCredentialsRoute);     // POST /usuarios/validate-credentials
}
