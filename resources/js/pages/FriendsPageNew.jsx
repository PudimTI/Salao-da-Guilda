import React, { useState } from 'react';
import { useFriendships } from '../hooks/useFriendships';
import FriendCard from '../components/friendships/FriendCard';
import UserSearch from '../components/friendships/UserSearch';
import UserProfileCard from '../components/friendships/UserProfileCard';
import AppLayout from '../components/layout/AppLayout';

const FriendsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [showChat, setShowChat] = useState(false);
    
    const { friends, loading, error, removeFriend, blockUser, refresh } = useFriendships();

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setShowUserProfile(true);
    };

    const handleSendRequest = async (userId, message) => {
        try {
            // Aqui você pode implementar a lógica para enviar solicitação
            alert(`Solicitação enviada para o usuário ${userId} com mensagem: ${message}`);
        } catch (error) {
            alert('Erro ao enviar solicitação: ' + error.message);
        }
    };

    const handleChat = (userId) => {
        setShowChat(true);
        // Aqui você pode implementar a lógica para abrir o chat
        console.log('Abrir chat com usuário:', userId);
    };

    const handleRemoveFriend = async (friendshipId) => {
        try {
            await removeFriend(friendshipId);
            alert('Amigo removido com sucesso!');
        } catch (error) {
            alert('Erro ao remover amigo: ' + error.message);
        }
    };

    const handleBlockUser = async (userId) => {
        try {
            await blockUser(userId);
            alert('Usuário bloqueado com sucesso!');
        } catch (error) {
            alert('Erro ao bloquear usuário: ' + error.message);
        }
    };

    const filteredFriends = friends.filter(friend => 
        friend.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout currentPage="friends">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Amigos</h1>
                    <p className="text-gray-600">
                        Gerencie suas conexões e mantenha contato com seus amigos
                    </p>
                </div>

                {/* Busca e ações */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Busca de amigos existentes */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buscar amigos
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Digite o nome ou username do amigo..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Busca de novos usuários */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adicionar novos amigos
                            </label>
                            <UserSearch
                                onUserSelect={handleUserSelect}
                                onSendRequest={handleSendRequest}
                                placeholder="Buscar usuários para adicionar..."
                            />
                        </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        <button
                            onClick={refresh}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                            🔄 Atualizar
                        </button>
                        <button
                            onClick={() => window.location.href = '/solicitacoes'}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            📨 Ver Solicitações
                        </button>
                        <button
                            onClick={() => window.location.href = '/notificacoes'}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            🔔 Notificações
                        </button>
                    </div>
                </div>

                {/* Lista de amigos */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Lista de Amigos ({filteredFriends.length})
                        </h2>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                <p className="text-gray-600 mt-2">Carregando amigos...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <p className="text-red-600 mb-4">Erro ao carregar amigos: {error}</p>
                                <button
                                    onClick={refresh}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        ) : filteredFriends.length > 0 ? (
                            <div className="grid gap-4">
                                {filteredFriends.map((friend) => (
                                    <FriendCard
                                        key={friend.friendship_id}
                                        friend={friend}
                                        onRemove={handleRemoveFriend}
                                        onBlock={handleBlockUser}
                                        onChat={handleChat}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">👥</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchQuery ? 'Nenhum amigo encontrado' : 'Você ainda não tem amigos'}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {searchQuery 
                                        ? 'Tente ajustar sua busca ou adicionar novos amigos'
                                        : 'Comece adicionando pessoas que você conhece!'
                                    }
                                </p>
                                {!searchQuery && (
                                    <button
                                        onClick={() => {
                                            const searchInput = document.querySelector('input[placeholder*="Buscar usuários"]');
                                            if (searchInput) searchInput.focus();
                                        }}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                    >
                                        Buscar Usuários
                                    </button>
                                )}
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

export default FriendsPage;
