import React, { useState, useEffect } from 'react';
import { useUserSearch } from '../../hooks/useFriendships';

const UserSearch = ({ onUserSelect, onSendRequest, placeholder = "Buscar usuários..." }) => {
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const { users, loading, searchUsers, clearUsers } = useUserSearch();

    // Debounce da busca
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.length >= 2) {
                searchUsers(query);
                setShowResults(true);
            } else {
                clearUsers();
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]); // Removido searchUsers e clearUsers das dependências

    const handleUserClick = (user) => {
        setQuery('');
        setShowResults(false);
        clearUsers();
        onUserSelect(user);
    };

    const handleSendRequest = (user) => {
        const message = prompt(`Enviar solicitação de amizade para ${user.name}? (opcional)`);
        if (message !== null) {
            onSendRequest(user.id, message);
        }
    };

    return (
        <div className="relative w-full">
            {/* Campo de busca */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    ) : (
                        <span className="text-gray-400">🔍</span>
                    )}
                </div>
            </div>

            {/* Resultados da busca */}
            {showResults && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => handleUserClick(user)}
                            >
                                <img
                                    src={user.avatar || 'https://via.placeholder.com/40/8B5CF6/FFFFFF?text=' + user.name.charAt(0)}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        @{user.username}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendRequest(user);
                                    }}
                                    className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                                >
                                    Adicionar
                                </button>
                            </div>
                        ))
                    ) : query.length >= 2 && !loading ? (
                        <div className="p-3 text-center text-gray-500 text-sm">
                            Nenhum usuário encontrado
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default UserSearch;
