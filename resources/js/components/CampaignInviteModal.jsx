import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiPost } from '../utils/api';
import friendshipService from '../services/friendshipService';
import toast from 'react-hot-toast';

const CampaignInviteModal = ({ isOpen, onClose, campaignId, campaignName, onInviteSuccess }) => {
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [error, setError] = useState(null);
    const [invitingFriendId, setInvitingFriendId] = useState(null);
    const [inviteMessage, setInviteMessage] = useState('');
    const [showMessageInput, setShowMessageInput] = useState(null); // ID do amigo para mostrar input
    const isLoadingRef = useRef(false);

    // Carregar amigos quando o modal abrir
    const loadFriends = useCallback(async () => {
        if (isLoadingRef.current) return;
        
        isLoadingRef.current = true;
        setLoadingFriends(true);
        setError(null);

        try {
            const params = {};
            if (searchQuery) {
                params.search = searchQuery;
            }
            
            const response = await friendshipService.getFriends(params);
            // A resposta pode estar em response.data.data (paginação) ou response.data (array direto)
            let friendsList = [];
            if (response?.data) {
                if (Array.isArray(response.data)) {
                    friendsList = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    friendsList = response.data.data;
                }
            }
            setFriends(friendsList);
        } catch (error) {
            console.error('Erro ao carregar amigos:', error);
            setError(error.message || 'Erro ao carregar lista de amigos');
            toast.error('Erro ao carregar lista de amigos');
        } finally {
            setLoadingFriends(false);
            isLoadingRef.current = false;
        }
    }, [searchQuery]);

    useEffect(() => {
        if (isOpen) {
            loadFriends();
        } else {
            // Limpar estado quando fechar
            setFriends([]);
            setSearchQuery('');
            setInviteMessage('');
            setShowMessageInput(null);
            setInvitingFriendId(null);
            setError(null);
        }
    }, [isOpen, loadFriends]);

    // Buscar amigos quando o termo de pesquisa mudar (com debounce)
    useEffect(() => {
        if (!isOpen) return;

        const timeoutId = setTimeout(() => {
            loadFriends();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, isOpen, loadFriends]);

    const handleInviteFriend = async (friend, message = '') => {
        // Aceitar tanto friend.friend quanto friend.user
        const friendData = friend.friend || friend.user;
        
        if (!friendData?.email) {
            toast.error('Email do amigo não encontrado');
            return;
        }

        setInvitingFriendId(friendData.id);
        setLoading(true);
        setError(null);

        try {
            const endpoint = `/campaigns/${campaignId}/invites/invite-user`;
            const payload = {
                email: friendData.email,
                message: message || ''
            };

            await apiPost(endpoint, payload);
            
            toast.success(`Convite enviado para ${friendData.display_name || friendData.name}!`);
            
            // Fechar input de mensagem se estiver aberto
            if (showMessageInput === friendData.id) {
                setShowMessageInput(null);
                setInviteMessage('');
            }

            if (onInviteSuccess) {
                onInviteSuccess();
            }
        } catch (error) {
            console.error('Erro ao enviar convite:', error);
            const errorMessage = error.response?.data?.message || 'Erro ao enviar convite';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            setInvitingFriendId(null);
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setInviteMessage('');
        setShowMessageInput(null);
        setInvitingFriendId(null);
        setError(null);
        setFriends([]);
        onClose();
    };

    // Filtrar amigos localmente também (além da busca no servidor)
    const filteredFriends = friends.filter(friend => {
        // Aceitar tanto friend.friend quanto friend.user
        const friendData = friend.friend || friend.user;
        if (!friendData) return false;
        const searchLower = searchQuery.toLowerCase();
        return !searchQuery || 
            friendData.display_name?.toLowerCase().includes(searchLower) ||
            friendData.name?.toLowerCase().includes(searchLower) ||
            friendData.handle?.toLowerCase().includes(searchLower) ||
            friendData.username?.toLowerCase().includes(searchLower) ||
            friendData.email?.toLowerCase().includes(searchLower);
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[600px] max-w-[90vw] shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Convidar Amigos para {campaignName}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    {/* Campo de pesquisa */}
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Pesquisar amigos..."
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <svg 
                                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {error && !loading && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Lista de amigos */}
                    <div className="max-h-[400px] overflow-y-auto mb-4">
                        {loadingFriends ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                <p className="mt-2 text-sm text-gray-500">Carregando amigos...</p>
                            </div>
                        ) : filteredFriends.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">
                                    {searchQuery ? 'Nenhum amigo encontrado com esta pesquisa.' : 'Você não tem amigos ainda.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredFriends
                                    .filter(friend => {
                                        // Aceitar tanto friend.friend quanto friend.user
                                        const friendData = friend.friend || friend.user;
                                        return friend && friendData && friendData.id;
                                    })
                                    .map((friend) => {
                                        // Aceitar tanto friend.friend quanto friend.user (com prioridade para friend)
                                        const friendData = friend.friend || friend.user;
                                        const friendName = (friendData.display_name || friendData.name || 'Usuário').trim();
                                        const isInviting = invitingFriendId === friendData.id;
                                        const friendshipId = friend.friendship_id || friend.id || friendData.id;
                                        
                                        if (!friendName) return null;

                                        return (
                                            <div 
                                                key={friendshipId} 
                                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center flex-1 min-w-0">
                                                    {/* Avatar */}
                                                    <div className="flex-shrink-0 mr-3">
                                                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                                                            {friendData.avatar_url || friendData.avatar ? (
                                                                <img 
                                                                    src={friendData.avatar_url || friendData.avatar} 
                                                                    alt={friendName}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                friendName.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Informações do amigo */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {friendName}
                                                            </p>
                                                            {friendData.name && friendData.name !== friendData.display_name && (
                                                                <span className="text-xs text-gray-500 truncate">
                                                                    ({friendData.name})
                                                                </span>
                                                            )}
                                                        </div>
                                                        {(friendData.handle || friendData.username) && (
                                                            <p className="text-xs text-gray-500 truncate">
                                                                @{friendData.handle || friendData.username}
                                                            </p>
                                                        )}
                                                        {friendData.email && (
                                                            <p className="text-xs text-gray-400 truncate">
                                                                {friendData.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Botão de convidar */}
                                                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                                                    {showMessageInput === friendData.id ? (
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="text"
                                                                value={inviteMessage}
                                                                onChange={(e) => setInviteMessage(e.target.value)}
                                                                placeholder="Mensagem (opcional)"
                                                                maxLength={500}
                                                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleInviteFriend(friend, inviteMessage);
                                                                    }
                                                                    if (e.key === 'Escape') {
                                                                        setShowMessageInput(null);
                                                                        setInviteMessage('');
                                                                    }
                                                                }}
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleInviteFriend(friend, inviteMessage)}
                                                                disabled={loading && isInviting}
                                                                className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {loading && isInviting ? 'Enviando...' : 'Enviar'}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setShowMessageInput(null);
                                                                    setInviteMessage('');
                                                                }}
                                                                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setShowMessageInput(friendData.id);
                                                                setInviteMessage('');
                                                            }}
                                                            disabled={loading}
                                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Convidar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignInviteModal;
