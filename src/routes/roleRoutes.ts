import { FastifyInstance } from "fastify";
import { createRoleRoute, getRoleRoute, listRolesRoute } from "../controllers/rolesController.js";

export async function roleRoutes(server:FastifyInstance) {
    server.post("/", createRoleRoute)
    server.get("/", listRolesRoute)
    server.get<{
        Querystring: {roleName: string};
    }>("/search", getRoleRoute)
}