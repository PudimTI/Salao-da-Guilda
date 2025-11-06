import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages, onLoadMore, hasMore, loading }) => {
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [isNearTop, setIsNearTop] = useState(false);

    // Scroll para o final quando novas mensagens chegarem
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Detectar quando está próximo do topo para carregar mais mensagens
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;

        const { scrollTop } = messagesContainerRef.current;
        setIsNearTop(scrollTop < 100);

        // Carregar mais mensagens quando estiver próximo do topo
        if (scrollTop < 50 && hasMore && !loading) {
            onLoadMore();
        }
    };

    // Scroll para o final quando mensagens mudarem (exceto quando carregando mais)
    useEffect(() => {
        if (!loading) {
            scrollToBottom();
        }
    }, [messages.length, loading]);

    // Formatar timestamp para exibição
    const formatTimestamp = (timestamp) => {
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
                weekday: 'short',
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else {
            return date.toLocaleDateString('pt-BR', { 
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });
        }
    };

    // Agrupar mensagens por data
    const groupMessagesByDate = (messages) => {
        const groups = [];
        let currentDate = null;
        let currentGroup = [];

        messages.forEach((message, index) => {
            const messageDate = new Date(message.created_at).toDateString();
            
            if (currentDate !== messageDate) {
                if (currentGroup.length > 0) {
                    groups.push({
                        date: currentDate,
                        messages: currentGroup
                    });
                }
                currentDate = messageDate;
                currentGroup = [message];
            } else {
                currentGroup.push(message);
            }
        });

        if (currentGroup.length > 0) {
            groups.push({
                date: currentDate,
                messages: currentGroup
            });
        }

        return groups;
    };

    // Determinar se deve mostrar timestamp da mensagem
    const shouldShowTimestamp = (message, previousMessage) => {
        if (!previousMessage) return true;
        
        const currentTime = new Date(message.created_at);
        const previousTime = new Date(previousMessage.created_at);
        const diffInMinutes = (currentTime - previousTime) / (1000 * 60);
        
        return diffInMinutes > 5; // Mostrar timestamp se passou mais de 5 minutos
    };

    const messageGroups = groupMessagesByDate(messages);

    return (
        <div 
            className="flex-1 overflow-y-auto" 
            ref={messagesContainerRef} 
            onScroll={handleScroll}
            style={{ height: '100%', maxHeight: '100%' }}
        >
            <div className="px-6 py-4 space-y-4">
                {/* Indicador de carregamento no topo */}
                {loading && hasMore && (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </div>
                )}

                {/* Mensagens agrupadas por data */}
                {messageGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-4">
                        {/* Separador de data */}
                        <div className="flex items-center justify-center">
                            <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                                {new Date(group.date).toLocaleDateString('pt-BR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>

                        {/* Mensagens do grupo */}
                        {group.messages.map((message, messageIndex) => {
                            const previousMessage = messageIndex > 0 
                                ? group.messages[messageIndex - 1] 
                                : null;
                            
                            return (
                                <div key={message.id} className="space-y-1">
                                    {/* Timestamp da mensagem */}
                                    {shouldShowTimestamp(message, previousMessage) && (
                                        <div className="flex justify-center">
                                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                {formatTimestamp(message.created_at)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Bubble da mensagem */}
                                    <MessageBubble
                                        message={message}
                                        showAvatar={shouldShowTimestamp(message, previousMessage)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Mensagem de boas-vindas quando não há mensagens */}
                {messages.length === 0 && !loading && (
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

            {/* Referência para scroll automático */}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
