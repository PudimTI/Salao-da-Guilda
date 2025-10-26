import { useState, useCallback } from 'react';
import axios from 'axios';

export const useDiceRoll = (campaignId) => {
    const [rolls, setRolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    // Realizar rolagem de dados
    const rollDice = useCallback(async (formula, description = null) => {
        if (!campaignId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`/api/campaigns/${campaignId}/dice-rolls`, {
                formula,
                description
            });

            const newRoll = response.data.data;
            setRolls(prev => [newRoll, ...prev]);

            return newRoll;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Erro ao rolar dados';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    // Carregar rolagens da campanha
    const loadRolls = useCallback(async (options = {}) => {
        if (!campaignId) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (options.per_page) params.append('per_page', options.per_page);
            if (options.roller_id) params.append('roller_id', options.roller_id);
            if (options.formula) params.append('formula', options.formula);
            if (options.date_from) params.append('date_from', options.date_from);
            if (options.date_to) params.append('date_to', options.date_to);

            const response = await axios.get(`/api/campaigns/${campaignId}/dice-rolls?${params}`);
            setRolls(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao carregar rolagens');
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    // Carregar estatísticas
    const loadStats = useCallback(async () => {
        if (!campaignId) return;

        try {
            const response = await axios.get(`/api/campaigns/${campaignId}/dice-rolls/stats`);
            setStats(response.data.data);
        } catch (err) {
            console.error('Erro ao carregar estatísticas:', err);
        }
    }, [campaignId]);

    // Deletar rolagem
    const deleteRoll = useCallback(async (rollId) => {
        if (!campaignId) return;

        try {
            await axios.delete(`/api/campaigns/${campaignId}/dice-rolls/${rollId}`);
            setRolls(prev => prev.filter(roll => roll.id !== rollId));
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao deletar rolagem');
            throw err;
        }
    }, [campaignId]);

    // Validar fórmula
    const validateFormula = useCallback((formula) => {
        const regex = /^[0-9]+[dD][0-9]+([+\-][0-9]+)?$/;
        return regex.test(formula);
    }, []);

    // Parsear fórmula para exibição
    const parseFormula = useCallback((formula) => {
        const match = formula.match(/^(\d+)[dD](\d+)([+\-]\d+)?$/);
        if (!match) return null;

        const [, dice, sides, modifier] = match;
        return {
            dice: parseInt(dice),
            sides: parseInt(sides),
            modifier: modifier ? parseInt(modifier) : 0,
            display: `${dice}d${sides}${modifier || ''}`
        };
    }, []);

    // Gerar fórmulas comuns
    const getCommonFormulas = useCallback(() => {
        return [
            { formula: '1d20', label: '1d20 (Ataque)' },
            { formula: '1d20+5', label: '1d20+5 (Ataque +5)' },
            { formula: '2d6', label: '2d6 (Dano)' },
            { formula: '2d6+3', label: '2d6+3 (Dano +3)' },
            { formula: '1d100', label: '1d100 (Percentual)' },
            { formula: '3d6', label: '3d6 (Atributo)' },
            { formula: '4d6', label: '4d6 (Atributo 4d6)' },
            { formula: '1d4', label: '1d4 (Dano baixo)' },
            { formula: '1d6', label: '1d6 (Dano médio)' },
            { formula: '1d8', label: '1d8 (Dano alto)' },
            { formula: '1d10', label: '1d10 (Dano muito alto)' },
            { formula: '1d12', label: '1d12 (Dano máximo)' }
        ];
    }, []);

    return {
        rolls,
        loading,
        error,
        stats,
        rollDice,
        loadRolls,
        loadStats,
        deleteRoll,
        validateFormula,
        parseFormula,
        getCommonFormulas
    };
};
