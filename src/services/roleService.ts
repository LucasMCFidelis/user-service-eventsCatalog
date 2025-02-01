import { Role } from "@prisma/client";
import { schemaUserRole } from "../schemas/schemaUserRole.js";
import { prisma } from "../utils/db/prisma.js";

async function createRole(data: Omit<Role, "roleId">) {
  await schemaUserRole.validateAsync(data);

  let newRole;
  try {
    newRole = await prisma.role.create({
      data: {
        roleName: data.roleName,
        ...(data.roleDescription && { roleDescription: data.roleDescription }),
      },
    });
  } catch (error) {
    console.error("Erro ao criar permissão", error);
    throw {
      status: 500,
      message: "Erro interno ao criar permissão",
      error: "Erro no servidor",
    };
  }

  return newRole;
}

async function listRoles() {
  let roles;
  try {
    roles = await prisma.role.findMany({
      orderBy: { roleName: "asc" },
    });
  } catch (error) {
    console.error("Erro ao consultar as permissões", error);
    throw {
      status: 500,
      message: "Erro interno ao consultar as permissões",
      error: "Erro no servidor",
    };
  }

  if (roles.length === 0) {
    throw {
      status: 404,
      error: "Erro Not Found",
      message: "Não foi encontrada nenhuma permissão cadastrada",
    };
  }

  return roles;
}

export const roleService = {
  createRole,
  listRoles,
};
