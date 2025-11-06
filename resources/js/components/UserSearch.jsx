import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const UserSearch = ({ onUserSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);

    // Focar no input quando o componente montar
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Buscar usuários com debounce
    useEffect(() => {
        if (!searchTerm.trim()) {
            setUsers([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            searchUsers(searchTerm);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Buscar usuários na API
    const searchUsers = async (query) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('/api/users/search', {
                params: { 
                    query: query, // Corrigido: usar 'query' em vez de 'q'
                    per_page: 10
                }
            });

            if (response.data.success) {
                // A resposta pode estar em data (array) ou data.data (paginação)
                const usersData = Array.isArray(response.data.data) 
                    ? response.data.data 
                    : (response.data.data?.data || response.data.data || []);
                
                // Mapear campos da API para o formato esperado pelo componente
                const mappedUsers = usersData.map(user => ({
                    id: user.id,
                    name: user.name || user.display_name || 'Usuário',
                    display_name: user.display_name || user.name,
                    handle: user.username || user.handle || 'usuario',
                    avatar_url: user.avatar || user.avatar_url,
                    bio: user.bio,
                    is_online: user.is_online || false,
                    last_seen: user.last_seen || user.last_login_at
                }));
                
                setUsers(mappedUsers);
            }
        } catch (err) {
            setError('Erro ao buscar usuários');
            console.error('Erro ao buscar usuários:', err);
        } finally {
            setLoading(false);
        }
    };

    // Lidar com seleção de usuário
    const handleUserSelect = (user) => {
        onUserSelect(user);
    };

    // Lidar com navegação por teclado
    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < users.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && users[selectedIndex]) {
                    handleUserSelect(users[selectedIndex]);
                }
                break;
            case 'Escape':
                onClose();
                break;
        }
    };

    // Formatar status do usuário
    const formatUserStatus = (user) => {
        if (user.is_online) return 'Online';
        if (user.last_seen) {
            const lastSeen = new Date(user.last_seen);
            const now = new Date();
            const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
            
            if (diffInMinutes < 1) return 'Agora';
            if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
            
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) return `${diffInHours}h atrás`;
            
            return 'Offline';
        }
        return 'Offline';
    };

    // Obter cor do status
    const getStatusColor = (user) => {
        if (user.is_online) return 'bg-green-500';
        return 'bg-gray-400';
    };

    return (
        <div className="space-y-4">
            {/* Input de busca */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar usuários por nome ou @handle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>

            {/* Resultados da busca */}
            <div className="max-h-80 overflow-y-auto">
                {loading ? (
                    /* Loading state */
                    <div className="space-y-2">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    /* Error state */
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-red-600 mb-2">{error}</p>
                        <button
                            onClick={() => searchUsers(searchTerm)}
                            className="text-sm text-purple-600 hover:text-purple-700"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : users.length > 0 ? (
                    /* Lista de usuários */
                    <div className="space-y-1">
                        {users.map((user, index) => (
                            <div
                                key={user.id}
                                onClick={() => handleUserSelect(user)}
                                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                    selectedIndex === index
                                        ? 'bg-purple-50 border border-purple-200'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                        (user.avatar_url || user.avatar) ? 'bg-gray-200' : 'bg-purple-500'
                                    }`}>
                                        {(user.avatar_url || user.avatar) ? (
                                            <img
                                                src={user.avatar_url || user.avatar}
                                                alt={user.display_name || user.name || 'Usuário'}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            (user.display_name || user.name || 'U')?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </div>
                                    
                                    {/* Indicador de status */}
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(user)} border-2 border-white rounded-full`}></div>
                                </div>

                                {/* Informações do usuário */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {user.display_name || user.name || 'Usuário'}
                                        </h3>
                                        <span className="text-xs text-gray-500">
                                            {formatUserStatus(user)}
                                        </span>
                                    </div>
                                    
                                    <p className="text-xs text-gray-500 truncate">
                                        @{user.handle || user.username || 'usuario'}
                                    </p>
                                    
                                    {/* Informações adicionais */}
                                    {user.bio && (
                                        <p className="text-xs text-gray-400 truncate mt-1">
                                            {user.bio}
                                        </p>
                                    )}
                                </div>

                                {/* Botão de ação */}
                                <div className="flex-shrink-0">
                                    <button className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : searchTerm ? (
                    /* Estado vazio com busca */
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                            Nenhum usuário encontrado
                        </p>
                        <p className="text-xs text-gray-400">
                            Tente ajustar os termos de busca
                        </p>
                    </div>
                ) : (
                    /* Estado inicial */
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                            Busque por usuários
                        </p>
                        <p className="text-xs text-gray-400">
                            Digite o nome ou @handle do usuário
                        </p>
                    </div>
                )}
            </div>

            {/* Dicas de uso */}
            <div className="text-xs text-gray-500 space-y-1">
                <p>• Use as setas ↑↓ para navegar</p>
                <p>• Pressione Enter para selecionar</p>
                <p>• Pressione Esc para fechar</p>
            </div>
        </div>
    );
};

export default UserSearch;
