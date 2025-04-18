import { FastifyReply, FastifyRequest } from "fastify";
import { roleService } from "../services/roleService.js";
import { Role } from "@prisma/client";
import { handleError } from "../utils/handlers/handleError.js";
import { UserRole } from "../types/userRoleType.js";

export async function createRoleRoute(
  request: FastifyRequest<{ Body: Omit<Role, "roleId"> }>,
  reply: FastifyReply
) {
  try {
    const role = await roleService.createRole(request.body);
    return reply.status(200).send(role);
  } catch (error) {
    handleError(error, reply);
  }
}

export async function listRolesRoute(_: FastifyRequest, reply: FastifyReply) {
  try {
    const roles = await roleService.listRoles();
    return reply.status(200).send(roles);
  } catch (error) {
    handleError(error, reply);
  }
}

export async function getRoleRoute(
  request: FastifyRequest<{
    Querystring: {
      roleName: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const roles = await roleService.getRoleByName(request.query.roleName);
    return reply.status(200).send(roles);
  } catch (error) {
    handleError(error, reply);
  }
}
