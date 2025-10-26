// Teste simples sem JSX
console.log('Teste simples: Arquivo carregado');

// Função para testar se o JavaScript está funcionando
window.testSimple = function() {
    console.log('Teste simples: Função executada');
    
    const debugElement = document.getElementById('debug-app');
    if (debugElement) {
        debugElement.innerHTML = `
            <div style="padding: 2rem; background-color: #e8f5e8; border: 2px solid #4caf50; border-radius: 8px; margin: 1rem;">
                <h2 style="color: #2e7d32; margin-bottom: 1rem;">✅ Teste JavaScript Simples</h2>
                <p style="color: #2e7d32; margin-bottom: 1rem;">Se você está vendo esta mensagem, o JavaScript está funcionando!</p>
                <p style="color: #666; font-size: 0.9rem;">Timestamp: ${new Date().toLocaleString()}</p>
            </div>
        `;
    }
};

// Executar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('Teste simples: DOM carregado');
    window.testSimple();
});










