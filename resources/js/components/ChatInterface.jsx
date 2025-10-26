import React, { useState, useEffect } from 'react';
import { useChatDM } from '../hooks/useChatDM';
import ChatSidebar from './ChatSidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserSearch from './UserSearch';
import TypingIndicator from './TypingIndicator';

const ChatInterface = () => {
    const {
        conversations,
        currentConversation,
        messages,
        loading,
        error,
        typingUsers,
        setCurrentConversation,
        sendMessage,
        createDMConversation,
        loadMessages
    } = useChatDM();

    const [showUserSearch, setShowUserSearch] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);

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

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar com lista de conversas */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <ChatSidebar
                    conversations={conversations}
                    currentConversation={currentConversation}
                    onConversationSelect={setCurrentConversation}
                    onNewChat={() => setShowUserSearch(true)}
                    loading={loading}
                />
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
                                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5v-5a10 10 0 1 1 20 0v5z" />
                                        </svg>
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>
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
                        <div className="bg-white border-t border-gray-200 px-6 py-4">
                            <MessageInput
                                onSendMessage={sendMessage}
                                disabled={loading}
                            />
                        </div>
                    </>
                ) : (
                    /* Estado vazio quando não há conversa selecionada */
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Bem-vindo ao Chat DM
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Selecione uma conversa existente ou inicie uma nova conversa
                            </p>
                            <button
                                onClick={() => setShowUserSearch(true)}
                                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Iniciar Nova Conversa
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de busca de usuários */}
            {showUserSearch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Nova Conversa
                                </h3>
                                <button
                                    onClick={() => setShowUserSearch(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ChatInterface;