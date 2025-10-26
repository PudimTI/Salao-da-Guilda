import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CampaignCard from './CampaignCard';
import CampaignFilters from './CampaignFilters';
import { apiGet } from '../utils/api';

const FindCampaignsPage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        system: 'Todos',
        theme: 'Todos',
        tags: [],
        sensitive: false,
        query: '',
        location: '',
        type: 'Todos'
    });

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const response = await apiGet('/api/campaigns/public');
            setCampaigns(response.data || []);
        } catch (error) {
            console.error('Erro ao carregar campanhas:', error);
            setError('Erro ao carregar campanhas');
        } finally {
            setLoading(false);
        }
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSystem = filters.system === 'Todos' || campaign.system === filters.system;
        const matchesTheme = filters.theme === 'Todos' || campaign.theme === filters.theme;
        const matchesType = filters.type === 'Todos' || campaign.type === filters.type;
        const matchesQuery = filters.query.trim().length === 0 ||
            campaign.name.toLowerCase().includes(filters.query.toLowerCase()) ||
            campaign.description.toLowerCase().includes(filters.query.toLowerCase());
        const matchesLocation = filters.location.trim().length === 0 ||
            (campaign.city && campaign.city.toLowerCase().includes(filters.location.toLowerCase()));
        
        return matchesSystem && matchesTheme && matchesType && matchesQuery && matchesLocation;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando campanhas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <main className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">Encontrar Campanhas</h1>
                            <p className="text-xl text-gray-600">Descubra campanhas de RPG que combinam com você</p>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Enhanced Filters */}
                    <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Filtros de Busca</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sistema</label>
                                <select 
                                    value={filters.system} 
                                    onChange={(e) => setFilters(prev => ({ ...prev, system: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                >
                                    <option value="Todos">Todos os Sistemas</option>
                                    <option value="D&D 5e">D&D 5ª Edição</option>
                                    <option value="Pathfinder">Pathfinder</option>
                                    <option value="Call of Cthulhu">Call of Cthulhu</option>
                                    <option value="Vampire: The Masquerade">Vampire: The Masquerade</option>
                                    <option value="Tormenta20">Tormenta20</option>
                                    <option value="Ordem Paranormal">Ordem Paranormal</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select 
                                    value={filters.type} 
                                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                >
                                    <option value="Todos">Todos os Tipos</option>
                                    <option value="digital">Digital</option>
                                    <option value="presencial">Presencial</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                                <input 
                                    type="text" 
                                    value={filters.location}
                                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="Cidade, estado..."
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                                <input 
                                    type="text" 
                                    value={filters.query}
                                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                                    placeholder="Nome da campanha..."
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={filters.sensitive}
                                        onChange={(e) => setFilters(prev => ({ ...prev, sensitive: e.target.checked }))}
                                        className="rounded border-gray-300 text-indigo-600"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Incluir conteúdo sensível</span>
                                </label>
                            </div>
                            
                            <button 
                                onClick={() => setFilters({
                                    system: 'Todos',
                                    theme: 'Todos',
                                    tags: [],
                                    sensitive: false,
                                    query: '',
                                    location: '',
                                    type: 'Todos'
                                })}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                            >
                                Limpar Filtros
                            </button>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-6">
                        <p className="text-gray-600">
                            {filteredCampaigns.length} campanha(s) encontrada(s)
                            {filters.query && ` para "${filters.query}"`}
                        </p>
                    </div>

                    {/* Campaigns Grid */}
                    {filteredCampaigns.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCampaigns.map(campaign => (
                                <CampaignCard 
                                    key={campaign.id} 
                                    campaign={campaign} 
                                />
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma campanha encontrada</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Tente ajustar os filtros para encontrar campanhas.
                            </p>
                            <div className="mt-6">
                                <button 
                                    onClick={() => setFilters({
                                        system: 'Todos',
                                        theme: 'Todos',
                                        tags: [],
                                        sensitive: false,
                                        query: '',
                                        location: '',
                                        type: 'Todos'
                                    })}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Limpar Filtros
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredCampaigns.length > 0 && (
                        <div className="mt-8 flex justify-center">
                            <nav className="flex items-center space-x-2">
                                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                    Anterior
                                </button>
                                <button className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md">
                                    1
                                </button>
                                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                    2
                                </button>
                                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                    Próximo
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FindCampaignsPage;
