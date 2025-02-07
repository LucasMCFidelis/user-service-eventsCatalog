import Joi from "joi"
import { schemaUserPassword } from "./schemaUserPassword.js"

export const schemaUserUpdatePassword = Joi.object({
    email: Joi.string().email().required().messages({
        'any.required': 'Email é obrigatório',
        'string.base': 'Email deve ser uma string',
        'string.email': 'Email deve ser um email válido'
    }),
    newPassword: schemaUserPassword.extract('password'),
    recoveryCode: Joi.string().required().messages({
        'any.required': 'recoveryCode é obrigatório',
        'string.base': 'recoveryCode deve ser uma string'
    })
})