import Joi from "joi"

export const schemaUserRole = Joi.object({
    roleId: Joi.number().optional().messages({
        'number.base': 'roleId deve ser um número inteiro',
    }),
    roleName: Joi.string().trim().required().messages({
        'string.base': 'roleId deve ser um número inteiro',
    }),
    roleDescription: Joi.string().optional().messages({
        'string.base': 'roleId deve ser um número inteiro',
    })
})