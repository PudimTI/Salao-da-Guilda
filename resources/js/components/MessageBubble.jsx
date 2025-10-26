import React, { useState } from 'react';

const MessageBubble = ({ message, showAvatar = false }) => {
    const [showActions, setShowActions] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isOwnMessage = message.sender_id === currentUser.id;

    // Formatar timestamp da mensagem
    const formatMessageTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Renderizar conteúdo da mensagem
    const renderMessageContent = () => {
        if (message.media_url) {
            return (
                <div className="space-y-2">
                    {/* Mídia */}
                    <div className="max-w-xs">
                        {message.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                                src={message.media_url}
                                alt="Mídia"
                                className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(message.media_url, '_blank')}
                            />
                        ) : (
                            <div className="bg-gray-100 rounded-lg p-4 flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        Arquivo anexado
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Clique para abrir
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Texto da mensagem */}
                    {message.content && (
                        <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                            {message.content}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                {message.content}
            </p>
        );
    };

    return (
        <div
            className={`flex items-end space-x-2 group ${
                isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
            }`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Avatar */}
            {showAvatar && !isOwnMessage && (
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {message.sender?.name?.charAt(0) || 'U'}
                </div>
            )}

            {/* Container da mensagem */}
            <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* Nome do remetente (apenas para mensagens de outros usuários) */}
                {showAvatar && !isOwnMessage && (
                    <p className="text-xs text-gray-500 mb-1 px-1">
                        {message.sender?.name || 'Usuário'}
                    </p>
                )}

                {/* Bubble da mensagem */}
                <div
                    className={`relative px-4 py-2 rounded-2xl ${
                        isOwnMessage
                            ? 'bg-purple-600 text-white rounded-br-md'
                            : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                    }`}
                >
                    {renderMessageContent()}

                    {/* Timestamp */}
                    <div className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                        {formatMessageTime(message.created_at)}
                    </div>

                    {/* Indicador de edição */}
                    {message.edited_at && (
                        <div className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-purple-100' : 'text-gray-400'
                        }`}>
                            (editado)
                        </div>
                    )}
                </div>

                {/* Ações da mensagem */}
                {showActions && (
                    <div className={`flex items-center space-x-1 mt-1 ${
                        isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                        {/* Botão de reação */}
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        {/* Botão de resposta */}
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </button>

                        {/* Botões de ação para mensagens próprias */}
                        {isOwnMessage && (
                            <>
                                <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Espaçamento para mensagens próprias */}
            {isOwnMessage && !showAvatar && <div className="w-8"></div>}
        </div>
    );
};

export default MessageBubble;
