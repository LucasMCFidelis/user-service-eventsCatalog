import axios from "axios";
import { CadastreUser } from "../interfaces/cadastreUserInterface.js";
import { CodeValidationProps } from "../interfaces/CodeValidationProps.js";
import { schemaId } from "../schemas/schemaId.js";
import { schemaUserCadastre } from "../schemas/schemaUserCadastre.js";
import { schemaUserPassword } from "../schemas/schemaUserPassword.js";
import { schemaUserUpdate } from "../schemas/schemaUserUpdate.js";
import { getUserByEmail } from "../utils/db/getUserByEmail.js";
import { prisma } from "../utils/db/prisma.js";
import { hashPassword } from "../utils/security/hashPassword.js";
import { checkExistingUser } from "../utils/validators/checkExistingUser.js";
import { LoginUser } from "../interfaces/loginUserInterface.js";
import { comparePasswords } from "../utils/security/comparePasswords.js";
import { UserTokenInterfaceProps } from "../interfaces/UserTokenInterfaceProps.js";
import { handleAxiosError } from "../utils/handlers/handleAxiosError.js";
import { schemaUserUpdatePassword } from "../schemas/schemaUserUpdatePassword.js";
import { UpdateUserPasswordProps } from "../interfaces/UpdateUserPasswordProps.js";
import { roleService } from "./roleService.js";
import { ErrorResponse } from "../types/errorResponseType.js";

const emailServiceUrl = process.env.EMAIL_SERVICE_URL;
const authServiceUrl = process.env.AUTH_SERVICE_URL;

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

  try {
    const response = await axios.post(`${authServiceUrl}/login`, {
      userEmail: email,
      passwordProvided: password,
    });
    return {
      userId: newUser.userId,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      userToken: response.data.userToken,
    };
  } catch (error) {
    handleAxiosError(error);
  }
}

async function getUserByIdOrEmail(
  params: { userId?: string; userEmail?: string },
  includeFavorites: boolean = false
) {
  const { userId, userEmail } = params;

  if (!userId && !userEmail) {
    throw {
      status: 400,
      message: "Informe um userId ou userEmail para a busca.",
      error: "Bad Request",
    };
  }

  if (userEmail) {
    await schemaUserUpdate.validateAsync({ email: userEmail });
  } else if (userId) {
    await schemaId.validateAsync({ id: userId });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ userId }, { email: userEmail }],
    },
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      role: true,
      eventFavorites: includeFavorites,
    },
  });

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
  const user = await getUserByIdOrEmail({ userId });

  try {
    // Deletar usuário
    await prisma.user.delete({
      where: {
        userId,
      },
    });
  } catch (error) {
    console.error("Erro ao deletar usuário", error);
    throw {
      status: 500,
      message: "Erro interno ao deletar usuário",
      error: "Erro no servidor",
    };
  }
}

async function updateUser(userId: string, data: Partial<CadastreUser>) {
  // Buscar o usuário no banco de dados
  const user = await getUserByIdOrEmail({ userId });

  // Valida o corpo da requisição com schemaUserUpdate
  const userData = await schemaUserUpdate.validateAsync(data);
  const { firstName, lastName, email, phoneNumber } = userData;

  // Checa se o email já existe, exceto para o email atual do usuário
  if (email !== user.email) {
    const emailCheckResponse = await checkExistingUser(email);
    if (emailCheckResponse.existingUser || emailCheckResponse.error) {
      throw {
        status: emailCheckResponse.status,
        error: emailCheckResponse.error,
        message: emailCheckResponse.message,
      };
    }
  }

  try {
    // Atualiza o usuário no banco de dados
    await prisma.user.update({
      where: {
        userId: user.userId,
      },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email: email.toLowerCase() }),
        ...(phoneNumber && { phoneNumber }),
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário", error);
    throw {
      status: 500,
      message: "Erro interno ao atualizar usuário",
      error: "Erro no servidor",
    };
  }
}

async function updateUserPassword(data: UpdateUserPasswordProps) {
  await schemaUserUpdatePassword.validateAsync(data);
  // Extrair email e senha fornecida do corpo da requisição
  const { email, newPassword, recoveryCode } = data;

  // Buscar o usuário no banco de dados utilizando a função utilitária
  const user = await getUserByIdOrEmail({ userEmail: email });

  await validateRecoveryCode({
    userEmail: email,
    recoveryCode,
  });

  try {
    // Gerar o hash da nova senha fornecida
    const newPasswordHash = await hashPassword(newPassword);

    // Atualizar o usuário com a nova senha
    await prisma.user.update({
      where: {
        userId: user.userId,
      },
      data: {
        password: newPasswordHash,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar senha do usuário", error);
    throw {
      status: 500,
      message: "Erro interno ao atualizar senha do usuário",
      error: "Erro no servidor",
    };
  }
}

async function validateRecoveryCode({
  userEmail,
  recoveryCode,
}: CodeValidationProps): Promise<void> {
  // Realiza a chamada para a API do emailService
  try {
    await axios.post(`${emailServiceUrl}/validate-recovery-code`, {
      userEmail,
      recoveryCode,
    });
  } catch (error) {
    handleAxiosError(error);
  }
  return;
}

async function validateUserCredentials(
  data: LoginUser
): Promise<UserTokenInterfaceProps> {
  const userResponse = await getUserByEmail(data.userEmail);
  if (!userResponse.data || userResponse.error) {
    throw {
      status: userResponse.status,
      message: "Usuário não encontrado",
      error: userResponse.error,
    };
  }

  const isPasswordValid = await comparePasswords(
    data.passwordProvided,
    userResponse.data.password
  );
  if (!isPasswordValid) {
    throw {
      status: 401,
      message: "Credenciais inválidas",
      error: "Erro de autenticação",
    };
  }

  return {
    userId: userResponse.data.userId,
    userEmail: userResponse.data.email,
    roleName: userResponse.data.role.roleName,
  };
}

async function updateUserRole(userId: string, newRole: string) {
  console.log(userId, newRole);

  const [user, role] = await Promise.all([
    getUserByIdOrEmail({ userId }),
    roleService.getRoleByName(newRole),
  ]);

  if (user.role?.roleName === newRole) {
    const errorValue: ErrorResponse = "Erro de Conflito";
    throw {
      status: 409,
      error: errorValue,
      message: `O usuário ${user.firstName} já possui a permissão ${newRole}`,
    };
  }

  try {
    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        roleId: role.data?.roleId,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar permissão do usuário", error);
    throw {
      status: 500,
      message: "Erro interno ao atualizar permissão do usuário",
      error: "Erro no servidor",
    };
  }
}

export const userService = {
  createUser,
  getUserByIdOrEmail,
  deleteUser,
  updateUser,
  updateUserPassword,
  validateUserCredentials,
  updateUserRole,
};
