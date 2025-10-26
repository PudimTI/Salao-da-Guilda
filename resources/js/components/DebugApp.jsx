import React from 'react';

const DebugApp = () => {
    console.log('DebugApp: Componente carregado!');
    
    return (
        <div style={{
            padding: '2rem',
            backgroundColor: '#f0f0f0',
            border: '2px solid #333',
            borderRadius: '8px',
            margin: '1rem',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1 style={{ color: '#333', marginBottom: '1rem' }}>
                🎯 Debug - Salão da Guilda
            </h1>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
                Se você está vendo esta mensagem, o React está funcionando!
            </p>
            <div style={{ 
                backgroundColor: '#e8f5e8', 
                padding: '1rem', 
                borderRadius: '4px',
                border: '1px solid #4caf50'
            }}>
                <p style={{ margin: 0, color: '#2e7d32' }}>
                    ✅ React carregado com sucesso<br/>
                    ✅ Componentes funcionando<br/>
                    ✅ Timestamp: {new Date().toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default DebugApp;










