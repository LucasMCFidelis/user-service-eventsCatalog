import { GetResponse } from "../../interfaces/getResponseInterface.js";
import { prisma } from "../../utils/db/prisma.js";

interface CodeValidationProps {
    userEmail: string, 
    recoveryCode: string
}

export async function validateRecoveryCode({userEmail, recoveryCode}: CodeValidationProps): Promise<GetResponse> {
  try {
    // Buscar o código de recuperação associado ao usuário no banco de dados
    const recoveryRecord = await prisma.recoveryCode.findFirst({
      where: {
        userEmail: userEmail.toLowerCase(),
        code: recoveryCode,
      },
    });

    // Se não houver registro do código, retornar erro
    if (!recoveryRecord) {
      return { 
        status: 400,
        error: "Erro de validação", 
        message: "Código de recuperação inválido" 
    };
    }

    // Verificar se o código expirou (supondo que tenha uma data de expiração 'expiresAt')
    const currentTime = new Date();
    if (currentTime > new Date(recoveryRecord.expiresAt)) {
      return { 
        status: 400,
        error: "Erro de validação", 
        message: "Código de recuperação expirado" 
        };
    }

    // Se o código for válido e não expirado
    return { 
        status: 200,
        error: false, 
        message: "Código válido" 
    };

  } catch (error) {
    // Caso ocorra algum erro no banco de dados
    console.error(error);
    return { 
        status: 500,
        error: "Erro no servidor", 
        message: "Erro ao validar o código de recuperação" 
    };
  }
}
