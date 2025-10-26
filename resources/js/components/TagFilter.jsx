import React, { useState, useEffect } from 'react';

const TagFilter = ({ 
    onFilterChange, 
    selectedTags = [], 
    type = null,
    className = ""
}) => {
    const [availableTags, setAvailableTags] = useState([]);
    const [loading, setLoading] = useState(false);

    // Carregar tags populares
    useEffect(() => {
        loadPopularTags();
    }, [type]);

    const loadPopularTags = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: '20' });
            if (type) params.append('type', type);
            
            const response = await fetch(`/api/tags/popular?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAvailableTags(data.data);
            }
        } catch (error) {
            console.error('Erro ao carregar tags:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTag = (tag) => {
        const isSelected = selectedTags.some(t => t.id === tag.id);
        let newSelectedTags;
        
        if (isSelected) {
            newSelectedTags = selectedTags.filter(t => t.id !== tag.id);
        } else {
            newSelectedTags = [...selectedTags, tag];
        }
        
        onFilterChange(newSelectedTags);
    };

    const clearAllTags = () => {
        onFilterChange([]);
    };

    const getTagColor = (tag, isSelected) => {
        if (isSelected) {
            return 'bg-purple-600 text-white border-purple-600';
        }
        
        const colors = {
            'post': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
            'campaign': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
            'general': 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
        };
        return colors[tag.type] || colors.general;
    };

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                    Filtrar por Tags
                </h3>
                {selectedTags.length > 0 && (
                    <button
                        onClick={clearAllTags}
                        className="text-sm text-purple-600 hover:text-purple-800"
                    >
                        Limpar todos
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => {
                        const isSelected = selectedTags.some(t => t.id === tag.id);
                        return (
                            <button
                                key={tag.id}
                                onClick={() => toggleTag(tag)}
                                className={`
                                    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors
                                    ${getTagColor(tag, isSelected)}
                                `}
                            >
                                <span>{tag.name}</span>
                                <span className="ml-1 text-xs opacity-75">
                                    ({tag.usage_count})
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {selectedTags.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">
                        Tags selecionadas:
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.map(tag => (
                            <span
                                key={tag.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border border-purple-200"
                            >
                                {tag.name}
                                <button
                                    onClick={() => toggleTag(tag)}
                                    className="ml-1 text-purple-600 hover:text-purple-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagFilter;
