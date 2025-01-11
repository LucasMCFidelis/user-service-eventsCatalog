import { GetResponse } from "../../interfaces/getResponseInterface.js"
import { Role } from "../../interfaces/roleInterface.js"
import { schemaId } from "../../schemas/schemaId.js"
import { prisma } from "./prisma.js"

interface Usuario {
    userId: string
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string | null
    role: Role | null
}

interface GetUserResponse extends GetResponse{
    data?: Usuario | null
}

export async function getUserById(userId: string): Promise<GetUserResponse> {
    // Validar o ID utilizando o schemaId
    const { error } = schemaId.validate({ id: userId });
    if (error) {
        // Retornar mensagem de erro caso a validação falhe
        return {
            status: 400,
            message: error.message ,
            error: "Erro de validação"
        }
    }

    try {
        // Buscar o usuário no banco de dados com os campos necessários
        const user = await prisma.user.findUnique({
            where: {
                userId
            },
            select: {
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                role: true
            }
        })

        // Retornar mensagem de erro caso o usuário não seja encontrado
        if (!user) {
            return {
                status: 404,
                message: "Usuário não encontrado",
                error: "Erro Not Found"
            }
        }

        // Retornar o usuário encontrado
        return {
            status: 200,
            data: user,
            error: false
        }
    } catch (error) {
        console.error("Erro ao buscar usuário", error)
        return {
            status: 500,
            message: "Erro interno ao buscar usuário",
            error: "Erro no servidor"
        }
    }
}