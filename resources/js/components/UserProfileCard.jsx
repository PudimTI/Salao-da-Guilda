import React, { useState } from 'react';
import { useRelationshipStatus } from '../hooks/useFriendships';
import axios from 'axios';

const UserProfileCard = ({ user, onClose, onNavigate }) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { status, loading, sendFriendRequest, refresh } = useRelationshipStatus(user.id);

    const handleSendRequest = async () => {
        if (!message.trim()) {
            alert('Digite uma mensagem para a solicitação');
            return;
        }

        setIsLoading(true);
        try {
            await sendFriendRequest(message);
            await refresh();
            alert('Solicitação enviada com sucesso!');
            onClose();
        } catch (error) {
            alert('Erro ao enviar solicitação: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Função para iniciar chat
    const handleStartChat = async () => {
        setIsLoading(true);
        try {
            // Criar ou buscar conversa DM existente
            const response = await axios.post('/api/chat/conversations', {
                participants: [user.id],
                type: 'dm'
            });

            if (response.data.success) {
                if (onNavigate) {
                    onNavigate('/chat', { conversation: response.data.data });
                } else {
                    // Fallback: redirecionar para chat
                    window.location.href = '/chat';
                }
                onClose();
            }
        } catch (error) {
            console.error('Erro ao iniciar chat:', error);
            alert('Erro ao iniciar conversa');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusText = (status) => {
        switch (status?.status) {
            case 'no_relationship': return 'Não são amigos';
            case 'request_sent': return 'Solicitação enviada';
            case 'request_received': return 'Solicitação recebida';
            case 'active': return 'São amigos';
            case 'blocked_by_user': return 'Usuário bloqueado';
            default: return 'Verificando...';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.status) {
            case 'no_relationship': return 'text-blue-600';
            case 'request_sent': return 'text-yellow-600';
            case 'request_received': return 'text-green-600';
            case 'active': return 'text-green-600';
            case 'blocked_by_user': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.status) {
            case 'no_relationship': return '👤';
            case 'request_sent': return '⏳';
            case 'request_received': return '📨';
            case 'active': return '✅';
            case 'blocked_by_user': return '🚫';
            default: return '❓';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Perfil do Usuário
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="px-6 py-4">
                    {/* Informações do usuário */}
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.display_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <svg className="w-10 h-10 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xl font-semibold text-gray-900">
                                {user.display_name}
                            </h4>
                            <p className="text-gray-600">@{user.handle}</p>
                            <div className="flex items-center space-x-2 mt-2">
                                <span className="text-2xl">{getStatusIcon(status)}</span>
                                <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                                    {loading ? 'Verificando...' : getStatusText(status)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <div className="mb-6">
                            <p className="text-gray-700">{user.bio}</p>
                        </div>
                    )}

                    {/* Formulário de solicitação */}
                    {status?.status === 'no_relationship' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mensagem para a solicitação
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Digite uma mensagem para acompanhar a solicitação..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Status específico */}
                    {status?.status === 'request_sent' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <p className="text-yellow-800 text-sm">
                                Você já enviou uma solicitação de amizade para este usuário. 
                                Aguarde a resposta.
                            </p>
                        </div>
                    )}

                    {status?.status === 'request_received' && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <p className="text-green-800 text-sm">
                                Este usuário enviou uma solicitação de amizade para você. 
                                Acesse a página de solicitações para responder.
                            </p>
                        </div>
                    )}

                    {status?.status === 'active' && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <p className="text-green-800 text-sm">
                                Vocês são amigos! Você pode interagir livremente.
                            </p>
                        </div>
                    )}

                    {status?.status === 'blocked_by_user' && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-red-800 text-sm">
                                Este usuário bloqueou você. Você não pode enviar solicitações.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Fechar
                        </button>
                        
                        <div className="flex space-x-2">
                            {status?.status === 'active' && (
                                <button
                                    onClick={handleStartChat}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>{isLoading ? 'Abrindo...' : 'Mensagem'}</span>
                                </button>
                            )}
                            
                            {status?.status === 'no_relationship' && (
                                <>
                                    <button
                                        onClick={handleSendRequest}
                                        disabled={isLoading || !message.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? 'Enviando...' : 'Enviar Solicitação'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileCard;
