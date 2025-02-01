import { FastifyInstance } from "fastify";
import { createRoleRoute, listRolesRoute } from "../controllers/rolesController.js";

export async function roleRoutes(server:FastifyInstance) {
    server.post("/", createRoleRoute)
    server.get("/", listRolesRoute)
}