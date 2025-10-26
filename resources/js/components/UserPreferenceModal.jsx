import React, { useState, useEffect } from 'react';

const UserPreferenceModal = ({ isOpen, onClose, preferences, onSave }) => {
    const [formData, setFormData] = useState({
        systems: [],
        styles: [],
        dynamics: []
    });
    const [newItem, setNewItem] = useState({
        systems: '',
        styles: '',
        dynamics: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Opções pré-definidas para cada categoria
    const systemOptions = [
        'D&D 5e', 'D&D 3.5', 'Pathfinder 1e', 'Pathfinder 2e', 'Call of Cthulhu',
        'Vampire: The Masquerade', 'World of Darkness', 'GURPS', 'Savage Worlds',
        'FATE', 'Dungeon World', 'Blades in the Dark', 'Cyberpunk 2020',
        'Shadowrun', 'Warhammer 40k', 'Star Wars RPG', 'Outros'
    ];

    const styleOptions = [
        'Narrativo', 'Tático', 'Sandbox', 'Linear', 'Roleplay', 'Combat',
        'Exploração', 'Mistério', 'Horror', 'Aventura', 'Drama', 'Comédia',
        'Realista', 'Fantástico', 'Sci-Fi', 'Steampunk', 'Cyberpunk'
    ];

    const dynamicOptions = [
        'Cooperação', 'Competição', 'PvP', 'PvE', 'Exploração', 'Social',
        'Estratégico', 'Ação', 'Puzzle', 'Investigação', 'Político',
        'Econômico', 'Religioso', 'Militar', 'Diplomático', 'Criativo'
    ];

    useEffect(() => {
        if (isOpen && preferences) {
            setFormData({
                systems: preferences.systems || [],
                styles: preferences.styles || [],
                dynamics: preferences.dynamics || []
            });
        }
    }, [isOpen, preferences]);

    const handleAddItem = (category) => {
        const value = newItem[category].trim();
        if (value && !formData[category].includes(value)) {
            setFormData(prev => ({
                ...prev,
                [category]: [...prev[category], value]
            }));
            setNewItem(prev => ({ ...prev, [category]: '' }));
        }
    };

    const handleRemoveItem = (category, index) => {
        setFormData(prev => ({
            ...prev,
            [category]: prev[category].filter((_, i) => i !== index)
        }));
    };

    const handleAddFromOptions = (category, value) => {
        if (!formData[category].includes(value)) {
            setFormData(prev => ({
                ...prev,
                [category]: [...prev[category], value]
            }));
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);
            
            await onSave(formData);
            onClose();
        } catch (err) {
            setError(err.message || 'Erro ao salvar preferências');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e, category) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem(category);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-purple-800">
                            Editar Preferências de Jogo
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
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

                    <div className="space-y-8">
                        {/* Sistemas */}
                        <div>
                            <h3 className="text-lg font-semibold text-purple-700 mb-3">
                                Sistemas de RPG
                            </h3>
                            <div className="space-y-3">
                                {/* Lista de sistemas selecionados */}
                                <div className="flex flex-wrap gap-2">
                                    {formData.systems.map((system, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                                        >
                                            {system}
                                            <button
                                                onClick={() => handleRemoveItem('systems', index)}
                                                className="ml-2 text-purple-600 hover:text-purple-800"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                {/* Adicionar novo sistema */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newItem.systems}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, systems: e.target.value }))}
                                        onKeyPress={(e) => handleKeyPress(e, 'systems')}
                                        placeholder="Digite um sistema personalizado"
                                        className="flex-1 px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={() => handleAddItem('systems')}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                    >
                                        Adicionar
                                    </button>
                                </div>

                                {/* Opções pré-definidas */}
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Ou escolha das opções:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {systemOptions.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleAddFromOptions('systems', option)}
                                                disabled={formData.systems.includes(option)}
                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                    formData.systems.includes(option)
                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estilos */}
                        <div>
                            <h3 className="text-lg font-semibold text-purple-700 mb-3">
                                Estilos de Jogo
                            </h3>
                            <div className="space-y-3">
                                {/* Lista de estilos selecionados */}
                                <div className="flex flex-wrap gap-2">
                                    {formData.styles.map((style, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                        >
                                            {style}
                                            <button
                                                onClick={() => handleRemoveItem('styles', index)}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                {/* Adicionar novo estilo */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newItem.styles}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, styles: e.target.value }))}
                                        onKeyPress={(e) => handleKeyPress(e, 'styles')}
                                        placeholder="Digite um estilo personalizado"
                                        className="flex-1 px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={() => handleAddItem('styles')}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                    >
                                        Adicionar
                                    </button>
                                </div>

                                {/* Opções pré-definidas */}
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Ou escolha das opções:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {styleOptions.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleAddFromOptions('styles', option)}
                                                disabled={formData.styles.includes(option)}
                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                    formData.styles.includes(option)
                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dinâmicas */}
                        <div>
                            <h3 className="text-lg font-semibold text-purple-700 mb-3">
                                Dinâmicas de Jogo
                            </h3>
                            <div className="space-y-3">
                                {/* Lista de dinâmicas selecionadas */}
                                <div className="flex flex-wrap gap-2">
                                    {formData.dynamics.map((dynamic, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                                        >
                                            {dynamic}
                                            <button
                                                onClick={() => handleRemoveItem('dynamics', index)}
                                                className="ml-2 text-green-600 hover:text-green-800"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                {/* Adicionar nova dinâmica */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newItem.dynamics}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, dynamics: e.target.value }))}
                                        onKeyPress={(e) => handleKeyPress(e, 'dynamics')}
                                        placeholder="Digite uma dinâmica personalizada"
                                        className="flex-1 px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={() => handleAddItem('dynamics')}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                    >
                                        Adicionar
                                    </button>
                                </div>

                                {/* Opções pré-definidas */}
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Ou escolha das opções:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {dynamicOptions.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleAddFromOptions('dynamics', option)}
                                                disabled={formData.dynamics.includes(option)}
                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                    formData.dynamics.includes(option)
                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Salvando...' : 'Salvar Preferências'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPreferenceModal;

