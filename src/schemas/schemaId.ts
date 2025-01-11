import Joi from "joi";

export const schemaId = Joi.object({
    id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
        'string.base': 'O ID deve ser um texto.',
        'string.empty': 'O ID não pode ser vazio.',
        'any.required': 'O ID é obrigatório.',
        'string.guid': 'O ID deve estar no formato de UUID v4.',
    }),
});