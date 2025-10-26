import React, { useState, useEffect, useRef } from 'react';

const TagSelector = ({ 
    selectedTags = [], 
    onTagsChange, 
    type = null, 
    placeholder = "Digite para buscar tags...",
    maxTags = 5,
    className = ""
}) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Buscar sugestões de tags
    const searchTags = async (query) => {
        if (query.length < 1) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({ q: query });
            if (type) params.append('type', type);
            
            const response = await fetch(`/api/tags/autocomplete?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Filtrar tags que já estão selecionadas
                const filteredSuggestions = data.data.filter(tag => 
                    !selectedTags.some(selected => selected.id === tag.id)
                );
                setSuggestions(filteredSuggestions);
            }
        } catch (error) {
            console.error('Erro ao buscar tags:', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce da busca
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchTags(inputValue);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [inputValue, type, selectedTags]);

    // Adicionar tag selecionada
    const addTag = (tag) => {
        if (selectedTags.length < maxTags && !selectedTags.some(t => t.id === tag.id)) {
            onTagsChange([...selectedTags, tag]);
        }
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    // Remover tag
    const removeTag = (tagId) => {
        const newTags = selectedTags.filter(tag => tag.id !== tagId);
        onTagsChange(newTags);
    };

    // Criar nova tag
    const createTag = async (name) => {
        if (selectedTags.length >= maxTags) return;

        try {
            const response = await fetch('/api/tags', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name.trim(),
                    type: type,
                    description: '',
                    synonyms: []
                })
            });

            if (response.ok) {
                const data = await response.json();
                addTag(data.data);
            }
        } catch (error) {
            console.error('Erro ao criar tag:', error);
        }
    };

    // Lidar com teclas
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (suggestions.length > 0) {
                addTag(suggestions[0]);
            } else if (inputValue.trim()) {
                createTag(inputValue.trim());
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    // Lidar com clique fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current && 
                !suggestionsRef.current.contains(event.target) &&
                !inputRef.current?.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`}>
            {/* Tags selecionadas */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map(tag => (
                        <span
                            key={tag.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200"
                        >
                            {tag.name}
                            <button
                                type="button"
                                onClick={() => removeTag(tag.id)}
                                className="ml-2 text-purple-600 hover:text-purple-800"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input de busca */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={selectedTags.length >= maxTags}
                />
                
                {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    </div>
                )}
            </div>

            {/* Sugestões */}
            {showSuggestions && (suggestions.length > 0 || inputValue.trim()) && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                    {suggestions.map(tag => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="w-full px-4 py-2 text-left hover:bg-purple-50 focus:bg-purple-50 focus:outline-none"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{tag.name}</span>
                                <span className="text-sm text-gray-500">
                                    {tag.usage_count} usos
                                </span>
                            </div>
                            {tag.type && (
                                <div className="text-xs text-gray-400">
                                    {tag.type}
                                </div>
                            )}
                        </button>
                    ))}
                    
                    {inputValue.trim() && !suggestions.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) && (
                        <button
                            type="button"
                            onClick={() => createTag(inputValue.trim())}
                            className="w-full px-4 py-2 text-left hover:bg-purple-50 focus:bg-purple-50 focus:outline-none border-t border-gray-200"
                        >
                            <div className="flex items-center">
                                <span className="text-purple-600 mr-2">+</span>
                                <span>Criar tag "{inputValue.trim()}"</span>
                            </div>
                        </button>
                    )}
                </div>
            )}

            {/* Contador de tags */}
            <div className="text-xs text-gray-500 mt-1">
                {selectedTags.length}/{maxTags} tags selecionadas
            </div>
        </div>
    );
};

export default TagSelector;
