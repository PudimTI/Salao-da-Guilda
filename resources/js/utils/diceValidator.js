/**
 * Validação unificada de fórmulas de dados
 * Usado tanto no frontend quanto no backend (mesma lógica)
 */

export const validateFormula = (formula) => {
    if (!formula || typeof formula !== 'string') {
        return {
            valid: false,
            error: 'Fórmula deve ser uma string'
        };
    }

    // Remover espaços e converter para minúsculo
    const normalized = formula.trim().toLowerCase();

    // Regex básico: número de dados, 'd', lados, modificador opcional
    const regex = /^(\d+)d(\d+)([+\-]\d+)?$/;
    const match = normalized.match(regex);

    if (!match) {
        return {
            valid: false,
            error: 'Fórmula inválida. Use formato como: 1d20, 2d6+3, 3d4-1'
        };
    }

    const [, diceStr, sidesStr, modifierStr] = match;
    const dice = parseInt(diceStr, 10);
    const sides = parseInt(sidesStr, 10);
    const modifier = modifierStr ? parseInt(modifierStr, 10) : 0;

    // Validações de limites (conforme backend)
    if (dice < 1 || dice > 100) {
        return {
            valid: false,
            error: 'Número de dados deve estar entre 1 e 100'
        };
    }

    if (sides < 2 || sides > 1000) {
        return {
            valid: false,
            error: 'Número de lados deve estar entre 2 e 1000'
        };
    }

    if (Math.abs(modifier) > 1000) {
        return {
            valid: false,
            error: 'Modificador deve estar entre -1000 e 1000'
        };
    }

    return {
        valid: true,
        parsed: {
            dice,
            sides,
            modifier,
            display: `${dice}d${sides}${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''}`
        }
    };
};

/**
 * Parsear fórmula para objeto estruturado
 */
export const parseFormula = (formula) => {
    const validation = validateFormula(formula);
    
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    return validation.parsed;
};

/**
 * Validar fórmula (retorna boolean simples)
 */
export const isValidFormula = (formula) => {
    return validateFormula(formula).valid;
};
















