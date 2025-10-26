// Configuração do sistema de amizades
export const friendshipConfig = {
    // URLs da API
    api: {
        baseURL: '/api',
        friendships: '/api/friendships',
        notifications: '/api/notifications'
    },
    
    // Configurações de paginação
    pagination: {
        defaultPerPage: 15,
        maxPerPage: 50
    },
    
    // Configurações de notificações
    notifications: {
        autoRefreshInterval: 30000, // 30 segundos
        maxDropdownItems: 5,
        enableRealTime: true
    },
    
    // Configurações de busca
    search: {
        minSearchLength: 2,
        debounceDelay: 300
    },
    
    // Configurações de UI
    ui: {
        animationDuration: 200,
        toastDuration: 3000,
        confirmDialog: true
    },
    
    // Tipos de relacionamento
    relationshipTypes: {
        NO_RELATIONSHIP: 'no_relationship',
        REQUEST_SENT: 'request_sent',
        REQUEST_RECEIVED: 'request_received',
        ACTIVE: 'active',
        BLOCKED_BY_USER: 'blocked_by_user'
    },
    
    // Status de solicitações
    requestStatus: {
        PENDING: 'pending',
        ACCEPTED: 'accepted',
        REJECTED: 'rejected',
        CANCELLED: 'cancelled'
    },
    
    // Tipos de notificação
    notificationTypes: {
        FRIEND_REQUEST: 'friend_request',
        FRIEND_REQUEST_ACCEPTED: 'friend_request_accepted',
        FRIEND_REQUEST_REJECTED: 'friend_request_rejected',
        FRIENDSHIP_REMOVED: 'friendship_removed',
        USER_BLOCKED: 'user_blocked'
    },
    
    // Estados de amizade
    friendshipStates: {
        ACTIVE: 'active',
        BLOCKED: 'blocked'
    }
};

// Função para inicializar o sistema de amizades
export const initializeFriendshipSystem = () => {
    // Configurar token de autenticação se disponível
    const token = localStorage.getItem('auth_token');
    if (token) {
        // Configurar axios globalmente
        if (typeof axios !== 'undefined') {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }
    
    // Configurar interceptors do axios para tratamento de erros
    if (typeof axios !== 'undefined') {
        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expirado, redirecionar para login
                    localStorage.removeItem('auth_token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }
    
    console.log('Sistema de amizades inicializado');
};

// Função para obter configuração
export const getConfig = (key) => {
    const keys = key.split('.');
    let value = friendshipConfig;
    
    for (const k of keys) {
        value = value?.[k];
    }
    
    return value;
};

// Função para formatar tempo relativo
export const formatRelativeTime = (date) => {
    const now = new Date();
    const notificationTime = new Date(date);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return notificationTime.toLocaleDateString('pt-BR');
};

// Função para obter ícone de status
export const getStatusIcon = (status) => {
    const icons = {
        [friendshipConfig.relationshipTypes.NO_RELATIONSHIP]: '👤',
        [friendshipConfig.relationshipTypes.REQUEST_SENT]: '⏳',
        [friendshipConfig.relationshipTypes.REQUEST_RECEIVED]: '📨',
        [friendshipConfig.relationshipTypes.ACTIVE]: '✅',
        [friendshipConfig.relationshipTypes.BLOCKED_BY_USER]: '🚫'
    };
    
    return icons[status] || '❓';
};

// Função para obter cor de status
export const getStatusColor = (status) => {
    const colors = {
        [friendshipConfig.relationshipTypes.NO_RELATIONSHIP]: 'text-blue-600',
        [friendshipConfig.relationshipTypes.REQUEST_SENT]: 'text-yellow-600',
        [friendshipConfig.relationshipTypes.REQUEST_RECEIVED]: 'text-green-600',
        [friendshipConfig.relationshipTypes.ACTIVE]: 'text-green-600',
        [friendshipConfig.relationshipTypes.BLOCKED_BY_USER]: 'text-red-600'
    };
    
    return colors[status] || 'text-gray-600';
};

// Função para obter texto de status
export const getStatusText = (status) => {
    const texts = {
        [friendshipConfig.relationshipTypes.NO_RELATIONSHIP]: 'Não são amigos',
        [friendshipConfig.relationshipTypes.REQUEST_SENT]: 'Solicitação enviada',
        [friendshipConfig.relationshipTypes.REQUEST_RECEIVED]: 'Solicitação recebida',
        [friendshipConfig.relationshipTypes.ACTIVE]: 'São amigos',
        [friendshipConfig.relationshipTypes.BLOCKED_BY_USER]: 'Usuário bloqueado'
    };
    
    return texts[status] || 'Status desconhecido';
};

export default friendshipConfig;
