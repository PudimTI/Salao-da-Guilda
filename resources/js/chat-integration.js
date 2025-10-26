import React from 'react';
import { createRoot } from 'react-dom/client';
import FriendsPage from './pages/FriendsPage';
import FeedPage from './pages/FeedPage';
import ChatInterface from './components/ChatInterface';
import AppLayout from './components/AppLayout';

// Função para inicializar componentes React nas views
window.initReactComponents = function() {
    console.log('Inicializando componentes React...');

    // Inicializar página de amigos
    const friendsApp = document.getElementById('friends-app');
    if (friendsApp) {
        console.log('Inicializando página de amigos...');
        const root = createRoot(friendsApp);
        root.render(<FriendsPage />);
    }

    // Inicializar página de feed
    const feedApp = document.getElementById('feed-app');
    if (feedApp) {
        console.log('Inicializando página de feed...');
        const root = createRoot(feedApp);
        root.render(<FeedPage />);
    }

    // Inicializar chat completo (para página dedicada)
    const chatApp = document.getElementById('chat-app');
    if (chatApp) {
        console.log('Inicializando chat completo...');
        const root = createRoot(chatApp);
        root.render(<ChatInterface />);
    }

    // Inicializar layout com chat flutuante (para páginas gerais)
    const appLayout = document.getElementById('app-layout');
    if (appLayout) {
        console.log('Inicializando layout com chat...');
        const root = createRoot(appLayout);
        root.render(<AppLayout showChat={true} />);
    }

    console.log('Componentes React inicializados com sucesso!');
};

// Inicializar automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando componentes...');
    
    // Aguardar um pouco para garantir que todos os scripts carregaram
    setTimeout(() => {
        if (window.initReactComponents) {
            window.initReactComponents();
        }
    }, 100);
});

// Exportar componentes para uso global
window.ReactComponents = {
    FriendsPage,
    FeedPage,
    ChatInterface,
    AppLayout
};

console.log('Sistema de chat DM carregado e pronto para uso!');
