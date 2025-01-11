import { ErrorResponse } from "../types/errorResponseType.js"

export interface GetResponse {
    status: number
    message?: string
    error?: ErrorResponse
}