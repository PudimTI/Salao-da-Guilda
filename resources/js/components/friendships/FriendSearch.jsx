import React, { useState } from 'react';
import { useRelationshipStatus } from '../../hooks/useFriendships';

const FriendSearch = ({ onSendRequest }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { status, loading, sendRequest } = useRelationshipStatus(selectedUser?.id);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        
        setIsLoading(true);
        try {
            // Aqui você implementaria a busca de usuários
            // Por enquanto, vamos simular um resultado
            const mockUser = {
                id: 1,
                handle: searchTerm,
                display_name: `Usuário ${searchTerm}`,
                avatar_url: null
            };
            setSelectedUser(mockUser);
        } catch (error) {
            alert('Erro ao buscar usuário: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendRequest = async () => {
        if (!selectedUser) return;
        
        try {
            await sendRequest(message);
            alert('Solicitação enviada com sucesso!');
            setSelectedUser(null);
            setMessage('');
            setSearchTerm('');
        } catch (error) {
            alert('Erro ao enviar solicitação: ' + error.message);
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

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Buscar e Adicionar Amigos
            </h2>
            
            {/* Busca */}
            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite o nome ou @ do usuário"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading || !searchTerm.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Buscando...' : 'Buscar'}
                </button>
            </div>

            {/* Resultado da busca */}
            {selectedUser && (
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-4">
                        <img
                            src={selectedUser.avatar_url || '/images/default-avatar.png'}
                            alt={selectedUser.display_name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedUser.display_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                                @{selectedUser.handle}
                            </p>
                            <p className={`text-sm font-medium ${getStatusColor(status)}`}>
                                {loading ? 'Verificando...' : getStatusText(status)}
                            </p>
                        </div>
                    </div>

                    {/* Formulário de solicitação */}
                    {status?.status === 'no_relationship' && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mensagem (opcional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Digite uma mensagem para acompanhar a solicitação..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="mt-3 flex space-x-2">
                                <button
                                    onClick={handleSendRequest}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Solicitação'}
                                </button>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FriendSearch;
