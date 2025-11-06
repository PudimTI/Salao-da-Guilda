import React, { useMemo, useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CampaignFilters from './CampaignFilters';
import CampaignListItem from './CampaignListItem';
import { apiGet } from '../utils/api';

const CampaignsPage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        system: 'Todos',
        theme: 'Todos',
        tags: [],
        sensitive: false,
        query: ''
    });

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const response = await apiGet('/api/campaigns');
            setCampaigns(response.data || []);
        } catch (error) {
            console.error('Erro ao carregar campanhas:', error);
            setError('Erro ao carregar campanhas');
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return campaigns.filter((c) => {
            const matchesSystem = filters.system === 'Todos' || c.system === filters.system;
            const matchesQuery = filters.query.trim().length === 0 ||
                c.name.toLowerCase().includes(filters.query.toLowerCase()) ||
                c.description.toLowerCase().includes(filters.query.toLowerCase());
            return matchesSystem && matchesQuery;
        });
    }, [campaigns, filters]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Header />
                <main className="flex-1 px-6 py-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Carregando campanhas...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-1 px-6 py-10">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">Encontrar Campanhas</h1>

                    {/* Error State */}
                    {error && (
                        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <CampaignFilters filters={filters} onChange={setFilters} />
                    </div>

                    <div className="mt-8 space-y-6">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Nenhuma campanha encontrada com os filtros aplicados.</p>
                            </div>
                        ) : (
                            filtered.map((c) => (
                                <CampaignListItem key={c.id} campaign={c} />
                            ))
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CampaignsPage;




