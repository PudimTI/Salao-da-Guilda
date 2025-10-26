import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { apiGet, apiDelete } from '../utils/api';

const CharacterDetailPage = ({ characterId }) => {
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (characterId) {
            loadCharacter();
        }
    }, [characterId]);

    const loadCharacter = async () => {
        try {
            setLoading(true);
            const response = await apiGet(`/api/characters/${characterId}`);
            setCharacter(response.data);
        } catch (error) {
            console.error('Erro ao carregar personagem:', error);
            setError('Erro ao carregar personagem');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCharacter = async () => {
        if (!confirm('Tem certeza que deseja excluir este personagem?')) {
            return;
        }

        try {
            await apiDelete(`/api/characters/${characterId}`);
            window.location.href = '/characters';
        } catch (error) {
            console.error('Erro ao excluir personagem:', error);
        }
    };

    const handleLeaveCampaign = async (campaignId) => {
        if (!confirm('Tem certeza que deseja sair desta campanha?')) {
            return;
        }

        try {
            await apiDelete(`/api/characters/${characterId}/campaigns/${campaignId}`);
            loadCharacter(); // Recarregar dados
        } catch (error) {
            console.error('Erro ao sair da campanha:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando personagem...</p>
                </div>
            </div>
        );
    }

    if (error || !character) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar personagem</h3>
                    <p className="text-gray-500 mb-6">{error || 'Personagem não encontrado'}</p>
                    <a 
                        href="/characters"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                        Voltar para Personagens
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <main className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <a 
                                    href="/characters" 
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                    </svg>
                                </a>
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
                                        {character.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">{character.name}</h1>
                                        <p className="text-lg text-gray-600">{character.system}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <a 
                                    href={`/characters/${character.id}/edit`}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                                >
                                    Editar
                                </a>
                                <button 
                                    onClick={handleDeleteCharacter}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Character Info Card */}
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Personagem</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nível</label>
                                        <p className="mt-1 text-lg font-semibold text-gray-900">{character.level}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <div className="mt-1">
                                            {character.available ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                    Disponível para campanhas
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    Participando de {character.campaigns_count || 0} campanha(s)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {character.summary && (
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700">Resumo</label>
                                        <p className="mt-1 text-gray-900 whitespace-pre-line">{character.summary}</p>
                                    </div>
                                )}

                                {character.backstory && (
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700">História de Fundo</label>
                                        <div className="mt-1 text-gray-900 whitespace-pre-line bg-gray-50 p-4 rounded-md">
                                            {character.backstory}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Campaigns Section */}
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">Campanhas</h2>
                                    {character.available && (
                                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                            Entrar em Campanha
                                        </button>
                                    )}
                                </div>

                                {character.campaigns && character.campaigns.length > 0 ? (
                                    <div className="space-y-4">
                                        {character.campaigns.map(campaign => (
                                            <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
                                                        <p className="text-sm text-gray-600">{campaign.system} • {campaign.type}</p>
                                                        {campaign.role_note && (
                                                            <p className="text-sm text-gray-700 mt-2">
                                                                <span className="font-medium">Papel:</span> {campaign.role_note}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Entrou em: {new Date(campaign.joined_at).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {campaign.status === 'active' ? 'Ativo' :
                                                             campaign.status === 'paused' ? 'Pausado' :
                                                             'Inativo'}
                                                        </span>
                                                        <button 
                                                            onClick={() => handleLeaveCampaign(campaign.id)}
                                                            className="text-red-600 hover:text-red-800 text-sm"
                                                        >
                                                            Sair
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha</h3>
                                        <p className="text-gray-500">Este personagem ainda não participa de nenhuma campanha.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Character Stats */}
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Criado em:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {new Date(character.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Última atualização:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {new Date(character.updated_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Campanhas ativas:</span>
                                        <span className="text-sm font-medium text-gray-900">{character.campaigns_count || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Owner Info */}
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proprietário</h3>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{character.user?.display_name || character.user?.name}</p>
                                        <p className="text-sm text-gray-500">@{character.user?.handle}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CharacterDetailPage;
