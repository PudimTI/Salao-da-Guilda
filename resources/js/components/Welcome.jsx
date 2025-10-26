import React from 'react';

const Welcome = ({ name = 'Usuário' }) => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-blue-800 mb-2">
                Bem-vindo ao React + Laravel!
            </h1>
            <p className="text-blue-600">
                Olá, {name}! Este é um componente React funcionando perfeitamente com Laravel.
            </p>
            <div className="mt-4 flex space-x-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    React
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    Laravel
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    Tailwind CSS
                </span>
            </div>
        </div>
    );
};

export default Welcome;