import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CampaignCard from './CampaignCard';
import { apiGet } from '../utils/api';

const CampaignsListPage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const campaignsPerPage = 6;

    useEffect(() => {
        loadCampaigns();
    }, [currentPage]);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const response = await apiGet('/api/campaigns');
            setCampaigns(response.data || []);
            setTotalPages(Math.ceil((response.data || []).length / campaignsPerPage));
        } catch (error) {
            console.error('Erro ao carregar campanhas:', error);
            setError('Erro ao carregar campanhas');
        } finally {
            setLoading(false);
        }
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesQuery = searchQuery.trim().length === 0 ||
            campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesQuery;
    });

    // Paginação
    const startIndex = (currentPage - 1) * campaignsPerPage;
    const endIndex = startIndex + campaignsPerPage;
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);
    const totalFilteredPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset para primeira página ao pesquisar
    };

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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            
            <main className="flex-1 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Minhas Campanhas</h1>
                                <p className="mt-2 text-gray-600">Campanhas que você participa como mestre ou jogador</p>
                            </div>
                            <a 
                                href="/campaigns/create"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                Nova Campanha
                            </a>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Search Form */}
                    <div className="mb-8">
                        <form onSubmit={handleSearch} className="max-w-md">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Pesquisar campanhas..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Pesquisar
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Campaigns Grid */}
                    {paginatedCampaigns.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedCampaigns.map(campaign => (
                                    <CampaignCard 
                                        key={campaign.id} 
                                        campaign={campaign} 
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalFilteredPages > 1 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Anterior
                                        </button>
                                        
                                        {Array.from({ length: totalFilteredPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                    currentPage === page
                                                        ? 'text-white bg-indigo-600 border border-transparent'
                                                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        
                                        <button 
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalFilteredPages}
                                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Próximo
                                        </button>
                                    </nav>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {campaigns.length === 0 ? 'Nenhuma campanha encontrada' : 'Nenhuma campanha corresponde à sua pesquisa'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {campaigns.length === 0 
                                    ? 'Você ainda não participa de nenhuma campanha. Crie uma nova ou procure por campanhas abertas.'
                                    : 'Tente ajustar sua pesquisa para encontrar campanhas.'
                                }
                            </p>
                            <div className="mt-6 space-x-4">
                                <a 
                                    href="/campaigns/create"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Nova Campanha
                                </a>
                                <a 
                                    href="/encontrar"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Encontrar Campanhas
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CampaignsListPage;
