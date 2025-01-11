import { FastifyInstance } from "fastify";
import { createUserRoute} from "../controllers/userController.js";

export async function userRoutes(server: FastifyInstance) {
    server.post("/", createUserRoute);     // POST /usuarios
}
