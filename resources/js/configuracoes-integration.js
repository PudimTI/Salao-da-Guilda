// Integração da página de configurações
import { createRoot } from 'react-dom/client';
import React from 'react';
import ConfiguracoesPage from './components/ConfiguracoesPage';

window.initConfiguracoesComponents = function() {
    const container = document.getElementById('configuracoes-app');
    if (container) {
        const root = createRoot(container);
        root.render(React.createElement(ConfiguracoesPage));
    }
};

// Auto-inicializar se o DOM já estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initConfiguracoesComponents);
} else {
    window.initConfiguracoesComponents();
}


