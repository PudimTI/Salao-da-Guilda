import React, { useState } from 'react';
import { apiPost } from '../utils/api';
import TagSelector from './TagSelector';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [media, setMedia] = useState([]);
    const [mentions, setMentions] = useState([]);
    const [tags, setTags] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('visibility', visibility);
            
            // Adicionar mídia se houver (apenas arquivos válidos)
            media.forEach((file, index) => {
                if (file && file.size > 0 && file.name && file.type) {
                    formData.append(`media[]`, file);
                }
            });

            // Adicionar menções se houver
            if (mentions.length > 0) {
                formData.append('mentions', JSON.stringify(mentions));
            }

            // Adicionar tags se houver
            if (tags.length > 0) {
                formData.append('tags', JSON.stringify(tags.map(tag => tag.id)));
            }

            const data = await apiPost('/api/posts', formData);
            onPostCreated(data.post);
            
            // Reset form
            setContent('');
            setMedia([]);
            setMentions([]);
            setTags([]);
            setVisibility('public');
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        // Filtrar apenas arquivos válidos
        const validFiles = files.filter(file => {
            return file && file.size > 0 && file.name && file.type;
        });
        setMedia(validFiles);
    };

    const removeMedia = (index) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    const handleMentionChange = (e) => {
        const value = e.target.value;
        // Extrair menções do texto (formato @username)
        const mentionMatches = value.match(/@\w+/g);
        if (mentionMatches) {
            setMentions(mentionMatches.map(m => m.substring(1))); // Remove @
        } else {
            setMentions([]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Criar Post</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Conteúdo
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => {
                                    setContent(e.target.value);
                                    handleMentionChange(e);
                                }}
                                placeholder="O que você está pensando?"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows="4"
                                maxLength="2000"
                            />
                            <div className="text-right text-sm text-gray-500 mt-1">
                                {content.length}/2000
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Visibilidade
                            </label>
                            <select
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="public">Público</option>
                                <option value="private">Privado</option>
                                <option value="friends">Apenas Amigos</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags (opcional)
                            </label>
                            <TagSelector
                                selectedTags={tags}
                                onTagsChange={setTags}
                                type="post"
                                placeholder="Adicione tags para categorizar seu post..."
                                maxTags={5}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mídia (opcional)
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={handleMediaChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {media.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {media.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <span className="text-sm text-gray-600">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeMedia(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {mentions.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Menções
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {mentions.map((mention, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                            @{mention}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!content.trim() || isSubmitting}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Criando...' : 'Criar Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
