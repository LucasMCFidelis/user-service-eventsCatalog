import { GetResponse } from "../../interfaces/getResponseInterface.js"
import { prisma } from "../db/prisma.js"

interface checkExistingEventCategoryResponse extends GetResponse{
    categoryExisting: boolean
}

export async function checkExistingEventCategory(categoryId: string): Promise<checkExistingEventCategoryResponse> {
    try {
        const category = await prisma.eventCategory.findUnique({
            select: {
                categoryId: true
            },
            where: {
                categoryId
            }
        })

        if (!category) {
            return {
                status: 404,
                categoryExisting: false,
                message: 'Categoria não encontrada',
                error: "Erro Not Found"
            }
        }

        return {
            status: 200,
            categoryExisting: true,
            error: false
        }
    } catch (error) {
        console.error(error)
        return {
            status: 500,
            categoryExisting: false,
            message: 'Erro ao consultar categoria do evento',
            error: "Erro no servidor"
        }
    }
}