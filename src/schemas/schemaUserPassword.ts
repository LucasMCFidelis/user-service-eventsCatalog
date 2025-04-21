import Joi from "joi"

export const schemaUserPassword = Joi.object({
    password: Joi.string().trim().pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8,}$')).required().messages({
        'any.required': 'Senha é obrigatória',
        'string.base': 'Senha deve ser uma string',
        'string.empty': 'Senha não pode estar vazia',
        'string.pattern.base': 'Senha deve ter pelo menos 8 caracteres, incluir uma letra maiúscula, uma letra minuscula, um número e um caractere especial (!@#$&*)',
    })
})