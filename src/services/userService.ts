import { CadastreUser } from "../interfaces/cadastreUserInterface.js";
import { schemaId } from "../schemas/schemaId.js";
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

  let newUser;
  try {
    // Criar usuário no banco
    newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phoneNumber,
        password: hashedPassword,
      },
    });
  } catch (error) {
    console.error("Erro ao criar usuário", error);
    throw {
      status: 500,
      message: "Erro interno ao criar usuário",
      error: "Erro no servidor",
    };
  }

  return {
    userId: newUser.userId,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    phoneNumber: newUser.phoneNumber,
  };
}

async function getUserById(userId: string) {
  await schemaId.validateAsync({ id: userId });

  // Buscar o usuário no banco de dados com os campos necessários
  let user;
  try {
    user = await prisma.user.findUnique({
      where: {
        userId,
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar usuário", error);
    throw {
      status: 500,
      message: "Erro interno ao buscar usuário",
      error: "Erro no servidor",
    };
  }

  // Retornar mensagem de erro caso o usuário não seja encontrado
  if (!user) {
    throw {
      status: 404,
      message: "Usuário não encontrado",
      error: "Erro Not Found",
    };
  }

  return user;
}

async function deleteUser(userId: string) {
  // Buscar o usuário no banco de dados
  const user = await getUserById(userId);

  try {
    // Deletar usuário 
    await prisma.user.delete({
      where: {
          userId
      }
  })
  } catch (error) {
    console.error("Erro ao deletar usuário", error);
    throw {
      status: 500,
      message: "Erro interno ao deletar usuário",
      error: "Erro no servidor",
    };
  }
}

export const userService = {
  createUser,
  getUserById,
  deleteUser,
};
