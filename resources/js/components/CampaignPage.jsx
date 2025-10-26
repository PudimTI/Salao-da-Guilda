import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CampaignChat from './CampaignChat';
import CampaignSidebar from './CampaignSidebar';
import CampaignControls from './CampaignControls';
import { apiGet, apiPost } from '../utils/api';

const CampaignPage = ({ campaignId }) => {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [conversationId, setConversationId] = useState(null);

    useEffect(() => {
        if (campaignId) {
            loadCampaign();
        }
    }, [campaignId]);

    const loadCampaign = async () => {
        try {
            setLoading(true);
            const response = await apiGet(`/api/campaigns/${campaignId}`);
            setCampaign(response.data);
            
            // Carregar conversa da campanha
            loadCampaignConversation();
        } catch (error) {
            console.error('Erro ao carregar campanha:', error);
            setError('Erro ao carregar campanha');
        } finally {
            setLoading(false);
        }
    };

    const loadCampaignConversation = async () => {
        try {
            // Buscar conversas da campanha
            const response = await apiGet(`/api/campaigns/${campaignId}/conversations`);
            const conversations = response.data;
            
            if (conversations && conversations.length > 0) {
                // Usar a primeira conversa encontrada (principal)
                setConversationId(conversations[0].id);
            } else {
                // Se não há conversas, criar uma nova
                await createCampaignConversation();
            }
        } catch (error) {
            console.error('Erro ao carregar conversa da campanha:', error);
            // Em caso de erro, tentar criar uma nova conversa
            await createCampaignConversation();
        }
    };

    const createCampaignConversation = async () => {
        try {
            // Buscar membros da campanha
            const membersResponse = await apiGet(`/api/campaigns/${campaignId}/members`);
            const members = membersResponse.data;
            
            if (members && members.length > 0) {
                // Criar conversa da campanha
                const conversationResponse = await apiPost('/api/chat/conversations', {
                    participants: members.map(member => member.user_id),
                    title: `Chat da Campanha: ${campaign.name}`,
                    type: 'campaign',
                    campaign_id: campaignId
                });
                
                setConversationId(conversationResponse.data.id);
            }
        } catch (error) {
            console.error('Erro ao criar conversa da campanha:', error);
            // Em caso de erro, usar uma conversa padrão
            setConversationId(1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando campanha...</p>
                </div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar campanha</h3>
                    <p className="text-gray-500 mb-6">{error || 'Campanha não encontrada'}</p>
                    <a 
                        href="/campaigns"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                        Voltar para Campanhas
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <a 
                            href="/campaigns" 
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </a>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
                            <p className="text-sm text-gray-600">
                                {campaign.system} • {campaign.type === 'digital' ? 'Digital' : 'Presencial'}
                                {campaign.city && ` • ${campaign.city}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            campaign.status === 'open' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            campaign.status === 'closed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {campaign.status === 'open' ? 'Aberto' :
                             campaign.status === 'active' ? 'Ativo' :
                             campaign.status === 'closed' ? 'Fechado' :
                             'Pausado'}
                        </span>
                        {campaign.is_owner && (
                            <a 
                                href={`/campaigns/${campaign.id}/edit`}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Editar
                            </a>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Layout Principal */}
            <div className="flex-1 flex">
                {/* Sidebar Esquerda */}
                <CampaignSidebar campaignId={campaignId} campaign={campaign} />
                
                {/* Área Principal - Chat */}
                <div className="flex-1 flex">
                    <CampaignChat 
                        conversationId={conversationId} 
                        campaignId={campaignId}
                        campaign={campaign}
                    />
                </div>
                
                {/* Sidebar Direita */}
                <CampaignControls campaignId={campaignId} campaign={campaign} />
            </div>
        </div>
    );
};

export default CampaignPage;