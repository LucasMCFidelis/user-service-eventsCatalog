import { schemaUserCadastre } from "../../schemas/schemaUserCadastre.js";
import { schemaUserPassword } from "../../schemas/schemaUserPassword.js";
import { roleService } from "../../services/roleService.js";
import { hashPassword } from "../security/hashPassword.js";
import { prisma } from "./prisma.js";

async function seedRoles() {
  console.log("Iniciando seedRoles...");

  try {
    const existingRoles = await prisma.role.findMany();

    if (existingRoles.length > 0) {
      console.log("Roles já foram criados.");
      return;
    }

    const userRolesEnv = process.env.USER_ROLES;
    if (!userRolesEnv) {
      throw new Error("É necessário cadastrar a variável ambiente USER_ROLES");
    }

    const userRoles = JSON.parse(userRolesEnv);

    for (const role of userRoles) {
      try {
        await roleService.createRole(role);
        console.log(`Role "${role.roleName}" criada.`);
      } catch (error: any) {
        console.error("Erro ao criar role:", error.message);
      }
    }

    console.log("Papéis criados com sucesso!");
  } catch (error: any) {
    console.error("Erro em seedRoles:", error.message);
  }
}

async function seedAdmins() {
  console.log("Iniciando seedAdmins...");

  try {
    const existingUser = await prisma.user.findFirst();
    if (existingUser) {
      console.log("Seed já foi executado.");
      return;
    }

    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      throw new Error("É necessário cadastrar a variável ambiente ADMIN_PASSWORD");
    }

    const dataAdminsEnv = process.env.ADMIN_DATA;
    if (!dataAdminsEnv) {
      throw new Error("É necessário cadastrar a variável ambiente ADMIN_DATA");
    }

    const dataAdmins = JSON.parse(dataAdminsEnv);
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
  } catch (error: any) {
    console.error("Erro em seedAdmins:", error.message);
  }
}

async function main() {
  try {
    await seedRoles();
    await seedAdmins();
    console.log("Seed executado com sucesso.");
  } catch (error: any) {
    console.error("Erro durante a execução do seed:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
