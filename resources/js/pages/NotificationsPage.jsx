import React, { useState } from 'react';
import { useNotifications } from '../hooks/useFriendships';
import NotificationCard from '../components/friendships/NotificationCard';
import UserProfileCard from '../components/friendships/UserProfileCard';
import AppLayout from '../components/layout/AppLayout';

const NotificationsPage = () => {
    const [filter, setFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserProfile, setShowUserProfile] = useState(false);
    
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading, error } = useNotifications();

    const handleNotificationClick = (notification) => {
        // Marcar como lida se não estiver lida
        if (!notification.read_at) {
            markAsRead(notification.id);
        }

        // Executar ação baseada no tipo de notificação
        switch (notification.type) {
            case 'friend_request':
                // Navegar para página de solicitações
                window.location.href = '/solicitacoes';
                break;
            case 'friend_request_accepted':
            case 'friend_request_rejected':
            case 'friendship_removed':
            case 'user_blocked':
                // Mostrar perfil do usuário
                if (notification.data?.user_id) {
                    // Aqui você pode buscar os dados do usuário
                    const mockUser = {
                        id: notification.data.user_id,
                        name: 'Usuário',
                        username: 'usuario',
                        avatar: 'https://via.placeholder.com/100/8B5CF6/FFFFFF?text=U',
                        bio: 'Usuário do sistema',
                        is_online: false,
                        last_seen: new Date().toISOString()
                    };
                    setSelectedUser(mockUser);
                    setShowUserProfile(true);
                }
                break;
            default:
                console.log('Ação não implementada para:', notification.type);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            alert('Todas as notificações foram marcadas como lidas!');
        } catch (error) {
            alert('Erro ao marcar notificações como lidas: ' + error.message);
        }
    };

    const handleChat = (userId) => {
        // Aqui você pode implementar a lógica para abrir o chat
        console.log('Abrir chat com usuário:', userId);
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.read_at;
        return notification.type === filter;
    });

    const getFilterCount = (filterType) => {
        switch (filterType) {
            case 'all':
                return notifications.length;
            case 'unread':
                return unreadCount;
            case 'friend_request':
                return notifications.filter(n => n.type === 'friend_request').length;
            case 'friend_request_accepted':
                return notifications.filter(n => n.type === 'friend_request_accepted').length;
            default:
                return 0;
        }
    };

    return (
        <AppLayout currentPage="notifications">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Notificações</h1>
                    <p className="text-gray-600">
                        Acompanhe todas as suas notificações e atividades
                    </p>
                </div>

                {/* Filtros e ações */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        {/* Filtros */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    filter === 'all'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Todas ({getFilterCount('all')})
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    filter === 'unread'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Não lidas ({getFilterCount('unread')})
                            </button>
                            <button
                                onClick={() => setFilter('friend_request')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    filter === 'friend_request'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Solicitações ({getFilterCount('friend_request')})
                            </button>
                            <button
                                onClick={() => setFilter('friend_request_accepted')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    filter === 'friend_request_accepted'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Aceitas ({getFilterCount('friend_request_accepted')})
                            </button>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => window.location.href = '/amigos'}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                            >
                                👥 Amigos
                            </button>
                            <button
                                onClick={() => window.location.href = '/solicitacoes'}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                📨 Solicitações
                            </button>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    ✅ Marcar todas como lidas
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lista de notificações */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {filter === 'all' ? 'Todas as Notificações' : 
                             filter === 'unread' ? 'Notificações Não Lidas' :
                             filter === 'friend_request' ? 'Solicitações de Amizade' :
                             filter === 'friend_request_accepted' ? 'Solicitações Aceitas' :
                             'Notificações'} ({filteredNotifications.length})
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                <p className="text-gray-600 mt-2">Carregando notificações...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <p className="text-red-600 mb-4">Erro ao carregar notificações: {error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        ) : filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={markAsRead}
                                    onAction={handleNotificationClick}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">🔔</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {filter === 'unread' 
                                        ? 'Todas as suas notificações foram lidas'
                                        : 'Você ainda não tem notificações'
                                    }
                                </p>
                                <button
                                    onClick={() => window.location.href = '/amigos'}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Ver Amigos
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de perfil do usuário */}
            <UserProfileCard
                user={selectedUser}
                isOpen={showUserProfile}
                onClose={() => {
                    setShowUserProfile(false);
                    setSelectedUser(null);
                }}
                onChat={handleChat}
            />
        </AppLayout>
    );
};

export default NotificationsPage;