import React from 'react';
import { createRoot } from 'react-dom/client';

// Componente de teste simples
const TestComponent = () => {
    return React.createElement('div', {
        style: {
            padding: '2rem',
            backgroundColor: '#e8f5e8',
            border: '2px solid #4caf50',
            borderRadius: '8px',
            margin: '1rem'
        }
    }, 
        React.createElement('h2', {
            style: {
                color: '#2e7d32',
                marginBottom: '1rem'
            }
        }, '✅ Teste React Funcionando'),
        React.createElement('p', {
            style: {
                color: '#2e7d32',
                marginBottom: '1rem'
            }
        }, 'Se você está vendo esta mensagem, o React está funcionando!'),
        React.createElement('p', {
            style: {
                color: '#666',
                fontSize: '0.9rem'
            }
        }, `Timestamp: ${new Date().toLocaleString()}`)
    );
};

// Função para testar React
window.testReact = () => {
    console.log('Testando React...');
    const testElement = document.getElementById('test-react');
    if (testElement) {
        console.log('Elemento test-react encontrado, montando React...');
        const root = createRoot(testElement);
        root.render(React.createElement(TestComponent));
    } else {
        console.log('Elemento test-react não encontrado');
    }
};

// Executar teste quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, testando React...');
    window.testReact();
});


