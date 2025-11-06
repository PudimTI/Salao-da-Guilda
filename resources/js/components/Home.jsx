import React, { useState, useEffect } from 'react';
import Header from './Header';
import Hero from './Hero';
import CampaignCard from './CampaignCard';
import NewAdventures from './NewAdventures';
import Footer from './Footer';
import CollapsedChatButton from './CollapsedChatButton';

const Home = () => {
    const [userCampaigns, setUserCampaigns] = useState([]);
    const [recommendedCampaign, setRecommendedCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Aguardar um pouco para garantir que o localStorage foi carregado
        const checkAndLoad = async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const token = localStorage.getItem('auth_token');
            console.log('👤 [Home] Verificando autenticação...');
            console.log('🎫 [Home] Token encontrado:', token ? 'SIM' : 'NÃO');
            
            if (!token) {
                console.warn('⚠️ [Home] Sem token. Redirecionando para /login');
                try {
                    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
                    const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : null;
                    const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
                    if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
                    await fetch('/logout', { method: 'POST', headers, credentials: 'include' }).catch(() => {});
                } catch (_) {}
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }

            console.log('✅ [Home] Token válido. Carregando dados...');
            loadUserCampaigns();
            loadRecommendedCampaign();
        };
        
        checkAndLoad();
    }, []);

    const loadUserCampaigns = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.warn('⚠️ [Home] Sem token. Redirecionando para /login');
                window.location.href = '/login';
                return;
            }
            
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : null;
            
            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            };
            
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }
            
            console.log('📤 [Home] Carregando campanhas do usuário...');
            const response = await fetch('/api/campaigns', {
                headers
            });
            
            console.log('📥 [Home] Resposta de campanhas:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ [Home] Campanhas carregadas:', data);
                // Pegar as 3 últimas campanhas do usuário
                if (data.data && Array.isArray(data.data)) {
                    setUserCampaigns(data.data.slice(0, 3));
                }
            } else if (response.status === 401) {
                console.warn('⚠️ [Home] 401 ao carregar campanhas. Efetuando logout e redirecionando');
                try {
                    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
                    const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : null;
                    const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
                    if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
                    await fetch('/logout', { method: 'POST', headers, credentials: 'include' });
                } catch (_) {}
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else {
                console.error('❌ [Home] Erro ao carregar campanhas:', response.status);
            }
        } catch (error) {
            console.error('❌ [Home] Erro ao carregar campanhas do usuário:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRecommendedCampaign = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.warn('⚠️ [Home] Sem token. Redirecionando para /login');
                window.location.href = '/login';
                return;
            }
            
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : null;
            
            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            };
            
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }
            
            console.log('📤 [Home] Carregando recomendações...');
            const response = await fetch('/api/recommendations?type=campaign&limit=1', {
                headers
            });
            
            console.log('📥 [Home] Resposta de recomendações:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ [Home] Recomendações carregadas:', data);
                if (data.data && data.data.data && data.data.data.length > 0) {
                    setRecommendedCampaign(data.data.data[0].target);
                }
            } else if (response.status === 401) {
                console.warn('⚠️ [Home] 401 ao carregar recomendações. Efetuando logout e redirecionando');
                try {
                    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
                    const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : null;
                    const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
                    if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
                    await fetch('/logout', { method: 'POST', headers, credentials: 'include' });
                } catch (_) {}
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else {
                console.error('❌ [Home] Erro ao carregar recomendações:', response.status);
            }
        } catch (error) {
            console.error('❌ [Home] Erro ao carregar campanha recomendada:', error);
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
            
            {/* Botão de chat recolhido */}
            <CollapsedChatButton />
        </div>
    );
};

export default Home;









