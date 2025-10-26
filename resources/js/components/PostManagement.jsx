import React, { useState } from 'react';
import { apiPut, apiDelete } from '../utils/api';

const PostManagement = ({ posts, onPostUpdated, onPostDeleted }) => {
    const [editingPost, setEditingPost] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editVisibility, setEditVisibility] = useState('public');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleEdit = (post) => {
        setEditingPost(post);
        setEditContent(post.content);
        setEditVisibility(post.visibility);
        setError(null);
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const data = await apiPut(`/api/posts/${editingPost.id}`, {
                content: editContent,
                visibility: editVisibility,
            });
            onPostUpdated(data.post);
            setEditingPost(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!confirm('Tem certeza que deseja excluir este post?')) return;

        try {
            await apiDelete(`/api/posts/${postId}`);
            onPostDeleted(postId);
        } catch (err) {
            alert('Erro ao excluir post: ' + err.message);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getVisibilityLabel = (visibility) => {
        const labels = {
            'public': 'Público',
            'private': 'Privado',
            'friends': 'Amigos',
        };
        return labels[visibility] || visibility;
    };

    const getVisibilityColor = (visibility) => {
        const colors = {
            'public': 'bg-green-100 text-green-800',
            'private': 'bg-red-100 text-red-800',
            'friends': 'bg-yellow-100 text-yellow-800',
        };
        return colors[visibility] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-4">
            {posts.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum post encontrado.</p>
                </div>
            ) : (
                posts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        {editingPost && editingPost.id === post.id ? (
                            // Modo de edição
                            <div className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                        {error}
                                    </div>
                                )}
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Conteúdo
                                    </label>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        maxLength="2000"
                                    />
                                    <div className="text-right text-sm text-gray-500 mt-1">
                                        {editContent.length}/2000
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Visibilidade
                                    </label>
                                    <select
                                        value={editVisibility}
                                        onChange={(e) => setEditVisibility(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="public">Público</option>
                                        <option value="private">Privado</option>
                                        <option value="friends">Apenas Amigos</option>
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setEditingPost(null)}
                                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={!editContent.trim() || isSubmitting}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Modo de visualização
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                                        
                                        {post.media && post.media.length > 0 && (
                                            <div className="mt-3 grid grid-cols-1 gap-2">
                                                {post.media.map((media, index) => (
                                                    <div key={index} className="relative">
                                                        {media.type.startsWith('image/') ? (
                                                            <img 
                                                                src={media.url} 
                                                                alt={`Mídia ${index + 1}`}
                                                                className="w-full h-48 object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <video 
                                                                src={media.url} 
                                                                controls
                                                                className="w-full h-48 object-cover rounded-lg"
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center space-x-4">
                                        <span>{formatDate(post.created_at)}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(post.visibility)}`}>
                                            {getVisibilityLabel(post.visibility)}
                                        </span>
                                        <span>{post.likes_count || 0} curtidas</span>
                                        <span>{post.comments_count || 0} comentários</span>
                                        <span>{post.reposts_count || 0} reposts</span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEdit(post)}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default PostManagement;
