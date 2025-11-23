import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import Recommendations from './Recommendations';
import FeedPost from './FeedPost';
import CreatePostModal from './CreatePostModal';
import TagFilter from './TagFilter';
import CollapsedChatButton from './CollapsedChatButton';
import { apiGet, apiPost } from '../utils/api';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
    });
    const hasLoadedInitially = useRef(false);

    const fetchPosts = async (pageNum = 1) => {
        try {
            setLoading(true);
            
            // Construir parâmetros da URL
            const params = new URLSearchParams();
            params.append('page', pageNum);
            
            // Adicionar filtros de tags se houver
            if (selectedTags.length > 0) {
                selectedTags.forEach(tag => {
                    params.append('tags[]', tag.id);
                });
            }
            
            const data = await apiGet(`/api/posts?${params.toString()}`);
            
            if (pageNum === 1) {
                setPosts(data.posts.data);
            } else {
                setPosts(prev => [...prev, ...data.posts.data]);
            }
            
            setPagination(prev => ({
                ...prev,
                ...(data.pagination || {}),
            }));
            setPage(pageNum);
            const hasNextPage = data.pagination
                ? data.pagination.current_page < data.pagination.last_page
                : (data.posts.meta?.current_page || pageNum) < (data.posts.meta?.total_pages || pageNum);
            setHasMore(hasNextPage);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debug do localStorage ao montar o componente
        console.log('🏠 [Feed] Componente montado');
        console.log('📦 [Feed] Verificando localStorage...');
        console.log('📦 [Feed] Todos os itens do localStorage:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            console.log(`  - ${key}:`, value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : 'null');
        }
        
        const token = localStorage.getItem('auth_token');
        console.log('🎫 [Feed] Token auth_token:', token ? `SIM (${token.substring(0, 30)}...)` : 'NÃO');
        console.log('🎫 [Feed] Token completo:', token);
        
        fetchPosts().finally(() => {
            hasLoadedInitially.current = true;
        });
    }, []);

    // Recarregar posts quando as tags selecionadas mudarem
    useEffect(() => {
        if (!hasLoadedInitially.current) {
            return;
        }
        setPage(1);
        fetchPosts(1);
    }, [selectedTags]);

    const handleLike = async (postId) => {
        try {
            const data = await apiPost(`/api/posts/${postId}/like`);
            
            setPosts(prev => prev.map(post => 
                post.id === postId 
                    ? { 
                        ...post, 
                        is_liked: data.liked,
                        likes_count: data.likes_count 
                    }
                    : post
            ));
        } catch (err) {
            console.error('Erro ao curtir:', err);
        }
    };

    const handleRepost = async (postId) => {
        try {
            const data = await apiPost(`/api/posts/${postId}/repost`);
            
            setPosts(prev => prev.map(post => 
                post.id === postId 
                    ? { 
                        ...post, 
                        is_reposted: data.reposted,
                        reposts_count: data.reposts_count 
                    }
                    : post
            ));
        } catch (err) {
            console.error('Erro ao repostar:', err);
        }
    };

    const handleComment = async (postId, content) => {
        try {
            const data = await apiPost(`/api/posts/${postId}/comment`, { content });
            
            setPosts(prev => prev.map(post => 
                post.id === postId 
                    ? { 
                        ...post, 
                        comments: [...(post.comments || []), data.comment],
                        comments_count: (post.comments_count || 0) + 1
                    }
                    : post
            ));
        } catch (err) {
            console.error('Erro ao comentar:', err);
            throw err;
        }
    };

    const handlePostCreated = (newPost) => {
        const matchesSelectedTags = selectedTags.length === 0
            || (newPost.tags || []).some(tag =>
                selectedTags.some(selected => selected.id === tag.id)
            );

        if (matchesSelectedTags) {
            setPosts(prev => [newPost, ...prev]);
        }

        // Atualizar contador de páginas caso o novo post altere o total
        setPagination(prev => ({
            ...prev,
            total: (prev.total || 0) + 1,
        }));
    };

    const handleTagClick = (tag) => {
        setSelectedTags(prev => {
            const alreadySelected = prev.some(selected => selected.id === tag.id);
            if (alreadySelected) {
                return prev;
            }
            return [...prev, tag];
        });
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage);
        }
    };

    if (loading && posts.length === 0) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <main>
                    <div className="py-16 px-6">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Carregando posts...</p>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
                <CollapsedChatButton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <main>
                    <div className="py-16 px-6">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center">
                                <p className="text-red-600 mb-4">Erro: {error}</p>
                                <button 
                                    onClick={() => fetchPosts()}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
                <CollapsedChatButton />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main>
                <Recommendations />

                <section className="py-16 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">
                                Feed
                            </h2>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Criar Post</span>
                            </button>
                        </div>

                        {/* Filtros de Tags */}
                        <div className="mb-6">
                            <TagFilter
                                onFilterChange={setSelectedTags}
                                selectedTags={selectedTags}
                                type="post"
                                className="mb-4"
                            />
                        </div>

                        {posts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600">Nenhum post encontrado.</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-8">
                                    {posts.map((post) => (
                                        <FeedPost 
                                            key={post.id} 
                                            post={post}
                                            onLike={handleLike}
                                            onRepost={handleRepost}
                                            onComment={handleComment}
                                            onTagClick={handleTagClick}
                                        />
                                    ))}
                                </div>

                                {hasMore && (
                                    <div className="text-center mt-8">
                                        <button
                                            onClick={loadMore}
                                            disabled={loading}
                                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                        >
                                            {loading ? 'Carregando...' : 'Carregar mais'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
            
            {/* Botão de chat recolhido */}
            <CollapsedChatButton />
            
            {/* Modal de criação de post */}
            <CreatePostModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onPostCreated={handlePostCreated}
            />
        </div>
    );
};

export default Feed;




