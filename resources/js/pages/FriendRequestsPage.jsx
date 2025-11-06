import React, { useState } from 'react';
import { useFriendRequests } from '../hooks/useFriendships';
import FriendRequestCard from '../components/friendships/FriendRequestCard';
import UserProfileCard from '../components/friendships/UserProfileCard';
import AppLayout from '../components/layout/AppLayout';

const FriendRequestsPage = () => {
    const [activeTab, setActiveTab] = useState('received');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserProfile, setShowUserProfile] = useState(false);
    
    const receivedRequests = useFriendRequests('received');
    const sentRequests = useFriendRequests('sent');

    const handleAcceptRequest = async (requestId) => {
        try {
            await receivedRequests.respondToRequest(requestId, 'accept');
            alert('Solicitação aceita com sucesso!');
        } catch (error) {
            alert('Erro ao aceitar solicitação: ' + error.message);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await receivedRequests.respondToRequest(requestId, 'reject');
            alert('Solicitação rejeitada');
        } catch (error) {
            alert('Erro ao rejeitar solicitação: ' + error.message);
        }
    };

    const handleCancelRequest = async (requestId) => {
        try {
            await sentRequests.cancelRequest(requestId);
            alert('Solicitação cancelada');
        } catch (error) {
            alert('Erro ao cancelar solicitação: ' + error.message);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setShowUserProfile(true);
    };

    const handleChat = (userId) => {
        // Aqui você pode implementar a lógica para abrir o chat
        console.log('Abrir chat com usuário:', userId);
    };

    const currentRequests = activeTab === 'received' ? receivedRequests : sentRequests;
    // Garantir que requests seja sempre um array
    const requests = Array.isArray(currentRequests.requests) ? currentRequests.requests : [];

    return (
        <AppLayout currentPage="friends">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitações de Amizade</h1>
                    <p className="text-gray-600">
                        Gerencie suas solicitações de amizade recebidas e enviadas
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('received')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'received'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                📨 Recebidas ({receivedRequests.requests.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('sent')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'sent'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                📤 Enviadas ({sentRequests.requests.length})
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Botões de ação */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <button
                                onClick={() => window.location.href = '/amigos'}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                            >
                                👥 Meus Amigos
                            </button>
                            <button
                                onClick={() => window.location.href = '/notificacoes'}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                🔔 Notificações
                            </button>
                            <button
                                onClick={() => {
                                    if (activeTab === 'received') {
                                        receivedRequests.refresh();
                                    } else {
                                        sentRequests.refresh();
                                    }
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                🔄 Atualizar
                            </button>
                        </div>

                        {/* Lista de solicitações */}
                        {currentRequests.loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                <p className="text-gray-600 mt-2">
                                    Carregando {activeTab === 'received' ? 'solicitações recebidas' : 'solicitações enviadas'}...
                                </p>
                            </div>
                        ) : currentRequests.error ? (
                            <div className="text-center py-8">
                                <p className="text-red-600 mb-4">
                                    Erro ao carregar solicitações: {currentRequests.error}
                                </p>
                                <button
                                    onClick={() => {
                                        if (activeTab === 'received') {
                                            receivedRequests.refresh();
                                        } else {
                                            sentRequests.refresh();
                                        }
                                    }}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        ) : requests.length > 0 ? (
                            <div className="grid gap-4">
                                {requests.map((request) => (
                                    <FriendRequestCard
                                        key={request.id}
                                        request={request}
                                        type={activeTab}
                                        onAccept={handleAcceptRequest}
                                        onReject={handleRejectRequest}
                                        onCancel={handleCancelRequest}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">
                                    {activeTab === 'received' ? '📨' : '📤'}
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {activeTab === 'received' 
                                        ? 'Nenhuma solicitação recebida' 
                                        : 'Nenhuma solicitação enviada'
                                    }
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {currentRequests.loading
                                        ? 'Carregando solicitações...'
                                        : activeTab === 'received'
                                            ? currentRequests.error
                                                ? `Erro: ${currentRequests.error}`
                                                : 'Quando alguém enviar uma solicitação de amizade, ela aparecerá aqui'
                                            : 'As solicitações que você enviar aparecerão aqui'
                                    }
                                </p>
                                {!currentRequests.loading && (
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => window.location.href = '/amigos'}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                        >
                                            Ver Meus Amigos
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (activeTab === 'received') {
                                                    receivedRequests.refresh();
                                                } else {
                                                    sentRequests.refresh();
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            🔄 Atualizar
                                        </button>
                                    </div>
                                )}
                                {/* Debug info - remover em produção */}
                                {process.env.NODE_ENV === 'development' && (
                                    <div className="mt-4 text-xs text-gray-400">
                                        Debug: requests={requests.length}, loading={currentRequests.loading ? 'true' : 'false'}, error={currentRequests.error || 'none'}, tab={activeTab}
                                    </div>
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

export default FriendRequestsPage;