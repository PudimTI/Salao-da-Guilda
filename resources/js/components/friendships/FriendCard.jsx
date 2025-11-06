import React from 'react';

const FriendCard = ({ friend, onRemove, onBlock, onChat }) => {
    // A API retorna friend.friend (relacionamento Eloquent)
    // Mas pode haver fallback para friend.user em alguns casos
    const userData = friend.friend || friend.user || {};
    const displayName = userData.display_name || userData.name || 'Usuário';
    const handle = userData.handle || userData.username || '';
    
    // Gerar inicial do nome com segurança
    const getInitial = (name) => {
        if (!name || typeof name !== 'string') return 'U';
        const firstChar = name.trim().charAt(0).toUpperCase();
        return firstChar.match(/[A-Z0-9]/) ? firstChar : 'U';
    };
    
    const initial = getInitial(displayName);
    // Usar data URI como fallback em vez de placeholder externo para evitar problemas de rede
    const defaultAvatar = `data:image/svg+xml;base64,${btoa(`<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#8B5CF6"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="24" font-weight="bold">${initial}</text></svg>`)}`;
    
    const avatar = userData.avatar_url || userData.avatar || defaultAvatar;
    const userId = userData.id || friend.friend_id;
    const isOnline = userData.status === 'online' || userData.is_online === true;
    const bio = userData.bio || '';
    const lastSeen = userData.last_seen || userData.last_login_at;
    
    // A API espera friend_id (ID do amigo), não friendship_id
    const handleRemove = () => {
        if (window.confirm(`Tem certeza que deseja remover ${displayName} dos seus amigos?`)) {
            onRemove(userId); // Enviar o ID do amigo, não o ID da amizade
        }
    };

    const handleBlock = () => {
        if (window.confirm(`Tem certeza que deseja bloquear ${displayName}?`)) {
            onBlock(userId);
        }
    };

    const handleChat = () => {
        onChat(userId);
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
                            // Prevenir loop infinito - só trocar uma vez para fallback
                            if (!e.target.src.includes('data:image')) {
                                // Usar o defaultAvatar já calculado
                                e.target.src = defaultAvatar;
                                // Prevenir novas tentativas
                                e.target.onerror = null;
                            }
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
                    <p className="text-xs text-gray-400 mt-1">
                        {isOnline 
                            ? 'Online agora' 
                            : lastSeen 
                                ? `Visto por último ${new Date(lastSeen).toLocaleDateString()}`
                                : 'Status desconhecido'
                        }
                    </p>
                </div>

                {/* Ações */}
                <div className="flex space-x-2">
                    <button
                        onClick={handleChat}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                        title="Iniciar conversa"
                    >
                        💬
                    </button>
                    <button
                        onClick={handleRemove}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                        title="Remover amigo"
                    >
                        ❌
                    </button>
                    <button
                        onClick={handleBlock}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                        title="Bloquear usuário"
                    >
                        🚫
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FriendCard;