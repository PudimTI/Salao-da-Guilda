import React from 'react';

const CampaignChatHeader = ({ campaign, conversation, campaignId }) => {
    const participantCount = conversation?.participants?.length || 0;

    const handleBack = () => {
        if (campaignId) {
            // Voltar para a página da campanha
            window.location.href = `/campaigns/${campaignId}`;
        } else {
            // Fallback: voltar para listagem de campanhas
            window.location.href = '/campaigns';
        }
    };

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {/* Botão de voltar */}
                    <button
                        onClick={handleBack}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                        title="Voltar para a campanha"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>

                    {/* Informações da Campanha */}
                    <div className="flex items-center space-x-3">
                        {/* Avatar/Ícone da Campanha */}
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {campaign?.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {campaign?.name || 'Chat da Campanha'}
                            </h2>
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-500">
                                    {participantCount} {participantCount === 1 ? 'participante' : 'participantes'}
                                </p>
                                {campaign?.owner && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <p className="text-sm text-gray-500">
                                            Dono: <span className="font-medium text-gray-700">
                                                {campaign.owner.display_name || campaign.owner.name || 'Desconhecido'}
                                            </span>
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Botão de informações */}
                    <button 
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Informações do chat"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CampaignChatHeader;

