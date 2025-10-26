import React from 'react';

const FriendCard = ({ friend, onRemove, onBlock, onChat }) => {
    const { user } = friend;
    
    const handleRemove = () => {
        if (window.confirm(`Tem certeza que deseja remover ${user.name} dos seus amigos?`)) {
            onRemove(friend.friendship_id);
        }
    };

    const handleBlock = () => {
        if (window.confirm(`Tem certeza que deseja bloquear ${user.name}?`)) {
            onBlock(user.id);
        }
    };

    const handleChat = () => {
        onChat(user.id);
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
                    <p className="text-xs text-gray-400 mt-1">
                        {user.is_online ? 'Online agora' : `Visto por último ${new Date(user.last_seen).toLocaleDateString()}`}
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