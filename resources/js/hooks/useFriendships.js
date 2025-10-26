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
            setFriends(response.data || []);
            setPagination(response.meta || pagination);
        } catch (err) {
            setError(err.message || 'Erro ao carregar amigos');
            console.error('Erro ao carregar amigos:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const removeFriend = useCallback(async (friendshipId) => {
        try {
            await friendshipService.removeFriend(friendshipId);
            setFriends(prev => prev.filter(friend => friend.friendship_id !== friendshipId));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const blockUser = useCallback(async (userId) => {
        try {
            await friendshipService.blockUser(userId);
            setFriends(prev => prev.filter(friend => friend.user.id !== userId));
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
            setRequests(response.data || []);
        } catch (err) {
            setError(err.message || 'Erro ao carregar solicitações');
            console.error('Erro ao carregar solicitações:', err);
        } finally {
            setLoading(false);
        }
    }, [type]);

    const respondToRequest = useCallback(async (requestId, action) => {
        try {
            await friendshipService.respondToFriendRequest(requestId, action);
            setRequests(prev => prev.filter(req => req.id !== requestId));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const cancelRequest = useCallback(async (requestId) => {
        try {
            await friendshipService.cancelFriendRequest(requestId);
            setRequests(prev => prev.filter(req => req.id !== requestId));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    return {
        requests,
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
            setNotifications(response.data || []);
            setUnreadCount(response.unread_count || 0);
        } catch (err) {
            setError(err.message || 'Erro ao carregar notificações');
            console.error('Erro ao carregar notificações:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadUnreadCount = useCallback(async () => {
        try {
            const response = await friendshipService.getUnreadCount();
            setUnreadCount(response.count || 0);
        } catch (err) {
            console.error('Erro ao carregar contagem:', err);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await friendshipService.markNotificationAsRead(notificationId);
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId 
                        ? { ...notif, read_at: new Date().toISOString() }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await friendshipService.markAllNotificationsAsRead();
            setNotifications(prev => 
                prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
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
        notifications,
        unreadCount,
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