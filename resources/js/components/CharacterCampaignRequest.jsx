import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api';

const CharacterCampaignRequest = ({ campaignId, campaignName, onSuccess }) => {
    const [characters, setCharacters] = useState([]);
    const [selectedCharacter, setSelectedCharacter] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadUserCharacters();
    }, []);

    const loadUserCharacters = async () => {
        try {
            const response = await apiGet('/api/characters');
            setCharacters(response.data || []);
        } catch (error) {
            console.error('Erro ao carregar personagens:', error);
            setError('Erro ao carregar personagens');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await apiPost(`/campaigns/${campaignId}/invites/request-with-character`, {
                character_id: selectedCharacter,
                message: message
            });
            
            onSuccess && onSuccess();
            // TODO: Mostrar notificação de sucesso
        } catch (error) {
            console.error('Erro ao solicitar entrada:', error);
            setError(error.response?.data?.message || 'Erro ao solicitar entrada');
        } finally {
            setLoading(false);
        }
    };

    if (error && !characters.length) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    if (characters.length === 0) {
        return (
            <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum personagem disponível</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Você precisa criar um personagem antes de solicitar entrada em uma campanha.
                </p>
                <div className="mt-6">
                    <a
                        href="/characters/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Criar Personagem
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                    Solicitar entrada em "{campaignName}"
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    Escolha um personagem para solicitar entrada nesta campanha.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Personagem
                    </label>
                    <select
                        value={selectedCharacter}
                        onChange={(e) => setSelectedCharacter(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Selecione um personagem</option>
                        {characters.map((character) => (
                            <option key={character.id} value={character.id}>
                                {character.name} - {character.class} (Nível {character.level})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem (opcional)
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        maxLength={500}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Por que você gostaria de participar desta campanha? Conte um pouco sobre seu personagem..."
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        {message.length}/500 caracteres
                    </div>
                </div>

                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <button
                        type="submit"
                        disabled={loading || !selectedCharacter}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Enviando...' : 'Solicitar Entrada'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CharacterCampaignRequest;
