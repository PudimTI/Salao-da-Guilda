import React from 'react';

const DiceRollMessage = ({ roll, showDetails = false }) => {
    const getDiceColor = (result, sides) => {
        if (result === sides) return 'text-green-600'; // Critical hit
        if (result === 1) return 'text-red-600'; // Critical fail
        return 'text-gray-700';
    };

    const getDiceIcon = (sides) => {
        if (sides <= 4) return '🔺'; // d4
        if (sides <= 6) return '🎲'; // d6
        if (sides <= 8) return '🎯'; // d8
        if (sides <= 10) return '🎪'; // d10
        if (sides <= 12) return '🎨'; // d12
        if (sides <= 20) return '🎲'; // d20
        return '🎲'; // d100+
    };

    const formatResult = (roll) => {
        const { dice_rolls, modifier, total } = roll.detail;
        const sides = roll.detail.formula_parsed?.sides || 20;
        const diceCount = roll.detail.formula_parsed?.dice || 1;
        
        let result = `${dice_rolls.join(', ')}`;
        if (modifier !== 0) {
            result += ` ${modifier > 0 ? '+' : ''}${modifier}`;
        }
        result += ` = ${total}`;
        
        return result;
    };

    const getResultText = (roll) => {
        const { dice_rolls, modifier, total } = roll.detail;
        const sides = roll.detail.formula_parsed?.sides || 20;
        const diceCount = roll.detail.formula_parsed?.dice || 1;
        
        if (diceCount === 1) {
            if (total === sides) return ' (Crítico!)';
            if (total === 1) return ' (Falha crítica!)';
        }
        
        return '';
    };

    return (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 my-2">
            <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{getDiceIcon(roll.detail.formula_parsed?.sides || 20)}</span>
                <span className="font-semibold text-gray-800">{roll.roller.name}</span>
                <span className="text-sm text-gray-500">rolou</span>
                <span className="font-mono bg-white px-2 py-1 rounded border text-sm">
                    {roll.formula}
                </span>
            </div>
            
            <div className="flex items-center space-x-2">
                <span className={`text-2xl font-bold ${getDiceColor(roll.result, roll.detail.formula_parsed?.sides || 20)}`}>
                    {roll.result}
                </span>
                <span className="text-gray-600">
                    {getResultText(roll)}
                </span>
            </div>
            
            {roll.detail.description && (
                <div className="mt-2 text-sm text-gray-600 italic">
                    "{roll.detail.description}"
                </div>
            )}
            
            {showDetails && roll.detail.dice_rolls && roll.detail.dice_rolls.length > 1 && (
                <div className="mt-2 text-xs text-gray-500">
                    Detalhes: {formatResult(roll)}
                </div>
            )}
            
            <div className="mt-1 text-xs text-gray-400">
                {new Date(roll.created_at).toLocaleString()}
            </div>
        </div>
    );
};

export default DiceRollMessage;
