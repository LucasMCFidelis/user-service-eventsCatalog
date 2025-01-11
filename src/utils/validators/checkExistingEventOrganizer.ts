import { GetResponse } from "../../interfaces/getResponseInterface.js"
import { prisma } from "../db/prisma.js"

interface CheckExistingEventOrganizerResponse extends GetResponse {
    existingEventOrganizer: boolean
}

export async function checkExistingEventOrganizer( organizerEmail: string): Promise<CheckExistingEventOrganizerResponse> {
    try {
        const existingEventOrganizer = await prisma.eventOrganizer.findUnique({
            where: { organizerEmail:  organizerEmail.toLowerCase() },
            select: { organizerEmail: true }
        })

        if (existingEventOrganizer) {
            return {
                status: 409,
                existingEventOrganizer: true,
                message: 'Este e-mail já está cadastrado.',
                error: "Erro de Conflito"
            }
        }

        return {
            status: 200,
            existingEventOrganizer: false,
            message: 'E-mail disponível para cadastro.',
            error: false
        }
    } catch (error) {
        console.error(error)
        return {
            status: 500,
            existingEventOrganizer: false,
            message: 'Erro ao verificar existência do organizador.',
            error: "Erro no servidor"
        }
    }
}