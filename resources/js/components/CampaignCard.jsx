import React, { useState } from 'react';
import CharacterCampaignRequest from './CharacterCampaignRequest';

const CampaignCard = ({ campaign }) => {
    const [showRequestModal, setShowRequestModal] = useState(false);
    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-green-100 text-green-800';
            case 'active':
                return 'bg-blue-100 text-blue-800';
            case 'closed':
                return 'bg-red-100 text-red-800';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'open':
                return 'Aberto';
            case 'active':
                return 'Ativo';
            case 'closed':
                return 'Fechado';
            case 'paused':
                return 'Pausado';
            default:
                return status;
        }
    };

    const getVisibilityColor = (visibility) => {
        return visibility === 'public' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-100 text-gray-800';
    };

    const getVisibilityText = (visibility) => {
        return visibility === 'public' ? 'Pública' : 'Privada';
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
                    <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                            {getStatusText(campaign.status)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getVisibilityColor(campaign.visibility)}`}>
                            {getVisibilityText(campaign.visibility)}
                        </span>
                    </div>
                </div>

                {campaign.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                        {campaign.description.length > 120 
                            ? `${campaign.description.substring(0, 120)}...` 
                            : campaign.description
                        }
                    </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                    {campaign.system && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            {campaign.system}
                        </span>
                    )}
                    {campaign.type && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                            {campaign.type === 'digital' ? 'Digital' : 'Presencial'}
                        </span>
                    )}
                    {campaign.city && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            {campaign.city}
                        </span>
                    )}
                    {campaign.tags && campaign.tags.length > 0 && (
                        <>
                            {campaign.tags.slice(0, 3).map(tag => (
                                <span key={tag.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {tag.name}
                                </span>
                            ))}
                            {campaign.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                                    +{campaign.tags.length - 3}
                                </span>
                            )}
                        </>
                    )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {campaign.members_count || 0} membros
                    </div>
                    <div>
                        Criado por {campaign.owner?.display_name || campaign.owner?.name || 'Usuário'}
                    </div>
                </div>

                <div className="flex space-x-2">
                    {campaign.is_member ? (
                        <a 
                            href={`/campaigns/${campaign.id}/chat`}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded font-medium transition-colors flex items-center justify-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Entrar
                        </a>
                    ) : (
                        <>
                            <a 
                                href={`/campaigns/${campaign.id}`}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2 px-4 rounded font-medium transition-colors"
                            >
                                Ver Detalhes
                            </a>
                            {campaign.status === 'open' && campaign.visibility === 'public' && (
                                <button
                                    onClick={() => setShowRequestModal(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium transition-colors"
                                >
                                    Solicitar Entrada
                                </button>
                            )}
                        </>
                    )}
                    
                    {campaign.can_edit && (
                        <a 
                            href={`/campaigns/${campaign.id}/edit`}
                            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-medium transition-colors"
                        >
                            Editar
                        </a>
                    )}
                </div>
            </div>

            {/* Modal de solicitação de entrada */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Solicitar Entrada
                                </h3>
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                            
                            <CharacterCampaignRequest
                                campaignId={campaign.id}
                                campaignName={campaign.name}
                                onSuccess={() => setShowRequestModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignCard;