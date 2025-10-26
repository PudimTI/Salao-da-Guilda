import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useFriendships';
import NotificationCard from './NotificationCard';

const NotificationBell = ({ onNotificationClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    const handleNotificationClick = (notification) => {
        setIsOpen(false);
        onNotificationClick(notification);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    return (
        <div className="relative">
            {/* Sino de notificações */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown de notificações */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Notificações
                        </h3>
                        <div className="flex space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
                                >
                                    Marcar todas como lidas
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Lista de notificações */}
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.slice(0, 5).map((notification) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={markAsRead}
                                    onAction={handleNotificationClick}
                                />
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                Nenhuma notificação
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 5 && (
                        <div className="p-4 border-t border-gray-200 text-center">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    // Navegar para página de notificações
                                    window.location.href = '/notificacoes';
                                }}
                                className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
                            >
                                Ver todas as notificações
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
