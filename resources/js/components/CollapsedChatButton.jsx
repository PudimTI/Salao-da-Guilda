import React, { useState, useEffect } from 'react';
import FloatingChat from './FloatingChat';

const CollapsedChatButton = ({ className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Buscar contagem de mensagens não lidas
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) return;

                const response = await fetch('/api/chat/conversations', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data) {
                        // Calcular total de mensagens não lidas
                        let totalUnread = 0;
                        if (Array.isArray(data.data)) {
                            // Se for array direto
                            totalUnread = data.data.reduce((sum, conv) => {
                                return sum + (conv.unread_count || 0);
                            }, 0);
                        } else if (data.data.data) {
                            // Se for paginação
                            totalUnread = data.data.data.reduce((sum, conv) => {
                                return sum + (conv.unread_count || 0);
                            }, 0);
                        }
                        setUnreadCount(totalUnread);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar contagem de mensagens não lidas:', error);
            }
        };

        fetchUnreadCount();
        
        // Atualizar a cada 30 segundos
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, []);

    // Escutar eventos de broadcasting para atualizar contagem em tempo real
    useEffect(() => {
        const echo = window.Echo;
        if (!echo) return;

        // Refrescar contagem quando uma nova mensagem chegar
        // Usar um evento global ou simplesmente recarregar a contagem
        const refreshUnreadCount = () => {
            const fetchUnreadCount = async () => {
                try {
                    const token = localStorage.getItem('auth_token');
                    if (!token) return;

                    const response = await fetch('/api/chat/conversations', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.data) {
                            let totalUnread = 0;
                            if (Array.isArray(data.data)) {
                                totalUnread = data.data.reduce((sum, conv) => {
                                    return sum + (conv.unread_count || 0);
                                }, 0);
                            } else if (data.data.data) {
                                totalUnread = data.data.data.reduce((sum, conv) => {
                                    return sum + (conv.unread_count || 0);
                                }, 0);
                            }
                            setUnreadCount(totalUnread);
                        }
                    }
                } catch (error) {
                    console.error('Erro ao atualizar contagem:', error);
                }
            };
            fetchUnreadCount();
        };

        // Escutar evento customizado quando mensagem for enviada
        // Atualizar contagem após um pequeno delay para garantir que o backend atualizou
        const handleMessage = () => {
            setTimeout(refreshUnreadCount, 500);
        };

        // Adicionar listener global para novas mensagens
        window.addEventListener('chat:new-message', handleMessage);

        return () => {
            window.removeEventListener('chat:new-message', handleMessage);
        };
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {!isOpen && (
                <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
                    <button
                        onClick={handleToggle}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3 group"
                    >
                        {/* Ícone de chat ou indicador de nova mensagem */}
                        <div className="relative">
                            {unreadCount > 0 ? (
                                <div className="relative">
                                    <svg 
                                        className="w-6 h-6" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                                        />
                                    </svg>
                                    {/* Badge de notificação */}
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                </div>
                            ) : (
                                <svg 
                                    className="w-6 h-6" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                                    />
                                </svg>
                            )}
                        </div>

                        {/* Texto "Mensagens" */}
                        <span className="font-medium text-sm">
                            Mensagens
                        </span>

                        {/* SVG indicando abertura */}
                        <svg 
                            className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M9 5l7 7-7 7" 
                            />
                        </svg>
                    </button>
                </div>
            )}

            {/* Chat flutuante quando aberto */}
            {isOpen && (
                <FloatingChat 
                    isOpen={isOpen} 
                    onToggle={handleToggle}
                    className={className}
                />
            )}
        </>
    );
};

export default CollapsedChatButton;

