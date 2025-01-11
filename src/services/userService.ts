import { CadastreUser } from "../interfaces/cadastreUserInterface.js";
import { schemaUserCadastre } from "../schemas/schemaUserCadastre.js";
import { schemaUserPassword } from "../schemas/schemaUserPassword.js";
import { prisma } from "../utils/db/prisma.js";
import { hashPassword } from "../utils/security/hashPassword.js";
import { checkExistingUser } from "../utils/validators/checkExistingUser.js";

async function createUser(data: CadastreUser) {
  const { firstName, lastName, email, phoneNumber, password } = data;

  // Validação dos dados com schemas
  await schemaUserCadastre.concat(schemaUserPassword).validateAsync({
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
  });

  // Verificar se o usuário já existe
  const emailCheckResponse = await checkExistingUser(email);
  if (emailCheckResponse.existingUser || emailCheckResponse.error) {
    throw {
      status: emailCheckResponse.status,
      error: emailCheckResponse.error,
      message: emailCheckResponse.message,
    };
  }

  // Criptografar a senha
  const hashedPassword = await hashPassword(password);

  // Criar usuário no banco
  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: email.toLowerCase(),
      phoneNumber,
      password: hashedPassword,
    },
  });

  return {
    userId: newUser.userId,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    phoneNumber: newUser.phoneNumber,
  };
}

export const userService = {
  createUser
};
