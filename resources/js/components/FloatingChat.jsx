import React, { useState, useEffect } from 'react';
import { useChatDM } from '../hooks/useChatDM';
import ChatSidebar from './ChatSidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserSearch from './UserSearch';
import TypingIndicator from './TypingIndicator';

// Componente de chat flutuante para integração em qualquer página
const FloatingChat = ({ isOpen, onToggle, className = '' }) => {
    const {
        conversations,
        currentConversation,
        messages,
        loading,
        error,
        typingUsers,
        unreadCounts,
        setCurrentConversation,
        sendMessage,
        createDMConversation,
        loadMessages,
        startTyping,
        stopTyping
    } = useChatDM();

    const [showUserSearch, setShowUserSearch] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);

    // Calcular total de mensagens não lidas
    const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

    // Carregar mais mensagens quando chegar ao topo
    const handleLoadMoreMessages = async () => {
        if (!currentConversation || !hasMoreMessages || loading) return;

        const oldestMessage = messages[messages.length - 1];
        if (!oldestMessage) return;

        const result = await loadMessages(currentConversation.id, oldestMessage.id);
        
        if (result && result.data.length < 50) {
            setHasMoreMessages(false);
        }
    };

    // Lidar com seleção de usuário para nova conversa
    const handleUserSelect = async (user) => {
        try {
            const conversation = await createDMConversation(user.id);
            if (conversation) {
                setCurrentConversation(conversation);
                setShowUserSearch(false);
            }
        } catch (err) {
            console.error('Erro ao criar conversa:', err);
        }
    };

    // Resetar estado quando mudar de conversa
    useEffect(() => {
        setHasMoreMessages(true);
    }, [currentConversation]);

    if (!isOpen) {
        return (
            <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
                <button
                    onClick={onToggle}
                    className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors relative"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    
                    {/* Badge de notificação */}
                    {totalUnreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                        </span>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 ${className}`} style={{ width: '400px', height: '600px' }}>
            <div className="flex flex-col h-full">
                {/* Header do chat */}
                <div className="bg-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">Chat DM</h3>
                        {totalUnreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {totalUnreadCount} não lidas
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onToggle}
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Conteúdo do chat */}
                <div className="flex-1 flex overflow-hidden">
                    {currentConversation ? (
                        <>
                            {/* Área de mensagens */}
                            <div className="flex-1 flex flex-col">
                                {/* Header da conversa */}
                                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                            {currentConversation.participants
                                                ?.find(p => p.user_id !== JSON.parse(localStorage.getItem('user') || '{}').id)
                                                ?.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {currentConversation.participants
                                                    ?.find(p => p.user_id !== JSON.parse(localStorage.getItem('user') || '{}').id)
                                                    ?.user?.name || 'Usuário'}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                @{currentConversation.participants
                                                    ?.find(p => p.user_id !== JSON.parse(localStorage.getItem('user') || '{}').id)
                                                    ?.user?.handle || 'usuario'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Lista de mensagens */}
                                <div className="flex-1 overflow-hidden">
                                    <MessageList
                                        messages={messages}
                                        onLoadMore={handleLoadMoreMessages}
                                        hasMore={hasMoreMessages}
                                        loading={loading}
                                    />
                                    
                                    {/* Indicador de digitação */}
                                    {typingUsers.length > 0 && (
                                        <TypingIndicator users={typingUsers} />
                                    )}
                                </div>

                                {/* Input de mensagem */}
                                <div className="border-t border-gray-200 p-3">
                                    <MessageInput
                                        onSendMessage={sendMessage}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Lista de conversas quando nenhuma está selecionada */
                        <div className="flex-1">
                            <ChatSidebar
                                conversations={conversations}
                                currentConversation={currentConversation}
                                onConversationSelect={setCurrentConversation}
                                onNewChat={() => setShowUserSearch(true)}
                                loading={loading}
                            />
                        </div>
                    )}
                </div>

                {/* Modal de busca de usuários */}
                {showUserSearch && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Nova Conversa
                                    </h3>
                                    <button
                                        onClick={() => setShowUserSearch(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <UserSearch
                                    onUserSelect={handleUserSelect}
                                    onClose={() => setShowUserSearch(false)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Exibir erro se houver */}
                {error && (
                    <div className="absolute top-16 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloatingChat;
