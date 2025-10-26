import React from 'react';

const TestComponent = () => {
    return (
        <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Teste do React
            </h2>
            <p className="text-green-700">
                Se você está vendo esta mensagem, o React está funcionando corretamente!
            </p>
            <p className="text-sm text-green-600 mt-2">
                Timestamp: {new Date().toLocaleString()}
            </p>
        </div>
    );
};

export default TestComponent;










