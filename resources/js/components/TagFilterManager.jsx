import React, { useState, useEffect } from 'react';
import TagSelector from './TagSelector';

const TagFilterManager = ({ filters, onUpdate }) => {
    const [whitelistTags, setWhitelistTags] = useState([]);
    const [blacklistTags, setBlacklistTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('whitelist');

    useEffect(() => {
        if (filters) {
            // Carregar tags completas se temos apenas IDs
            loadTags(filters.whitelist_tags || [], 'whitelist');
            loadTags(filters.blacklist_tags || [], 'blacklist');
        }
    }, [filters]);

    const loadTags = async (tagIds, type) => {
        if (!tagIds || tagIds.length === 0) {
            if (type === 'whitelist') setWhitelistTags([]);
            else setBlacklistTags([]);
            return;
        }

        try {
            // Buscar tags por IDs
            const idsParam = Array.isArray(tagIds) ? tagIds.join(',') : tagIds;
            const response = await fetch(`/api/tags?ids=${idsParam}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const tags = data.data || [];
                // Garantir que temos objetos com id e name
                const formattedTags = tags.map(tag => ({
                    id: tag.id,
                    name: tag.name,
                    type: tag.type
                }));
                
                if (type === 'whitelist') {
                    setWhitelistTags(formattedTags);
                } else {
                    setBlacklistTags(formattedTags);
                }
            }
        } catch (err) {
            console.error('Erro ao carregar tags:', err);
            // Se falhar, pelo menos manter os IDs
            if (type === 'whitelist') {
                setWhitelistTags(tagIds.map(id => ({ id, name: `Tag #${id}` })));
            } else {
                setBlacklistTags(tagIds.map(id => ({ id, name: `Tag #${id}` })));
            }
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const filtersData = {
                whitelist_tags: whitelistTags.map(tag => tag.id),
                blacklist_tags: blacklistTags.map(tag => tag.id),
            };

            await window.profileService.updateFilters(filtersData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            if (onUpdate) {
                onUpdate();
            }
        } catch (err) {
            console.error('Erro ao salvar filtros:', err);
            setError(err.message || 'Erro ao salvar filtros');
        } finally {
            setLoading(false);
        }
    };

    const handleWhitelistChange = (tags) => {
        setWhitelistTags(tags);
    };

    const handleBlacklistChange = (tags) => {
        setBlacklistTags(tags);
    };

    const removeWhitelistTag = (tagId) => {
        setWhitelistTags(prev => prev.filter(tag => tag.id !== tagId));
    };

    const removeBlacklistTag = (tagId) => {
        setBlacklistTags(prev => prev.filter(tag => tag.id !== tagId));
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('whitelist')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'whitelist'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Whitelist (Permitir)
                    </button>
                    <button
                        onClick={() => setActiveTab('blacklist')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'blacklist'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Blacklist (Bloquear)
                    </button>
                </nav>
            </div>

            {/* Mensagens de feedback */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    Filtros salvos com sucesso!
                </div>
            )}

            {/* Whitelist Tab */}
            {activeTab === 'whitelist' && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Tags Permitidas (Whitelist)
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Apenas conteúdo com estas tags será exibido para você. Se vazio, todas as tags são permitidas.
                        </p>
                    </div>

                    <TagSelector
                        selectedTags={whitelistTags}
                        onTagsChange={handleWhitelistChange}
                        placeholder="Busque tags para adicionar à whitelist..."
                        maxTags={50}
                    />

                    {whitelistTags.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Tags na Whitelist:</h4>
                            <div className="flex flex-wrap gap-2">
                                {whitelistTags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                                    >
                                        {tag.name}
                                        <button
                                            onClick={() => removeWhitelistTag(tag.id)}
                                            className="ml-2 text-green-600 hover:text-green-800"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Blacklist Tab */}
            {activeTab === 'blacklist' && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Tags Bloqueadas (Blacklist)
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Conteúdo com estas tags será ocultado para você.
                        </p>
                    </div>

                    <TagSelector
                        selectedTags={blacklistTags}
                        onTagsChange={handleBlacklistChange}
                        placeholder="Busque tags para adicionar à blacklist..."
                        maxTags={50}
                    />

                    {blacklistTags.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Tags na Blacklist:</h4>
                            <div className="flex flex-wrap gap-2">
                                {blacklistTags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                                    >
                                        {tag.name}
                                        <button
                                            onClick={() => removeBlacklistTag(tag.id)}
                                            className="ml-2 text-red-600 hover:text-red-800"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Botão de Salvar */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Salvando...' : 'Salvar Filtros'}
                </button>
            </div>
        </div>
    );
};

export default TagFilterManager;

