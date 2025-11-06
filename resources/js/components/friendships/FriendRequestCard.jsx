import React from 'react';

const FriendRequestCard = ({ request, onAccept, onReject, onCancel, type = 'received' }) => {
    // A API retorna fromUser/toUser (relacionamentos Eloquent)
    // Para solicitações recebidas: fromUser é quem enviou
    // Para solicitações enviadas: toUser é quem recebeu
    const userData = type === 'received' 
        ? (request.from_user || request.fromUser || {})
        : (request.to_user || request.toUser || {});
    
    // Extrair dados do usuário com fallbacks
    const displayName = userData.display_name || userData.name || 'Usuário';
    const handle = userData.handle || userData.username || '';
    const avatar = userData.avatar_url || userData.avatar || `https://via.placeholder.com/60/8B5CF6/FFFFFF?text=${displayName.charAt(0)}`;
    const bio = userData.bio || '';
    const isOnline = userData.status === 'online' || userData.is_online === true;
    
    const handleAccept = () => {
        onAccept(request.id);
    };

    const handleReject = () => {
        if (window.confirm(`Tem certeza que deseja rejeitar a solicitação de ${displayName}?`)) {
            onReject(request.id);
        }
    };

    const handleCancel = () => {
        if (window.confirm(`Tem certeza que deseja cancelar a solicitação para ${displayName}?`)) {
            onCancel(request.id);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="relative">
                    <img
                        src={avatar}
                        alt={displayName}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                            // Fallback se a imagem falhar ao carregar
                            e.target.src = `https://via.placeholder.com/60/8B5CF6/FFFFFF?text=${displayName.charAt(0)}`;
                        }}
                    />
                    {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                </div>

                {/* Informações do usuário */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {displayName}
                    </h3>
                    {handle && (
                        <p className="text-sm text-gray-500 truncate">
                            @{handle}
                        </p>
                    )}
                    {bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {bio}
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
                        {type === 'received' ? 'Enviou solicitação' : 'Solicitação enviada'} em {
                            request.created_at 
                                ? new Date(request.created_at).toLocaleDateString()
                                : 'Data desconhecida'
                        }
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