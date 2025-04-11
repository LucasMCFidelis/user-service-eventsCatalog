import { Role } from "@prisma/client";
import { schemaUserRole } from "../schemas/schemaUserRole.js";
import { prisma } from "../utils/db/prisma.js";
import { UserRole } from "../types/userRoleType.js";
import { ValidateRoleName } from "../utils/validators/validateRoleName.js";
import { GetResponse } from "../interfaces/getResponseInterface.js";

interface GetRoleResponse extends GetResponse {
  data?: Role;
}

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

async function getRoleByName(
  roleName: string
): Promise<GetRoleResponse> {
  try {
    console.log("roleName em getRoleByName:", roleName);
    
    // Validação do newRole usando o enum
    const validRoleName = ValidateRoleName(roleName)
    if (!validRoleName) {
      return {
        status: 400,
        message: "Papel inválido. Somente 'Admin' ou 'User' são aceitos.",
        error: "Erro de validação",
      };
    }

    // Busca pelo nome da role
    const role = await prisma.role.findUnique({
      where: { roleName },
    });

    // Verifica de a Role foi encontrada
    if (!role) {
      return {
        status: 404,
        message: "Role não encontrada",
        error: "Erro Not Found",
      };
    }

    // Monta objeto de acordo com a interface Role
    const roleData: Role = {
      roleId: role.roleId,
      roleName: role.roleName as UserRole,
      roleDescription: role.roleDescription,
    };

    // Sucesso, então retorna o objeto roleData
    return {
      status: 200,
      data: roleData,
      error: false,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: "Erro ao buscar a role",
      error: "Erro no servidor",
    };
  }
}


export const roleService = {
  createRole,
  listRoles,
  getRoleByName,
};
