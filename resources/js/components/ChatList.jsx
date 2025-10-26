import React, { useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

const ChatList = ({ onSelectConversation, selectedConversationId }) => {
    const {
        conversations,
        loading,
        error,
        loadConversations
    } = useChat();

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const formatLastMessage = (message) => {
        if (!message) return 'Nenhuma mensagem';
        return message.content?.length > 50 
            ? message.content.substring(0, 50) + '...'
            : message.content;
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else if (diffInHours < 168) { // 7 dias
            return date.toLocaleDateString('pt-BR', { 
                weekday: 'short' 
            });
        } else {
            return date.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit' 
            });
        }
    };

    if (loading) {
        return (
            <div className="p-4">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-600">
                <p>Erro ao carregar conversas: {error}</p>
                <button 
                    onClick={loadConversations}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Cabeçalho */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Conversas</h2>
            </div>

            {/* Lista de Conversas */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <p>Nenhuma conversa encontrada</p>
                        <p className="text-sm mt-1">Inicie uma nova conversa com seus amigos!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {conversations.map((conversation) => {
                            const isSelected = selectedConversationId === conversation.id;
                            const lastMessage = conversation.messages?.[0];
                            
                            return (
                                <div
                                    key={conversation.id}
                                    onClick={() => onSelectConversation(conversation)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                                        isSelected ? 'bg-purple-50 border-r-4 border-purple-600' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* Avatar da conversa */}
                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                            {conversation.type === 'dm' && conversation.participants?.length > 0 ? (
                                                // Para DM, mostrar avatar do outro participante
                                                conversation.participants.find(p => p.user?.id !== 1)?.user?.avatar ? (
                                                    <img 
                                                        src={conversation.participants.find(p => p.user?.id !== 1).user.avatar}
                                                        alt="Avatar"
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                    </svg>
                                                )
                                            ) : (
                                                // Para grupos, mostrar ícone de grupo
                                                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16.5c-.8 0-1.54.5-1.85 1.26L12.5 16H15v6h5zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9l-1.5-4.5A1.5 1.5 0 0 0 6 9H4.5c-.8 0-1.54.5-1.85 1.26L1.5 13H4v9h3.5z"/>
                                                </svg>
                                            )}
                                        </div>

                                        {/* Conteúdo da conversa */}
                                        <div className="flex-1 min-w-0">
                                            {/* Nome da conversa */}
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-gray-800 truncate">
                                                    {conversation.title || 
                                                     (conversation.type === 'dm' 
                                                        ? conversation.participants?.find(p => p.user?.id !== 1)?.user?.name || 'Conversa'
                                                        : `Grupo (${conversation.participants?.length || 0})`
                                                     )}
                                                </h3>
                                                {lastMessage && (
                                                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                        {formatTime(lastMessage.created_at)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Última mensagem */}
                                            <p className="text-sm text-gray-600 truncate">
                                                {lastMessage ? (
                                                    <span>
                                                        <span className="font-medium">
                                                            {lastMessage.sender?.name || 'Usuário'}:
                                                        </span>{' '}
                                                        {formatLastMessage(lastMessage)}
                                                    </span>
                                                ) : (
                                                    'Nenhuma mensagem'
                                                )}
                                            </p>

                                            {/* Indicadores */}
                                            <div className="flex items-center space-x-2 mt-1">
                                                {conversation.type === 'dm' && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        DM
                                                    </span>
                                                )}
                                                {conversation.type === 'group' && (
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                        Grupo
                                                    </span>
                                                )}
                                                {conversation.type === 'campaign' && (
                                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                                        Campanha
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;
