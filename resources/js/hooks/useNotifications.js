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
            // A API retorna { success: true, data: { data: [...], ... } }
            // Precisamos extrair o array de notificações do objeto de paginação
            const notificationsData = response.data?.data || response.data || [];
            setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
            
            // Extrair metadados de paginação
            if (response.data && !Array.isArray(response.data)) {
                setPagination({
                    current_page: response.data.current_page || 1,
                    per_page: response.data.per_page || 15,
                    total: response.data.total || 0,
                    last_page: response.data.last_page || 1
                });
            }
        } catch (err) {
            setError(err);
            setNotifications([]); // Garantir que seja sempre um array
        } finally {
            setLoading(false);
        }
    }, [params]);

    const loadUnreadCount = useCallback(async () => {
        try {
            const response = await friendshipService.getUnreadCount();
            // A API retorna { success: true, data: { unread_count: ... } }
            const count = response.data?.unread_count || response.data?.data?.unread_count || response.count || 0;
            setUnreadCount(count);
        } catch (err) {
            console.error('Erro ao carregar contagem de notificações:', err);
            setUnreadCount(0); // Valor padrão em caso de erro
        }
    }, []);

    const markAsRead = useCallback(async (notificationIds = []) => {
        try {
            // Se for um único ID (número), converter para array
            const ids = Array.isArray(notificationIds) ? notificationIds : (notificationIds ? [notificationIds] : []);
            
            if (ids.length === 0) {
                // Marcar todas como lidas - usar método específico se existir
                await friendshipService.markAllNotificationsAsRead();
            } else {
                // Marcar específicas como lidas
                await friendshipService.markNotificationAsRead(ids);
            }
            
            // Atualizar estado local
            setNotifications(prev => 
                (Array.isArray(prev) ? prev : []).map(notification => {
                    if (ids.length === 0 || ids.includes(notification.id)) {
                        return { 
                            ...notification, 
                            read: true,
                            read_at: new Date().toISOString()
                        };
                    }
                    return notification;
                })
            );
            
            await loadUnreadCount(); // Atualizar contagem
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
        notifications: Array.isArray(notifications) ? notifications : [],
        loading,
        error,
        pagination,
        unreadCount: unreadCount || 0,
        loadNotifications,
        loadUnreadCount,
        markAsRead,
        markAllAsRead: () => markAsRead([]), // Helper para marcar todas
        filterByType,
        showUnreadOnly,
        setParams
    };
};
