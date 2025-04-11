import { schemaUserCadastre } from "../../schemas/schemaUserCadastre.js";
import { schemaUserPassword } from "../../schemas/schemaUserPassword.js";
import { schemaUserRole } from "../../schemas/schemaUserRole.js";
import { roleService } from "../../services/roleService.js";
import { hashPassword } from "../security/hashPassword.js";
import { prisma } from "./prisma.js";

async function seedRoles() {
  console.log("Iniciando seedRoles...");
  const existingRoles = await roleService.listRoles()
  if (existingRoles) {
    console.log("Roles já foram criados.");
    return;
  }

  const userRolesEnv = process.env.USER_ROLES;
  if (!userRolesEnv) {
    console.error("É necessário cadastrar a variável ambiente USER_ROLES");
    return;
  }

  let userRoles;
  try {
    userRoles = JSON.parse(userRolesEnv);
  } catch (error: any) {
    console.error("Erro ao interpretar USER_ROLES:", error.message);
    return;
  }

  for (const role of userRoles) {
    try {
      await roleService.createRole(role)
      console.log(`Role "${role.roleName}" criada.`);
    } catch (error: any) {
      console.error("Erro ao criar role:", error.message);
    }
  }
  console.log("Papéis criados com sucesso!");
}

async function seedAdmins() {
  console.log("Iniciando seedAdmins...");
  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    console.log("Seed já foi executado.");
    return;
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error("É necessário cadastrar a variável ambiente ADMIN_PASSWORD");
    return;
  }

  const dataAdminsEnv = process.env.ADMIN_DATA;
  if (!dataAdminsEnv) {
    console.error("É necessário cadastrar a variável ambiente ADMIN_DATA");
    return;
  }

  let dataAdmins;
  try {
    dataAdmins = JSON.parse(dataAdminsEnv);
  } catch (error: any) {
    console.error("Erro ao interpretar ADMIN_DATA:", error.message);
    return;
  }

  const hashedPassword = await hashPassword(password);

  const roleResponse = await roleService.getRoleByName("Admin");

  for (const admin of dataAdmins) {
    try {
      await schemaUserCadastre.concat(schemaUserPassword).validateAsync({
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        password,
      });

      await prisma.user.create({
        data: {
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email.toLowerCase(),
          password: hashedPassword,
          roleId: roleResponse?.data?.roleId,
        },
      });

      console.log(`Admin "${admin.firstName}" criado.`);
    } catch (error: any) {
      console.error(`Erro ao criar admin "${admin.firstName}":`, error.message);
    }
  }

  console.log("Admins criados com sucesso!");
}

async function main() {
  try {
    await Promise.all([
      seedRoles(),
      seedAdmins()
    ])
    console.log("Seed executado com sucesso.");
  } catch (error: any) {
    console.error("Erro durante a execução do seed:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
