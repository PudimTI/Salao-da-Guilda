import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CampaignInviteManager from './CampaignInviteManager';

const CampaignSidebar = ({ campaignId }) => {
    const [activeTab, setActiveTab] = useState('chat');
    const [activeChannel, setActiveChannel] = useState(1);
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'chat', icon: '💬', label: 'Chat' },
        { id: 'players', icon: '👥', label: 'Jogadores' },
        { id: 'invites', icon: '📨', label: 'Convites' },
        { id: 'resources', icon: '📚', label: 'Recursos' },
        { id: 'more', icon: '⋯', label: 'Mais' }
    ];

    // Carregar dados da campanha
    useEffect(() => {
        if (campaignId) {
            loadCampaign();
        }
    }, [campaignId]);

    const loadCampaign = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/campaigns/${campaignId}`);
            setCampaign(response.data.data);
        } catch (error) {
            console.error('Erro ao carregar campanha:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-64 bg-pink-50 h-full flex flex-col">
            {/* Título da Campanha */}
            <div className="p-4 border-b border-pink-200">
                <div className="flex items-center">
                    <span className="text-yellow-500 mr-2">⭐</span>
                    <h1 className="text-lg font-bold text-gray-800">
                        {loading ? 'Carregando...' : (campaign?.name || 'Campanha')}
                    </h1>
                </div>
            </div>

            {/* Abas de Navegação */}
            <div className="p-4 border-b border-pink-200">
                <div className="flex space-x-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                                activeTab === tab.id 
                                    ? 'bg-pink-200 text-pink-800' 
                                    : 'text-gray-600 hover:bg-pink-100'
                            }`}
                            title={tab.label}
                        >
                            <span className="text-lg">{tab.icon}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Conteúdo das Abas */}
            <div className="flex-1 p-4">
                {activeTab === 'chat' && (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-700">Canais</h2>
                            <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {/* Canal Principal */}
                            <button
                                onClick={() => setActiveChannel(1)}
                                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                                    activeChannel === 1
                                        ? 'bg-pink-200 text-pink-800 border border-pink-300'
                                        : 'text-gray-600 hover:bg-pink-100'
                                }`}
                            >
                                <div className="flex items-center">
                                    <span className="text-yellow-500 mr-2">⭐</span>
                                    <span className="font-medium">Chat Geral</span>
                                </div>
                            </button>
                            
                            {/* Canal de Dados */}
                            <button
                                onClick={() => setActiveChannel(2)}
                                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                                    activeChannel === 2
                                        ? 'bg-pink-200 text-pink-800 border border-pink-300'
                                        : 'text-gray-600 hover:bg-pink-100'
                                }`}
                            >
                                <div className="flex items-center">
                                    <span className="text-blue-500 mr-2">🎲</span>
                                    <span className="font-medium">Rolagem de Dados</span>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {activeTab === 'players' && (
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Jogadores</h2>
                        <div className="space-y-2">
                            {campaign?.members?.map((member) => (
                                <div key={member.id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-xs font-medium text-gray-600">
                                            {member.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'invites' && (
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Convites</h2>
                        <CampaignInviteManager campaignId={campaignId} />
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Recursos</h2>
                        <p className="text-sm text-gray-500">Recursos da campanha em breve...</p>
                    </div>
                )}

                {activeTab === 'more' && (
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Mais</h2>
                        <p className="text-sm text-gray-500">Opções adicionais em breve...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampaignSidebar;
