import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import FloatingChat from '../components/FloatingChat';

// Componente para página de amigos com chat integrado
const FriendsPage = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Carregar lista de amigos
    const loadFriends = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get('/api/friendships/', {
                params: { 
                    status: 'active',
                    per_page: 50
                }
            });
            
            if (response.data.success) {
                setFriends(response.data.data.data);
            }
        } catch (err) {
            setError('Erro ao carregar lista de amigos');
            console.error('Erro ao carregar amigos:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar amigos baseado na busca
    const filteredFriends = friends.filter(friendship => {
        if (!searchTerm) return true;
        
        const friend = friendship.friend;
        const search = searchTerm.toLowerCase();
        
        return (
            friend.name?.toLowerCase().includes(search) ||
            friend.handle?.toLowerCase().includes(search)
        );
    });

    // Carregar amigos ao montar o componente
    useEffect(() => {
        loadFriends();
    }, []);

    return (
        <AppLayout showChat={true}>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Amigos</h1>
                                    <p className="mt-2 text-gray-600">
                                        Conecte-se com outros jogadores e inicie conversas
                                    </p>
                                </div>
                                
                                {/* Botão para abrir chat */}
                                <button
                                    onClick={() => setIsChatOpen(true)}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>Abrir Chat</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conteúdo principal */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Barra de busca */}
                    <div className="mb-8">
                        <div className="relative max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar amigos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Lista de amigos */}
                    {loading ? (
                        /* Loading state */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        /* Error state */
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
                            <p className="text-gray-500 mb-4">Não foi possível carregar a lista de amigos</p>
                            <button
                                onClick={loadFriends}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    ) : filteredFriends.length > 0 ? (
                        /* Lista de amigos */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFriends.map((friendship) => {
                                const friend = friendship.friend;
                                
                                return (
                                    <div key={friendship.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            {/* Avatar */}
                                            <div className="relative">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                                                    friend.avatar_url ? 'bg-gray-200' : 'bg-purple-500'
                                                }`}>
                                                    {friend.avatar_url ? (
                                                        <img
                                                            src={friend.avatar_url}
                                                            alt={friend.name}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        friend.name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                
                                                {/* Indicador online */}
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                            </div>

                                            {/* Informações do amigo */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                                    {friend.name || 'Usuário'}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate">
                                                    @{friend.handle || 'usuario'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Amigos desde {new Date(friendship.since).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Ações */}
                                        <div className="mt-4 flex space-x-2">
                                            <button
                                                onClick={() => setIsChatOpen(true)}
                                                className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <span>Conversar</span>
                                            </button>
                                            
                                            <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                                Perfil
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Estado vazio */
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchTerm ? 'Nenhum amigo encontrado' : 'Nenhum amigo ainda'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm 
                                    ? 'Tente ajustar os termos de busca'
                                    : 'Adicione amigos para começar conversas'
                                }
                            </p>
                            {!searchTerm && (
                                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                                    Buscar Usuários
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat flutuante */}
            <FloatingChat
                isOpen={isChatOpen}
                onToggle={() => setIsChatOpen(!isChatOpen)}
            />
        </AppLayout>
    );
};

export default FriendsPage;