import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import FloatingChat from '../components/FloatingChat';

// Componente para página de feed com chat integrado
const FeedPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newPost, setNewPost] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Carregar posts do feed
    const loadPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get('/api/posts/', {
                params: { 
                    per_page: 20,
                    visibility: 'public'
                }
            });
            
            if (response.data.success) {
                setPosts(response.data.data.data);
            }
        } catch (err) {
            setError('Erro ao carregar posts');
            console.error('Erro ao carregar posts:', err);
        } finally {
            setLoading(false);
        }
    };

    // Criar novo post
    const createPost = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        try {
            const response = await axios.post('/api/posts/', {
                content: newPost.trim(),
                visibility: 'public'
            });

            if (response.data.success) {
                setPosts(prev => [response.data.data, ...prev]);
                setNewPost('');
            }
        } catch (err) {
            console.error('Erro ao criar post:', err);
        }
    };

    // Curtir post
    const likePost = async (postId) => {
        try {
            const response = await axios.post(`/api/posts/${postId}/like`);
            if (response.data.success) {
                setPosts(prev => prev.map(post => 
                    post.id === postId 
                        ? { ...post, likes_count: post.likes_count + 1, liked: true }
                        : post
                ));
            }
        } catch (err) {
            console.error('Erro ao curtir post:', err);
        }
    };

    // Carregar posts ao montar o componente
    useEffect(() => {
        loadPosts();
    }, []);

    return (
        <AppLayout showChat={true}>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
                                    <p className="mt-2 text-gray-600">
                                        Veja o que está acontecendo na comunidade
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
                                    <span>Chat</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conteúdo principal */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Criar novo post */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <form onSubmit={createPost}>
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {JSON.parse(localStorage.getItem('user') || '{}').name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={newPost}
                                        onChange={(e) => setNewPost(e.target.value)}
                                        placeholder="O que está acontecendo?"
                                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows={3}
                                    />
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="text-sm text-gray-500">
                                            {newPost.length}/5000 caracteres
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!newPost.trim()}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Publicar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Lista de posts */}
                    {loading ? (
                        /* Loading state */
                        <div className="space-y-6">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
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
                            <p className="text-gray-500 mb-4">Não foi possível carregar os posts</p>
                            <button
                                onClick={loadPosts}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    ) : posts.length > 0 ? (
                        /* Lista de posts */
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    {/* Header do post */}
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                            {post.author?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {post.author?.name || 'Usuário'}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                @{post.author?.handle || 'usuario'} • {new Date(post.created_at).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Conteúdo do post */}
                                    <div className="mb-4">
                                        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                                    </div>

                                    {/* Ações do post */}
                                    <div className="flex items-center space-x-6 text-gray-500">
                                        <button
                                            onClick={() => likePost(post.id)}
                                            className={`flex items-center space-x-2 hover:text-purple-600 transition-colors ${
                                                post.liked ? 'text-purple-600' : ''
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            <span>{post.likes_count || 0}</span>
                                        </button>
                                        
                                        <button className="flex items-center space-x-2 hover:text-purple-600 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <span>{post.comments_count || 0}</span>
                                        </button>
                                        
                                        <button className="flex items-center space-x-2 hover:text-purple-600 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <span>{post.reposts_count || 0}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Estado vazio */
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Nenhum post ainda
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Seja o primeiro a compartilhar algo com a comunidade
                            </p>
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

export default FeedPage;
