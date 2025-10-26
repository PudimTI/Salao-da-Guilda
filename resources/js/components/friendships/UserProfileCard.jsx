import React, { useState } from 'react';
import { useRelationshipStatus } from '../../hooks/useFriendships';

const UserProfileCard = ({ user, isOpen, onClose, onChat }) => {
    const [showMessageInput, setShowMessageInput] = useState(false);
    const [message, setMessage] = useState('');
    const { status, loading, sendFriendRequest, blockUser, unblockUser } = useRelationshipStatus(user?.id);

    if (!isOpen || !user) return null;

    const handleSendRequest = async () => {
        try {
            await sendFriendRequest(message);
            alert('Solicitação enviada com sucesso!');
            setShowMessageInput(false);
            setMessage('');
        } catch (error) {
            alert('Erro ao enviar solicitação: ' + error.message);
        }
    };

    const handleBlock = async () => {
        if (window.confirm(`Tem certeza que deseja bloquear ${user.name}?`)) {
            try {
                await blockUser();
                alert('Usuário bloqueado com sucesso!');
                onClose();
            } catch (error) {
                alert('Erro ao bloquear usuário: ' + error.message);
            }
        }
    };

    const handleUnblock = async () => {
        try {
            await unblockUser();
            alert('Usuário desbloqueado com sucesso!');
            onClose();
        } catch (error) {
            alert('Erro ao desbloquear usuário: ' + error.message);
        }
    };

    const handleChat = () => {
        onChat(user.id);
        onClose();
    };

    const getStatusText = () => {
        switch (status) {
            case 'no_relationship':
                return 'Não são amigos';
            case 'request_sent':
                return 'Solicitação enviada';
            case 'request_received':
                return 'Solicitação recebida';
            case 'active':
                return 'Amigos';
            case 'blocked_by_user':
                return 'Usuário bloqueado';
            default:
                return 'Verificando...';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'active':
                return 'text-green-600';
            case 'request_sent':
            case 'request_received':
                return 'text-yellow-600';
            case 'blocked_by_user':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Perfil do Usuário</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                    {/* Avatar e informações básicas */}
                    <div className="text-center mb-4">
                        <img
                            src={user.avatar || 'https://via.placeholder.com/100/8B5CF6/FFFFFF?text=' + user.name.charAt(0)}
                            alt={user.name}
                            className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                        />
                        <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        <p className={`text-sm font-medium mt-2 ${getStatusColor()}`}>
                            {loading ? 'Verificando...' : getStatusText()}
                        </p>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Sobre</h4>
                            <p className="text-sm text-gray-600">{user.bio}</p>
                        </div>
                    )}

                    {/* Status online */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            {user.is_online ? (
                                <span className="text-green-600">🟢 Online agora</span>
                            ) : (
                                <span className="text-gray-500">
                                    Visto por último em {new Date(user.last_seen).toLocaleDateString()}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Campo de mensagem para solicitação */}
                    {status === 'no_relationship' && showMessageInput && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mensagem (opcional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Digite uma mensagem para acompanhar sua solicitação..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                rows="3"
                            />
                        </div>
                    )}

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2">
                        {status === 'active' && (
                            <button
                                onClick={handleChat}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                            >
                                💬 Conversar
                            </button>
                        )}

                        {status === 'no_relationship' && (
                            <>
                                {!showMessageInput ? (
                                    <button
                                        onClick={() => setShowMessageInput(true)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        👋 Enviar Solicitação
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSendRequest}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            ✅ Enviar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowMessageInput(false);
                                                setMessage('');
                                            }}
                                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                        >
                                            ❌ Cancelar
                                        </button>
                                    </>
                                )}
                            </>
                        )}

                        {status === 'request_sent' && (
                            <div className="w-full text-center text-sm text-yellow-600">
                                Solicitação já enviada
                            </div>
                        )}

                        {status === 'request_received' && (
                            <div className="w-full text-center text-sm text-yellow-600">
                                Você tem uma solicitação deste usuário
                            </div>
                        )}

                        {status !== 'blocked_by_user' && status !== 'active' && (
                            <button
                                onClick={handleBlock}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                🚫 Bloquear
                            </button>
                        )}

                        {status === 'blocked_by_user' && (
                            <button
                                onClick={handleUnblock}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                🔓 Desbloquear
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileCard;
