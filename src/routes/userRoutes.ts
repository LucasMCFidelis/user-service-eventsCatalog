import { FastifyInstance } from "fastify";
import { createUserRoute, deleteUserRoute, getUserByIdRoute, updateUserRoute} from "../controllers/userController.js";

export async function userRoutes(server: FastifyInstance) {
    server.post("/", createUserRoute);     // POST /usuarios
    server.get("/:id", getUserByIdRoute);     // GET /usuarios/{id}
    server.delete("/:id", deleteUserRoute);     // DELETE /usuarios/{id}
    server.put("/:id", updateUserRoute);     // PUT /usuarios/{id}
}
