import { useState, useEffect, useCallback } from 'react';
import friendshipService from '../services/friendshipService';

// Hook para gerenciar lista de amigos
export const useFriendships = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    });

    const loadFriends = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await friendshipService.getFriends(params);
            // A API retorna { success: true, data: { data: [...], ... } }
            // Precisamos extrair o array de amigos do objeto de paginação
            const friendsData = response.data?.data || response.data || [];
            setFriends(Array.isArray(friendsData) ? friendsData : []);
            
            // Extrair metadados de paginação
            if (response.data && !Array.isArray(response.data)) {
                setPagination({
                    current_page: response.data.current_page || 1,
                    last_page: response.data.last_page || 1,
                    per_page: response.data.per_page || 15,
                    total: response.data.total || 0
                });
            } else {
                setPagination(response.meta || pagination);
            }
        } catch (err) {
            setError(err.message || 'Erro ao carregar amigos');
            console.error('Erro ao carregar amigos:', err);
            setFriends([]); // Garantir que seja sempre um array
        } finally {
            setLoading(false);
        }
    }, []);

    const removeFriend = useCallback(async (friendId) => {
        try {
            await friendshipService.removeFriend(friendId);
            // Filtrar pelo friend_id (ID do amigo) ou friend.id
            setFriends(prev => prev.filter(friend => {
                const friendUserId = friend.friend?.id || friend.friend_id;
                return friendUserId !== friendId;
            }));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const blockUser = useCallback(async (userId) => {
        try {
            await friendshipService.blockUser(userId);
            // Usar friend.friend.id (ID do amigo) para filtrar
            setFriends(prev => prev.filter(friend => {
                const friendId = friend.friend?.id || friend.friend_id;
                return friendId !== userId;
            }));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    useEffect(() => {
        loadFriends();
    }, [loadFriends]);

    return {
        friends,
        loading,
        error,
        pagination,
        loadFriends,
        removeFriend,
        blockUser,
        refresh: loadFriends
    };
};

// Hook para gerenciar solicitações de amizade
export const useFriendRequests = (type = 'received') => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await friendshipService.getFriendRequests(type);
            // A API retorna { success: true, data: { data: [...], ... } }
            // Precisamos extrair o array de solicitações do objeto de paginação
            const requestsData = response.data?.data || response.data || [];
            setRequests(Array.isArray(requestsData) ? requestsData : []);
        } catch (err) {
            setError(err.message || 'Erro ao carregar solicitações');
            console.error('Erro ao carregar solicitações:', err);
            setRequests([]); // Garantir que seja sempre um array
        } finally {
            setLoading(false);
        }
    }, [type]);

    const respondToRequest = useCallback(async (requestId, action) => {
        try {
            await friendshipService.respondToFriendRequest(requestId, action);
            // Filtrar solicitação removida
            setRequests(prev => (Array.isArray(prev) ? prev : []).filter(req => req && req.id !== requestId));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const cancelRequest = useCallback(async (requestId) => {
        try {
            await friendshipService.cancelFriendRequest(requestId);
            // Filtrar solicitação cancelada
            setRequests(prev => (Array.isArray(prev) ? prev : []).filter(req => req && req.id !== requestId));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    return {
        requests: Array.isArray(requests) ? requests : [],
        loading,
        error,
        respondToRequest,
        cancelRequest,
        refresh: loadRequests
    };
};

// Hook para verificar status de relacionamento com um usuário
export const useRelationshipStatus = (userId) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkStatus = useCallback(async () => {
        if (!userId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await friendshipService.getRelationshipStatus(userId);
            setStatus(response);
        } catch (err) {
            setError(err.message);
            console.error('Erro ao verificar status:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const sendFriendRequest = useCallback(async (message = '') => {
        try {
            await friendshipService.sendFriendRequest(userId, message);
            setStatus('request_sent');
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [userId]);

    const blockUser = useCallback(async () => {
        try {
            await friendshipService.blockUser(userId);
            setStatus('blocked_by_user');
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [userId]);

    const unblockUser = useCallback(async () => {
        try {
            await friendshipService.unblockUser(userId);
            setStatus('no_relationship');
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [userId]);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    return {
        status,
        loading,
        error,
        sendFriendRequest,
        blockUser,
        unblockUser,
        refresh: checkStatus
    };
};

// Hook para gerenciar notificações
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadNotifications = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await friendshipService.getNotifications(params);
            // A API retorna { success: true, data: { data: [...], ... } }
            // Precisamos extrair o array de notificações do objeto de paginação
            const notificationsData = response.data?.data || response.data || [];
            setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
            
            // Extrair unread_count da resposta se disponível
            const count = response.unread_count || response.data?.unread_count || 0;
            if (count > 0) {
                setUnreadCount(count);
            }
        } catch (err) {
            setError(err.message || 'Erro ao carregar notificações');
            console.error('Erro ao carregar notificações:', err);
            setNotifications([]); // Garantir que seja sempre um array
        } finally {
            setLoading(false);
        }
    }, []);

    const loadUnreadCount = useCallback(async () => {
        try {
            const response = await friendshipService.getUnreadCount();
            // A API retorna { success: true, data: { unread_count: ... } }
            const count = response.data?.unread_count || response.data?.data?.unread_count || response.count || 0;
            setUnreadCount(count);
        } catch (err) {
            console.error('Erro ao carregar contagem:', err);
            setUnreadCount(0); // Valor padrão em caso de erro
        }
    }, []);

    const markAsRead = useCallback(async (notificationIds) => {
        try {
            // Aceita ID único ou array
            const ids = Array.isArray(notificationIds) ? notificationIds : (notificationIds ? [notificationIds] : []);
            
            if (ids.length === 0) {
                // Marcar todas como lidas
                await friendshipService.markAllNotificationsAsRead();
                setNotifications(prev => 
                    (Array.isArray(prev) ? prev : []).map(notif => ({ 
                        ...notif, 
                        read: true,
                        read_at: new Date().toISOString() 
                    }))
                );
                setUnreadCount(0);
            } else {
                // Marcar específicas como lidas
                await friendshipService.markNotificationAsRead(ids);
                setNotifications(prev => 
                    (Array.isArray(prev) ? prev : []).map(notif => 
                        ids.includes(notif.id) 
                            ? { ...notif, read: true, read_at: new Date().toISOString() }
                            : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - ids.length));
            }
            
            // Recarregar contagem para garantir sincronização
            await loadUnreadCount();
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [loadUnreadCount]);

    const markAllAsRead = useCallback(async () => {
        try {
            await friendshipService.markAllNotificationsAsRead();
            setNotifications(prev => 
                (Array.isArray(prev) ? prev : []).map(notif => ({ 
                    ...notif, 
                    read: true,
                    read_at: new Date().toISOString() 
                }))
            );
            setUnreadCount(0);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    useEffect(() => {
        loadNotifications();
        loadUnreadCount();
    }, [loadNotifications, loadUnreadCount]);

    // Auto-refresh da contagem de não lidas
    useEffect(() => {
        const interval = setInterval(loadUnreadCount, 30000); // 30 segundos
        return () => clearInterval(interval);
    }, [loadUnreadCount]);

    return {
        notifications: Array.isArray(notifications) ? notifications : [],
        unreadCount: unreadCount || 0,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        refresh: loadNotifications,
        refreshUnreadCount: loadUnreadCount
    };
};

// Hook para busca de usuários
export const useUserSearch = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchUsers = useCallback(async (query, params = {}) => {
        if (!query || query.length < 2) {
            setUsers([]);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const response = await friendshipService.searchUsers(query, params);
            setUsers(response.data || []);
        } catch (err) {
            setError(err.message || 'Erro ao buscar usuários');
            console.error('Erro ao buscar usuários:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const getUserProfile = useCallback(async (userId) => {
        try {
            const response = await friendshipService.getUserProfile(userId);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    return {
        users,
        loading,
        error,
        searchUsers,
        getUserProfile,
        clearUsers: () => setUsers([])
    };
};