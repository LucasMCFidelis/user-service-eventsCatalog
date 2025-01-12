import { Role } from "@prisma/client"
import { GetResponse } from "../../interfaces/getResponseInterface.js"
import { prisma } from "./prisma.js"
import { schemaUserUpdate } from "../../schemas/schemaUserUpdate.js"

interface UserAutentication {
    userId: string
    email: string
    password: string
    role: Role
}

interface GetUserResponse extends GetResponse {
    data?: UserAutentication
}

export async function getUserByEmail(userEmail: string): Promise<GetUserResponse> {
    // Validação inicial de entrada
    try {
        await schemaUserUpdate.validateAsync({ email: userEmail })
    } catch (error: any) {
        console.log('aqui');
        
        return {
            status: 400,
            message: error.message.toLowerCase(),
            error: "Erro de validação",
            data: undefined
        }
    }

    try {
        // Buscar usuário no banco de dados com base no email fornecido
        const user = await prisma.user.findUnique({
            where: {
                email: userEmail.toLowerCase()
            },
            select: {
                userId: true,
                email: true,
                password: true,
                role: {
                    select: {
                        roleId: true,
                        roleName: true,
                        roleDescription: true
                    }
                }
            }
        })

        // Retorno caso o usuário não seja encontrado
        if (!user) {
            return {
                status: 404,
                message: "Nenhum usuário encontrado com este email",
                error: "Erro Not Found",
                data: undefined
            }
        }

        // Retorno bem-sucedido com os dados do usuário
        return {
            status: 200,
            data: user,
            message: "Usuário encontrado com sucesso",
            error: false
        }
    } catch (error) {
        console.error("Erro ao buscar usuário", error)
        return {
            status: 500,
            message: "Erro interno ao buscar usuário",
            error: "Erro no servidor",
            data: undefined
        }
    }
}