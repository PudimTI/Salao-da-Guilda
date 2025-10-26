import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import UserHeaderCard from './UserHeaderCard';
import CharacterCard from './CharacterCard';
import CharacterForm from './CharacterForm';
import UserPosts from './UserPosts';
import CreatePostModal from './CreatePostModal';
import PostManagement from './PostManagement';
import { apiGet, apiPost } from '../utils/api';

const UserProfilePage = () => {
    const [profileData, setProfileData] = useState(null);
    const [characters, setCharacters] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCharacterForm, setShowCharacterForm] = useState(false);
    const [editingCharacter, setEditingCharacter] = useState(null);
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);
    const [showPostManagement, setShowPostManagement] = useState(false);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            console.log('📥 UserProfilePage: Iniciando carregamento de dados do perfil');
            setLoading(true);
            setError(null);

            console.log('📥 UserProfilePage: Carregando dados em paralelo...');
            // Carregar dados do perfil, personagens e posts em paralelo
            const [profileResponse, charactersResponse, postsResponse] = await Promise.all([
                window.profileService.getProfile(),
                window.profileService.getCharacters(),
                window.profileService.getPosts()
            ]);

            console.log('📥 UserProfilePage: Dados carregados:', {
                profile: profileResponse,
                characters: charactersResponse.characters?.length || 0,
                posts: postsResponse.posts?.length || 0
            });

            setProfileData(profileResponse);
            setCharacters(charactersResponse.characters || []);
            setPosts(postsResponse.posts || []);
            
            console.log('✅ UserProfilePage: Dados do perfil carregados com sucesso');
        } catch (err) {
            console.error('❌ UserProfilePage: Erro ao carregar dados do perfil:', {
                message: err.message,
                stack: err.stack
            });
            setError('Erro ao carregar dados do perfil');
        } finally {
            setLoading(false);
            console.log('📥 UserProfilePage: Carregamento finalizado');
        }
    };

    const handleProfileUpdate = async (updatedData) => {
        try {
            console.log('🔄 UserProfilePage: Iniciando atualização de perfil', updatedData);
            console.log('🔄 UserProfilePage: Chamando ProfileService.updateProfile');
            
            await window.profileService.updateProfile(updatedData);
            
            console.log('✅ UserProfilePage: Perfil atualizado com sucesso, recarregando dados');
            await loadProfileData(); // Recarregar dados
            
            console.log('✅ UserProfilePage: Dados do perfil recarregados');
        } catch (err) {
            console.error('❌ UserProfilePage: Erro ao atualizar perfil:', {
                message: err.message,
                stack: err.stack,
                updatedData: updatedData
            });
            setError('Erro ao atualizar perfil');
        }
    };

    const handleCreateCharacter = () => {
        setEditingCharacter(null);
        setShowCharacterForm(true);
    };

    const handleEditCharacter = (characterId, characterData) => {
        const character = characters.find(c => c.id === characterId);
        setEditingCharacter(character);
        setShowCharacterForm(true);
    };

    const handleSaveCharacter = async (characterData) => {
        try {
            if (editingCharacter) {
                // Atualizar personagem existente
                console.log('Atualizando personagem:', editingCharacter.id, characterData);
                // TODO: Implementar chamada para API de atualização
            } else {
                // Criar novo personagem
                console.log('Criando novo personagem:', characterData);
                // TODO: Implementar chamada para API de criação
            }
            
            setShowCharacterForm(false);
            setEditingCharacter(null);
            await loadProfileData(); // Recarregar dados
        } catch (err) {
            console.error('Erro ao salvar personagem:', err);
            setError('Erro ao salvar personagem');
        }
    };

    const handleCancelCharacterForm = () => {
        setShowCharacterForm(false);
        setEditingCharacter(null);
    };

    const handleJoinCampaign = (characterId) => {
        console.log('Personagem entrando em campanha:', characterId);
        // TODO: Implementar lógica para entrar em campanha
    };

    const handlePostCreated = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    const handlePostUpdated = (updatedPost) => {
        setPosts(prev => prev.map(post => 
            post.id === updatedPost.id ? updatedPost : post
        ));
    };

    const handlePostDeleted = (postId) => {
        setPosts(prev => prev.filter(post => post.id !== postId));
    };

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

    if (loading) {
        return (
            <div className="min-h-screen bg-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="mt-4 text-purple-600">Carregando perfil...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={loadProfileData}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-purple-50 flex items-center justify-center">
                <p className="text-purple-600">Nenhum dado encontrado</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-purple-50">
            <Header user={profileData?.user} />

            <div className="flex">
                {/* Barra lateral esquerda */}
                <div className="w-1/4 bg-purple-100 min-h-screen">
                </div>

                {/* Área principal centralizada */}
                <main className="flex-1 bg-white min-h-screen">
                    <div className="px-6 py-10">
                        <div className="max-w-4xl mx-auto">
                            <UserHeaderCard 
                                user={profileData.user} 
                                stats={profileData.stats}
                                preferences={profileData.preferences}
                                onUpdate={handleProfileUpdate}
                            />

                            <section className="mt-10">
                                <h2 className="text-xl font-semibold text-purple-800 text-center mb-4">Personagens</h2>
                                <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow-lg shadow-purple-100">
                                    <div className="space-y-6">
                                        {characters.map((character) => (
                                            <CharacterCard 
                                                key={character.id} 
                                                character={character}
                                                onEdit={handleEditCharacter}
                                                onJoinCampaign={handleJoinCampaign}
                                            />
                                        ))}
                                        <div className="flex items-center justify-center mt-2">
                                            <button 
                                                onClick={handleCreateCharacter}
                                                className="inline-flex items-center space-x-2 text-white bg-purple-600 border border-purple-600 px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v12m6-6H6" />
                                                </svg>
                                                <span>Criar novo</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mt-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-purple-800">Posts</h2>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setShowCreatePostModal(true)}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span>Novo Post</span>
                                        </button>
                                        <button
                                            onClick={() => setShowPostManagement(!showPostManagement)}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{showPostManagement ? 'Visualizar' : 'Gerenciar'}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow-lg shadow-purple-100">
                                    {showPostManagement ? (
                                        <PostManagement
                                            posts={posts}
                                            onPostUpdated={handlePostUpdated}
                                            onPostDeleted={handlePostDeleted}
                                        />
                                    ) : (
                                        <UserPosts 
                                            posts={posts} 
                                            onLike={handleLike}
                                            onRepost={handleRepost}
                                            onComment={handleComment}
                                        />
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </main>

                {/* Barra lateral direita */}
                <div className="w-1/4 bg-purple-100 min-h-screen">
                </div>
            </div>

            <Footer />
            
            {/* Modal de formulário de personagem */}
            {showCharacterForm && (
                <CharacterForm
                    character={editingCharacter}
                    onSave={handleSaveCharacter}
                    onCancel={handleCancelCharacterForm}
                />
            )}

            {/* Modal de criação de post */}
            <CreatePostModal
                isOpen={showCreatePostModal}
                onClose={() => setShowCreatePostModal(false)}
                onPostCreated={handlePostCreated}
            />
        </div>
    );
};

export default UserProfilePage;




