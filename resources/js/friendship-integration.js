import React from 'react';
import { createRoot } from 'react-dom/client';
import FriendsPageNew from './pages/FriendsPageNew';
import FriendRequestsPage from './pages/FriendRequestsPage';
import NotificationsPage from './pages/NotificationsPage';
import FriendshipExamplePage from './pages/FriendshipExamplePage';
import NotificationBell from './components/friendships/NotificationBell';

// Função para inicializar componentes de friendship nas views
window.initFriendshipComponents = function() {
    console.log('Inicializando componentes de friendship...');

    // Inicializar página de amigos
    const friendsApp = document.getElementById('friends-app');
    if (friendsApp) {
        console.log('Inicializando página de amigos...');
        const root = createRoot(friendsApp);
        root.render(<FriendsPageNew />);
    }

    // Inicializar página de solicitações
    const requestsApp = document.getElementById('requests-app');
    if (requestsApp) {
        console.log('Inicializando página de solicitações...');
        const root = createRoot(requestsApp);
        root.render(<FriendRequestsPage />);
    }

    // Inicializar página de notificações
    const notificationsApp = document.getElementById('notifications-app');
    if (notificationsApp) {
        console.log('Inicializando página de notificações...');
        const root = createRoot(notificationsApp);
        root.render(<NotificationsPage />);
    }

    // Inicializar página de exemplo
    const exampleApp = document.getElementById('friendship-example-app');
    if (exampleApp) {
        console.log('Inicializando página de exemplo...');
        const root = createRoot(exampleApp);
        root.render(<FriendshipExamplePage />);
    }

    // Inicializar sino de notificações no header
    const notificationBell = document.getElementById('notification-bell');
    if (notificationBell) {
        console.log('Inicializando sino de notificações...');
        const root = createRoot(notificationBell);
        root.render(<NotificationBell onNotificationClick={(notification) => {
            console.log('Notificação clicada:', notification);
            // Aqui você pode implementar a lógica para lidar com cliques em notificações
        }} />);
    }
};

// Função para adicionar botões de friendship em qualquer lugar
window.addFriendshipButtons = function(containerId, userId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Criar botões mockados
    const buttonsHTML = `
        <div class="friendship-buttons flex gap-2 mt-2">
            <button 
                onclick="window.openUserProfile(${userId})" 
                class="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                title="Ver perfil"
            >
                👤 Perfil
            </button>
            <button 
                onclick="window.sendFriendRequest(${userId})" 
                class="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                title="Enviar solicitação de amizade"
            >
                👋 Adicionar
            </button>
            <button 
                onclick="window.startChat(${userId})" 
                class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                title="Iniciar conversa"
            >
                💬 Chat
            </button>
        </div>
    `;

    container.innerHTML += buttonsHTML;
};

// Funções globais para ações de friendship
window.openUserProfile = function(userId) {
    console.log('Abrir perfil do usuário:', userId);
    // Aqui você pode implementar a lógica para abrir o modal de perfil
    alert(`Abrir perfil do usuário ${userId}`);
};

window.sendFriendRequest = function(userId) {
    const message = prompt('Enviar solicitação de amizade? (mensagem opcional):');
    if (message !== null) {
        console.log('Enviar solicitação para usuário:', userId, 'com mensagem:', message);
        alert(`Solicitação enviada para usuário ${userId} com mensagem: "${message}"`);
    }
};

window.startChat = function(userId) {
    console.log('Iniciar chat com usuário:', userId);
    // Aqui você pode implementar a lógica para abrir o chat
    alert(`Iniciar chat com usuário ${userId}`);
};

window.blockUser = function(userId) {
    if (confirm('Tem certeza que deseja bloquear este usuário?')) {
        console.log('Bloquear usuário:', userId);
        alert(`Usuário ${userId} bloqueado`);
    }
};

// Função para adicionar botões de friendship em listas de usuários
window.addFriendshipButtonsToList = function(listContainerId, users) {
    const container = document.getElementById(listContainerId);
    if (!container) return;

    // Adicionar botões para cada usuário na lista
    users.forEach(user => {
        const userElement = container.querySelector(`[data-user-id="${user.id}"]`);
        if (userElement && !userElement.querySelector('.friendship-buttons')) {
            const buttonsHTML = `
                <div class="friendship-buttons flex gap-2 mt-2">
                    <button 
                        onclick="window.openUserProfile(${user.id})" 
                        class="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                        title="Ver perfil"
                    >
                        👤 Perfil
                    </button>
                    <button 
                        onclick="window.sendFriendRequest(${user.id})" 
                        class="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                        title="Enviar solicitação de amizade"
                    >
                        👋 Adicionar
                    </button>
                    <button 
                        onclick="window.startChat(${user.id})" 
                        class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                        title="Iniciar conversa"
                    >
                        💬 Chat
                    </button>
                </div>
            `;
            userElement.innerHTML += buttonsHTML;
        }
    });
};

// Função para inicializar sistema de friendship em qualquer página
window.initFriendshipSystem = function() {
    console.log('Inicializando sistema de friendship...');
    
    // Configurar dados mockados para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        localStorage.setItem('use_mock_data', 'true');
        localStorage.setItem('debug_friendships', 'true');
    }

    // Inicializar componentes
    window.initFriendshipComponents();

    // Adicionar botões de friendship em elementos existentes
    const userCards = document.querySelectorAll('.user-card, .profile-card, .member-card');
    userCards.forEach(card => {
        const userId = card.dataset.userId;
        if (userId && !card.querySelector('.friendship-buttons')) {
            window.addFriendshipButtons(card.id || `user-${userId}`, userId);
        }
    });

    console.log('Sistema de friendship inicializado!');
};

// Auto-inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initFriendshipSystem);
} else {
    window.initFriendshipSystem();
}
