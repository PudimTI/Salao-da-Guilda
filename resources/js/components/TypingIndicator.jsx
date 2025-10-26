import React from 'react';

const TypingIndicator = ({ users }) => {
    if (!users || users.length === 0) return null;

    // Formatar texto dos usuários digitando
    const formatTypingText = (users) => {
        if (users.length === 1) {
            return `${users[0].name} está digitando...`;
        } else if (users.length === 2) {
            return `${users[0].name} e ${users[1].name} estão digitando...`;
        } else {
            return `${users[0].name} e ${users.length - 1} outros estão digitando...`;
        }
    };

    return (
        <div className="px-6 py-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
                {/* Animação de pontos */}
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                
                {/* Texto */}
                <span>{formatTypingText(users)}</span>
            </div>
        </div>
    );
};

export default TypingIndicator;
