import React from 'react';

const FriendRequestCard = ({ request, onAccept, onReject, onCancel, type = 'received' }) => {
    const user = type === 'received' ? request.sender : request.receiver;
    
    const handleAccept = () => {
        onAccept(request.id);
    };

    const handleReject = () => {
        if (window.confirm(`Tem certeza que deseja rejeitar a solicitação de ${user.name}?`)) {
            onReject(request.id);
        }
    };

    const handleCancel = () => {
        if (window.confirm(`Tem certeza que deseja cancelar a solicitação para ${user.name}?`)) {
            onCancel(request.id);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="relative">
                    <img
                        src={user.avatar || 'https://via.placeholder.com/60/8B5CF6/FFFFFF?text=' + user.name.charAt(0)}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    {user.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                </div>

                {/* Informações do usuário */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {user.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                        @{user.username}
                    </p>
                    {user.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {user.bio}
                        </p>
                    )}
                    {request.message && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700 italic">
                                "{request.message}"
                            </p>
                        </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                        {type === 'received' ? 'Enviou solicitação' : 'Solicitação enviada'} em {new Date(request.created_at).toLocaleDateString()}
                    </p>
                </div>

                {/* Ações */}
                <div className="flex space-x-2">
                    {type === 'received' ? (
                        <>
                            <button
                                onClick={handleAccept}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                title="Aceitar solicitação"
                            >
                                ✅ Aceitar
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                                title="Rejeitar solicitação"
                            >
                                ❌ Rejeitar
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleCancel}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                            title="Cancelar solicitação"
                        >
                            🚫 Cancelar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendRequestCard;