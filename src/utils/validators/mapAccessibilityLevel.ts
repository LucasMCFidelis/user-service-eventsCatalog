// Mapeamento do enum do Prisma para o enum definido na sua interface
import { AccessibilityLevel as PrismaAccessibilityLevel } from "@prisma/client";
import { AccessibilityLevel } from "../../interfaces/eventInterface.js";

export function mapAccessibilityLevel(prismaLevel: PrismaAccessibilityLevel): AccessibilityLevel {
    switch (prismaLevel) {
        case 'SEM_ACESSIBILIDADE':
            return AccessibilityLevel.SEM_ACESSIBILIDADE;
        case 'ACESSIBILIDADE_BASICA':
            return AccessibilityLevel.ACESSIBILIDADE_BASICA;
        case 'ACESSIBILIDADE_AUDITIVA':
            return AccessibilityLevel.ACESSIBILIDADE_AUDITIVA;
        case 'ACESSIBILIDADE_VISUAL':
            return AccessibilityLevel.ACESSIBILIDADE_VISUAL;
        case 'ACESSIBILIDADE_COMPLETA':
            return AccessibilityLevel.ACESSIBILIDADE_COMPLETA;
        default:
            return AccessibilityLevel.NAO_INFORMADA;
    }
}