import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CharacterCard from './CharacterCard';
import CharacterForm from './CharacterForm';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

const CharactersPage = () => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCharacterForm, setShowCharacterForm] = useState(false);
    const [editingCharacter, setEditingCharacter] = useState(null);

    useEffect(() => {
        loadCharacters();
    }, []);

    const loadCharacters = async () => {
        try {
            setLoading(true);
            const response = await apiGet('/api/characters');
            setCharacters(response.data || []);
        } catch (error) {
            console.error('Erro ao carregar personagens:', error);
            setError('Erro ao carregar personagens');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCharacter = async (formData) => {
        try {
            const response = await apiPost('/api/characters', formData);
            setCharacters(prev => [response.data, ...prev]);
            setShowCharacterForm(false);
        } catch (error) {
            console.error('Erro ao criar personagem:', error);
            throw error;
        }
    };

    const handleEditCharacter = async (characterId, formData) => {
        try {
            const response = await apiPut(`/api/characters/${characterId}`, formData);
            setCharacters(prev => prev.map(char => 
                char.id === characterId ? response.data : char
            ));
            setEditingCharacter(null);
        } catch (error) {
            console.error('Erro ao editar personagem:', error);
            throw error;
        }
    };

    const handleDeleteCharacter = async (characterId) => {
        if (!confirm('Tem certeza que deseja excluir este personagem?')) {
            return;
        }

        try {
            await apiDelete(`/api/characters/${characterId}`);
            setCharacters(prev => prev.filter(char => char.id !== characterId));
        } catch (error) {
            console.error('Erro ao excluir personagem:', error);
        }
    };

    const handleJoinCampaign = async (characterId) => {
        // Implementar lógica para entrar em campanha
        console.log('Entrar em campanha para personagem:', characterId);
    };

    const openCreateForm = () => {
        setEditingCharacter(null);
        setShowCharacterForm(true);
    };

    const openEditForm = (character) => {
        setEditingCharacter(character);
        setShowCharacterForm(true);
    };

    const closeForm = () => {
        setShowCharacterForm(false);
        setEditingCharacter(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando personagens...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            
            <main className="flex-1 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Meus Personagens</h1>
                                <p className="mt-2 text-gray-600">Gerencie seus personagens de RPG</p>
                            </div>
                            <button 
                                onClick={openCreateForm}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                            >
                                Criar Personagem
                            </button>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Characters Grid */}
                    {characters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {characters.map(character => (
                                <CharacterCard
                                    key={character.id}
                                    character={character}
                                    onEdit={handleEditCharacter}
                                    onDelete={handleDeleteCharacter}
                                    onJoinCampaign={handleJoinCampaign}
                                />
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum personagem encontrado</h3>
                            <p className="text-gray-500 mb-6">Comece criando seu primeiro personagem de RPG!</p>
                            <button 
                                onClick={openCreateForm}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                            >
                                Criar Primeiro Personagem
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* Character Form Modal */}
            {showCharacterForm && (
                <CharacterForm
                    character={editingCharacter}
                    onSave={editingCharacter ? handleEditCharacter : handleCreateCharacter}
                    onCancel={closeForm}
                />
            )}
        </div>
    );
};

export default CharactersPage;
