import React, { useState } from 'react';

const ChatSidebar = ({ 
    conversations, 
    currentConversation, 
    onConversationSelect, 
    onNewChat, 
    loading 
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar conversas baseado na busca
    const filteredConversations = conversations.filter(conversation => {
        if (!searchTerm) return true;
        
        const otherParticipant = conversation.participants?.find(
            p => p.user_id !== JSON.parse(localStorage.getItem('user') || '{}').id
        );
        
        if (!otherParticipant) return false;
        
        const userName = otherParticipant.user?.name?.toLowerCase() || '';
        const userHandle = otherParticipant.user?.handle?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return userName.includes(search) || userHandle.includes(search);
    });

    // Formatar timestamp relativo
    const formatRelativeTime = (timestamp) => {
        if (!timestamp) return '';
        
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Agora';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d`;
        
        return messageTime.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
        });
    };

    // Truncar texto da última mensagem
    const truncateMessage = (text, maxLength = 50) => {
        if (!text) return 'Nenhuma mensagem';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Obter informações do outro participante
    const getOtherParticipant = (conversation) => {
        return conversation.participants?.find(
            p => p.user_id !== JSON.parse(localStorage.getItem('user') || '{}').id
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Conversas
                    </h1>
                    <button
                        onClick={onNewChat}
                        className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Nova conversa"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                </div>

                {/* Barra de busca */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar conversas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Lista de conversas */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    /* Loading state */
                    <div className="p-4 space-y-3">
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
                ) : filteredConversations.length > 0 ? (
                    /* Lista de conversas */
                    <div className="p-2">
                        {filteredConversations.map((conversation) => {
                            const otherParticipant = getOtherParticipant(conversation);
                            const isActive = currentConversation?.id === conversation.id;
                            const unreadCount = conversation.unread_count || 0;

                            return (
                                <div
                                    key={conversation.id}
                                    onClick={() => onConversationSelect(conversation)}
                                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                        isActive
                                            ? 'bg-purple-50 border border-purple-200'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                                            otherParticipant?.user?.avatar_url 
                                                ? 'bg-gray-200' 
                                                : 'bg-purple-500'
                                        }`}>
                                            {otherParticipant?.user?.avatar_url ? (
                                                <img
                                                    src={otherParticipant.user.avatar_url}
                                                    alt={otherParticipant.user.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                otherParticipant?.user?.name?.charAt(0) || 'U'
                                            )}
                                        </div>
                                        
                                        {/* Indicador online */}
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>

                                    {/* Informações da conversa */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className={`text-sm font-medium truncate ${
                                                isActive ? 'text-purple-900' : 'text-gray-900'
                                            }`}>
                                                {otherParticipant?.user?.name || 'Usuário'}
                                            </h3>
                                            <span className={`text-xs ${
                                                isActive ? 'text-purple-600' : 'text-gray-500'
                                            }`}>
                                                {formatRelativeTime(conversation.last_activity_at)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-1">
                                            <p className={`text-sm truncate ${
                                                isActive ? 'text-purple-700' : 'text-gray-500'
                                            }`}>
                                                {truncateMessage(conversation.last_message?.content)}
                                            </p>
                                            
                                            {/* Contador de não lidas */}
                                            {unreadCount > 0 && (
                                                <div className="bg-purple-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Estado vazio */
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                                {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">
                                {searchTerm 
                                    ? 'Tente ajustar os termos de busca'
                                    : 'Inicie uma nova conversa para começar'
                                }
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={onNewChat}
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Nova conversa
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer com informações do usuário */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {JSON.parse(localStorage.getItem('user') || '{}').name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {JSON.parse(localStorage.getItem('user') || '{}').name || 'Usuário'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            @{JSON.parse(localStorage.getItem('user') || '{}').handle || 'usuario'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatSidebar;
