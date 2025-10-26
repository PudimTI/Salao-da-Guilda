import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { unreadCount, loadUnreadCount, markAsRead } = useNotifications();

    useEffect(() => {
        // Carregar contagem inicial
        loadUnreadCount();
        
        // Atualizar contagem a cada 30 segundos
        const interval = setInterval(loadUnreadCount, 30000);
        
        return () => clearInterval(interval);
    }, [loadUnreadCount]);

    const handleMarkAsRead = async (notificationIds) => {
        try {
            await markAsRead(notificationIds);
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAsRead();
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        }
    };

    return (
        <div className="relative">
            {/* Botão do sino */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                
                {/* Badge de notificações não lidas */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown de notificações */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    ></div>
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Notificações
                                </h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Marcar todas como lidas
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Lista de notificações */}
                        <div className="max-h-96 overflow-y-auto">
                            <NotificationList onMarkAsRead={handleMarkAsRead} />
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-gray-200">
                            <a
                                href="/notificacoes"
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Ver todas as notificações
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// Componente para lista de notificações (simplificado para o dropdown)
const NotificationList = ({ onMarkAsRead }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            // Aqui você carregaria as notificações mais recentes
            // Por enquanto, vamos simular
            setNotifications([]);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                <p>Nenhuma notificação</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onMarkAsRead([notification.id])}
                >
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                                {getNotificationText(notification)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {getNotificationTime(notification.created_at)}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Funções auxiliares
const getNotificationText = (notification) => {
    const { type, payload } = notification;
    
    switch (type) {
        case 'friend_request':
            return `${payload.from_user_name} enviou uma solicitação de amizade`;
        case 'friend_request_accepted':
            return `${payload.to_user_name} aceitou sua solicitação de amizade`;
        case 'friend_request_rejected':
            return `${payload.to_user_name} não aceitou sua solicitação de amizade`;
        case 'friendship_removed':
            return `${payload.remover_user_name} removeu você da lista de amigos`;
        case 'user_blocked':
            return `${payload.blocker_user_name} bloqueou você`;
        default:
            return 'Nova notificação';
    }
};

const getNotificationTime = (createdAt) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return notificationTime.toLocaleDateString('pt-BR');
};

export default NotificationBell;
