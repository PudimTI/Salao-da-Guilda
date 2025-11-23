import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api';

const CampaignSelectModal = ({ isOpen, onClose, character, onSuccess }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCampaignId, setSelectedCampaignId] = useState('');
    const [roleNote, setRoleNote] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadAvailableCampaigns();
        }
    }, [isOpen, character]);

    const loadAvailableCampaigns = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Buscar campanhas do usuário (que ele é dono ou membro)
            const response = await apiGet('/api/campaigns');
            const userCampaigns = response.data || [];
            
            // Filtrar apenas campanhas ativas/abertas e que o personagem ainda não está
            const characterCampaignIds = character?.campaigns?.map(c => c.id) || [];
            const availableCampaigns = userCampaigns.filter(campaign => 
                (campaign.status === 'active' || campaign.status === 'open') && 
                !characterCampaignIds.includes(campaign.id)
            );
            
            setCampaigns(availableCampaigns);
        } catch (err) {
            console.error('Erro ao carregar campanhas:', err);
            setError('Erro ao carregar campanhas disponíveis');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedCampaignId) {
            setError('Por favor, selecione uma campanha');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const response = await apiPost(`/api/characters/${character.id}/join-campaign`, {
                campaign_id: parseInt(selectedCampaignId),
                role_note: roleNote
            });

            if (onSuccess) {
                onSuccess(response);
            }
            
            // Resetar formulário
            setSelectedCampaignId('');
            setRoleNote('');
            onClose();
        } catch (err) {
            console.error('Erro ao associar personagem à campanha:', err);
            setError(err.message || 'Erro ao associar personagem à campanha');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Associar Personagem à Campanha
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {character && (
                        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600">Personagem:</p>
                            <p className="font-semibold text-purple-900">{character.name}</p>
                            <p className="text-sm text-gray-600">Nível {character.level} - {character.system}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Selecionar Campanha *
                            </label>
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                                    Carregando campanhas...
                                </div>
                            ) : campaigns.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 border border-gray-300 rounded">
                                    <p className="mb-2">Nenhuma campanha disponível</p>
                                    <p className="text-sm">Você precisa ser dono ou membro de uma campanha ativa para associar seu personagem.</p>
                                </div>
                            ) : (
                                <select
                                    value={selectedCampaignId}
                                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                >
                                    <option value="">Selecione uma campanha</option>
                                    {campaigns.map(campaign => (
                                        <option key={campaign.id} value={campaign.id}>
                                            {campaign.name} - {campaign.system} ({campaign.status})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {selectedCampaignId && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nota sobre o Papel (Opcional)
                                </label>
                                <textarea
                                    value={roleNote}
                                    onChange={(e) => setRoleNote(e.target.value)}
                                    rows="3"
                                    maxLength="500"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Descreva o papel do personagem nesta campanha..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {roleNote.length}/500 caracteres
                                </p>
                            </div>
                        )}

                        {selectedCampaignId && campaigns.find(c => c.id === parseInt(selectedCampaignId)) && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 mb-1">Informações da Campanha:</p>
                                {(() => {
                                    const selectedCampaign = campaigns.find(c => c.id === parseInt(selectedCampaignId));
                                    return (
                                        <div className="text-sm text-blue-800">
                                            <p><strong>Sistema:</strong> {selectedCampaign.system}</p>
                                            <p><strong>Tipo:</strong> {selectedCampaign.type || 'Não especificado'}</p>
                                            {selectedCampaign.description && (
                                                <p className="mt-1"><strong>Descrição:</strong> {selectedCampaign.description.substring(0, 100)}...</p>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={submitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedCampaignId || submitting || campaigns.length === 0}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Associando...' : 'Associar Personagem'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CampaignSelectModal;

