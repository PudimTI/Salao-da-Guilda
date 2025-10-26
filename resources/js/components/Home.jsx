import React, { useState, useEffect } from 'react';
import Header from './Header';
import Hero from './Hero';
import CampaignCard from './CampaignCard';
import NewAdventures from './NewAdventures';
import Footer from './Footer';

const Home = () => {
    const [userCampaigns, setUserCampaigns] = useState([]);
    const [recommendedCampaign, setRecommendedCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserCampaigns();
        loadRecommendedCampaign();
    }, []);

    const loadUserCampaigns = async () => {
        try {
            const response = await fetch('/api/campaigns', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Pegar as 3 últimas campanhas do usuário
                setUserCampaigns(data.data.slice(0, 3));
            }
        } catch (error) {
            console.error('Erro ao carregar campanhas do usuário:', error);
        }
    };

    const loadRecommendedCampaign = async () => {
        try {
            const response = await fetch('/api/recommendations/campaigns?limit=1', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    setRecommendedCampaign(data.data[0]);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar campanha recomendada:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />
            
            <main>
                <Hero />
                
                {/* Campaigns Section */}
                <section className="py-16 px-6">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                            Campanhas em Destaque
                        </h2>
                        
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                <p className="mt-2 text-gray-600">Carregando campanhas...</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-6">
                                    {userCampaigns.map((campaign) => (
                                        <CampaignCard 
                                            key={campaign.id} 
                                            campaign={campaign} 
                                        />
                                    ))}
                                </div>
                                
                                {/* View All Campaigns Button */}
                                <div className="text-center mt-8">
                                    <a 
                                        href="/campaigns"
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors duration-200 inline-block"
                                    >
                                        Ver todas as campanhas
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </section>
                
                <NewAdventures recommendedCampaign={recommendedCampaign} />
            </main>
            
            <Footer />
        </div>
    );
};

export default Home;









