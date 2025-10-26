import React, { useState, useEffect } from 'react';
import { useChatDM } from '../hooks/useChatDM';
import axios from 'axios';

// Componente que integra chat DM com sistema de amizades
const ChatDMWithFriends = () => {
    const {
        conversations,
        currentConversation,
        messages,
        sendMessage,
        createDMConversation,
        setCurrentConversation,
        loadConversations
    } = useChatDM();

    const [friends, setFriends] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [showFriendsList, setShowFriendsList] = useState(false);

    // Carregar lista de amigos
    const loadFriends = async () => {
        try {
            setLoadingFriends(true);
            const response = await axios.get('/api/friendships/', {
                params: { status: 'active' }
            });
            
            if (response.data.success) {
                setFriends(response.data.data.data);
            }
        } catch (err) {
            console.error('Erro ao carregar amigos:', err);
        } finally {
            setLoadingFriends(false);
        }
    };

    // Iniciar conversa com amigo
    const startChatWithFriend = async (friend) => {
        try {
            // Verificar se já existe conversa DM
            const existingConversation = conversations.find(conv => {
                const otherParticipant = conv.participants?.find(
                    p => p.user_id === friend.friend_id
                );
                return otherParticipant && conv.type === 'dm';
            });

            if (existingConversation) {
                setCurrentConversation(existingConversation);
            } else {
                // Criar nova conversa DM
                const conversation = await createDMConversation(friend.friend_id);
                if (conversation) {
                    setCurrentConversation(conversation);
                }
            }
            
            setShowFriendsList(false);
        } catch (err) {
            console.error('Erro ao iniciar conversa:', err);
        }
    };

    // Carregar amigos ao montar o componente
    useEffect(() => {
        loadFriends();
    }, []);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar com amigos */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Amigos
                        </h1>
                        <button
                            onClick={() => setShowFriendsList(!showFriendsList)}
                            className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Lista de amigos */}
                <div className="flex-1 overflow-y-auto p-2">
                    {loadingFriends ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : friends.length > 0 ? (
                        <div className="space-y-2">
                            {friends.map((friendship) => {
                                const friend = friendship.friend;
                                const hasConversation = conversations.some(conv => {
                                    const otherParticipant = conv.participants?.find(
                                        p => p.user_id === friend.id
                                    );
                                    return otherParticipant && conv.type === 'dm';
                                });

                                return (
                                    <div
                                        key={friendship.id}
                                        onClick={() => startChatWithFriend(friendship)}
                                        className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Avatar */}
                                        <div className="relative">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                                                friend.avatar_url ? 'bg-gray-200' : 'bg-purple-500'
                                            }`}>
                                                {friend.avatar_url ? (
                                                    <img
                                                        src={friend.avatar_url}
                                                        alt={friend.name}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    friend.name?.charAt(0) || 'U'
                                                )}
                                            </div>
                                            
                                            {/* Indicador online */}
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>

                                        {/* Informações do amigo */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {friend.name || 'Usuário'}
                                                </h3>
                                                {hasConversation && (
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                )}
                                            </div>
                                            
                                            <p className="text-xs text-gray-500 truncate">
                                                @{friend.handle || 'usuario'}
                                            </p>
                                            
                                            <p className="text-xs text-gray-400 truncate">
                                                Amigos desde {new Date(friendship.since).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>

                                        {/* Botão de chat */}
                                        <div className="flex-shrink-0">
                                            <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Nenhum amigo ainda
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Adicione amigos para começar conversas
                                </p>
                                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                                    Buscar usuários
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Área principal do chat */}
            <div className="flex-1 flex flex-col">
                {currentConversation ? (
                    <>
                        {/* Header da conversa */}
                        <div className="bg-white border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        {currentConversation.participants
                                            ?.find(p => p.user_id !== JSON.parse(localStorage.getItem('user'))?.id)
                                            ?.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {currentConversation.participants
                                                ?.find(p => p.user_id !== JSON.parse(localStorage.getItem('user'))?.id)
                                                ?.user?.name || 'Usuário'}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {currentConversation.participants
                                                ?.find(p => p.user_id !== JSON.parse(localStorage.getItem('user'))?.id)
                                                ?.user?.handle || '@usuario'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                        Amigo
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Lista de mensagens */}
                        <div className="flex-1 overflow-hidden">
                            <div className="h-full overflow-y-auto px-6 py-4">
                                {messages.length > 0 ? (
                                    <div className="space-y-4">
                                        {messages.map((message) => (
                                            <div key={message.id} className="flex items-start space-x-3">
                                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                    {message.sender?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                                                        <p className="text-sm text-gray-900">{message.content}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(message.created_at).toLocaleTimeString('pt-BR')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                Nenhuma mensagem ainda
                                            </h3>
                                            <p className="text-gray-500">
                                                Envie a primeira mensagem para começar a conversa
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input de mensagem */}
                        <div className="bg-white border-t border-gray-200 px-6 py-4">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            const message = e.target.value.trim();
                                            if (message) {
                                                sendMessage(message);
                                                e.target.value = '';
                                            }
                                        }
                                    }}
                                />
                                <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Estado vazio */
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Bem-vindo ao Chat com Amigos
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Selecione um amigo para iniciar uma conversa
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatDMWithFriends;
