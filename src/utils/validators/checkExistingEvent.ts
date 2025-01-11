import { GetResponse } from "../../interfaces/getResponseInterface.js"
import { prisma } from "../db/prisma.js"

interface checkExistingEventResponse extends GetResponse{
    eventExisting: boolean
}

export async function checkExistingEvent(eventId: string): Promise<checkExistingEventResponse> {
    try {
        const event = await prisma.event.findUnique({
            select: {
                eventId: true
            },
            where: {
                eventId
            }
        })

        if (!event) {
            return {
                status: 404,
                eventExisting: false,
                message: 'Evento não encontrado',
                error: "Erro Not Found"
            }
        }

        return {
            status: 200,
            eventExisting: true,
            error: false
        }
    } catch (error) {
        console.error(error)
        return {
            status: 500,
            eventExisting: false,
            message: 'Erro ao consultar o evento',
            error: "Erro no servidor"
        }
    }
}