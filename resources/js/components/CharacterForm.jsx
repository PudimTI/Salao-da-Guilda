import React, { useState } from 'react';

const CharacterForm = ({ onSave, onCancel, character = null }) => {
    const [formData, setFormData] = useState({
        name: character?.name || '',
        system: character?.system || '',
        level: character?.level || '',
        summary: character?.summary || '',
        backstory: character?.backstory || ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpar erro do campo quando usuário começar a digitar
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Nome do personagem é obrigatório';
        }
        
        if (!formData.system.trim()) {
            newErrors.system = 'Sistema é obrigatório';
        }
        
        if (formData.level && (isNaN(formData.level) || formData.level < 1)) {
            newErrors.level = 'Nível deve ser um número maior que 0';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            await onSave(formData);
        } catch (error) {
            console.error('Erro ao salvar personagem:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {character ? 'Editar Personagem' : 'Criar Novo Personagem'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome do Personagem *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ex: Aragorn"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sistema *
                            </label>
                            <select
                                name="system"
                                value={formData.system}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    errors.system ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Selecione um sistema</option>
                                <option value="D&D 5e">D&D 5e</option>
                                <option value="Pathfinder">Pathfinder</option>
                                <option value="Call of Cthulhu">Call of Cthulhu</option>
                                <option value="Vampire: The Masquerade">Vampire: The Masquerade</option>
                                <option value="Tormenta20">Tormenta20</option>
                                <option value="Ordem Paranormal">Ordem Paranormal</option>
                                <option value="Starfinder">Starfinder</option>
                                <option value="Outro">Outro</option>
                            </select>
                            {errors.system && (
                                <p className="text-red-500 text-sm mt-1">{errors.system}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nível
                            </label>
                            <input
                                type="number"
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                min="1"
                                max="20"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    errors.level ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ex: 5"
                            />
                            {errors.level && (
                                <p className="text-red-500 text-sm mt-1">{errors.level}</p>
                            )}
                        </div>

                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Resumo
                        </label>
                        <textarea
                            name="summary"
                            value={formData.summary}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Resumo breve do personagem (máx. 1000 caracteres)..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            História de Fundo
                        </label>
                        <textarea
                            name="backstory"
                            value={formData.backstory}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="História detalhada do personagem (máx. 5000 caracteres)..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            {character ? 'Atualizar' : 'Criar'} Personagem
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CharacterForm;
