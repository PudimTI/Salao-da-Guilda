// Configuração de rotas da aplicação
export const routes = {
    // Rotas principais
    home: '/',
    feed: '/feed',
    profile: '/perfil',
    find: '/encontrar',
    chat: '/chat',
    friends: '/amigos',
    notifications: '/notificacoes',
    
    // Rotas de personagens
    characters: {
        index: '/characters',
        create: '/characters/create',
        show: (id) => `/characters/${id}`,
        edit: (id) => `/characters/${id}/edit`,
        destroy: (id) => `/characters/${id}`,
        joinCampaign: (id) => `/characters/${id}/join-campaign`,
        leaveCampaign: (characterId, campaignId) => `/characters/${characterId}/campaigns/${campaignId}`,
    },
    
    // Rotas de campanhas
    campaigns: {
        index: '/campaigns',
        create: '/campaigns/create',
        show: (id) => `/campaigns/${id}`,
        edit: (id) => `/campaigns/${id}/edit`,
        destroy: (id) => `/campaigns/${id}`,
        invite: (id) => `/campaigns/${id}/invite`,
        leave: (id) => `/campaigns/${id}/leave`,
        updateMemberRole: (campaignId, userId) => `/campaigns/${campaignId}/members/${userId}/role`,
    },
    
    // Rotas de API
    api: {
        characters: {
            index: '/api/characters',
            show: (id) => `/api/characters/${id}`,
            store: '/api/characters',
            update: (id) => `/api/characters/${id}`,
            destroy: (id) => `/api/characters/${id}`,
            joinCampaign: (id) => `/api/characters/${id}/join-campaign`,
            leaveCampaign: (characterId, campaignId) => `/api/characters/${characterId}/campaigns/${campaignId}`,
        },
        campaigns: {
            index: '/api/campaigns',
            show: (id) => `/api/campaigns/${id}`,
            store: '/api/campaigns',
            update: (id) => `/api/campaigns/${id}`,
            destroy: (id) => `/api/campaigns/${id}`,
            invite: (id) => `/api/campaigns/${id}/invite`,
            leave: (id) => `/api/campaigns/${id}/leave`,
            updateMemberRole: (campaignId, userId) => `/api/campaigns/${campaignId}/members/${userId}/role`,
        },
        profile: {
            show: '/api/profile',
            update: '/api/profile',
            characters: '/api/profile/characters',
            posts: '/api/profile/posts',
            campaigns: '/api/profile/campaigns',
            preferences: '/api/profile/preferences',
            filters: '/api/profile/filters',
        },
        posts: {
            index: '/api/posts',
            show: (id) => `/api/posts/${id}`,
            store: '/api/posts',
            update: (id) => `/api/posts/${id}`,
            destroy: (id) => `/api/posts/${id}`,
            like: (id) => `/api/posts/${id}/like`,
            repost: (id) => `/api/posts/${id}/repost`,
            comment: (id) => `/api/posts/${id}/comment`,
            search: '/api/posts/search',
        },
        media: {
            upload: '/api/media/upload',
            index: '/api/media',
            destroy: (id) => `/api/media/${id}`,
            url: (id) => `/api/media/${id}/url`,
        },
        notifications: {
            index: '/api/notifications',
            markAsRead: '/api/notifications/mark-as-read',
            unreadCount: '/api/notifications/unread-count',
        },
    },
    
    // Função para gerar URL com parâmetros
    url: (route, params = {}) => {
        let url = route;
        Object.keys(params).forEach(key => {
            url = url.replace(`{${key}}`, params[key]);
        });
        return url;
    },
    
    // Função para redirecionar
    redirect: (route) => {
        window.location.href = route;
    },
    
    // Função para navegar com React Router (se implementado)
    navigate: (route) => {
        // Implementar navegação com React Router se necessário
        window.location.href = route;
    },
};

export default routes;
