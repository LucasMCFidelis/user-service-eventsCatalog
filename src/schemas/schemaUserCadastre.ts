import Joi from "joi"
import { removeWhitespace } from "../utils/formatters/removeWhitespace.js"

export const schemaUserCadastre = Joi.object({
    firstName: Joi.string().custom(
        (value) => removeWhitespace(value)
    ).min(3).max(50).pattern(new RegExp('^[A-Za-zÀ-ÖØ-öø-ÿ\\s]+$')).required().messages({
        'any.required': 'Nome é obrigatório',
        'string.base': 'Nome deve ser uma string',
        'string.empty': 'Nome não pode estar vazio',
        'string.min': 'Nome deve possuir no mínimo 3 caracteres',
        'string.max': 'Nome deve possuir no máximo 50 caracteres',
        'string.pattern.base': 'Nome deve conter apenas caracteres alfabéticos, acentuados e espaços'
    }),
    lastName: Joi.string().custom(
        (value) => removeWhitespace(value)
    ).min(5).max(50).pattern(new RegExp('^[A-Za-zÀ-ÖØ-öø-ÿ\\s]+$')).required().messages({
        'any.required': 'Sobrenome é obrigatório',
        'string.base': 'Sobrenome deve ser uma string',
        'string.empty': 'Sobrenome não pode estar vazio',
        'string.min': 'Sobrenome deve possuir no mínimo 5 caracteres',
        'string.max': 'Sobrenome deve possuir no máximo 50 caracteres',
        'string.pattern.base': 'Sobrenome deve conter apenas caracteres alfabéticos, acentuados e espaços'
    }),
    email: Joi.string().max(100).email().required().messages({
        'any.required': 'Email é obrigatório',
        'string.base': 'Email deve ser uma string',
        'string.email': 'Email deve ser um email válido',
        'string.max': 'Email deve possuir no máximo 100 caracteres',
        'string.empty': 'Email não pode estar vazio'
    }),
    phoneNumber: Joi.string().trim().pattern(/^\+?[0-9]{10,15}$/).allow(null).optional().messages({
        'string.base': 'Telefone deve ser uma string',
        'string.empty': 'Telefone não deve ser uma string vazia',
        'string.pattern.base': 'Telefone deve começar com (+) e conter entre 10 e 15 dígitos numéricos',
    })
})