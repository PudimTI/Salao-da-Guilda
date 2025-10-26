import { useState, useEffect, useCallback } from 'react';
import friendshipService from '../services/friendshipService';

export const useNotifications = (initialParams = {}) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const [unreadCount, setUnreadCount] = useState(0);
    const [params, setParams] = useState(initialParams);

    const loadNotifications = useCallback(async (newParams = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await friendshipService.getNotifications({ ...params, ...newParams });
            setNotifications(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                per_page: response.data.per_page,
                total: response.data.total,
                last_page: response.data.last_page
            });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [params]);

    const loadUnreadCount = useCallback(async () => {
        try {
            const response = await friendshipService.getUnreadCount();
            setUnreadCount(response.data.unread_count);
        } catch (err) {
            console.error('Erro ao carregar contagem de notificações:', err);
        }
    }, []);

    const markAsRead = useCallback(async (notificationIds = []) => {
        try {
            await friendshipService.markNotificationsAsRead(notificationIds);
            await loadUnreadCount(); // Atualizar contagem
            
            if (notificationIds.length === 0) {
                // Marcar todas como lidas
                setNotifications(prev => 
                    prev.map(notification => ({ ...notification, read: true }))
                );
            } else {
                // Marcar específicas como lidas
                setNotifications(prev => 
                    prev.map(notification => 
                        notificationIds.includes(notification.id) 
                            ? { ...notification, read: true }
                            : notification
                    )
                );
            }
        } catch (err) {
            setError(err);
            throw err;
        }
    }, [loadUnreadCount]);

    const filterByType = useCallback((type) => {
        setParams(prev => ({ ...prev, type }));
    }, []);

    const showUnreadOnly = useCallback((unreadOnly) => {
        setParams(prev => ({ ...prev, unread_only: unreadOnly }));
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    useEffect(() => {
        loadUnreadCount();
    }, [loadUnreadCount]);

    return {
        notifications,
        loading,
        error,
        pagination,
        unreadCount,
        loadNotifications,
        loadUnreadCount,
        markAsRead,
        filterByType,
        showUnreadOnly,
        setParams
    };
};
