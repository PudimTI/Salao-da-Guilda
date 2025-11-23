import React, { useState } from 'react';

const CharacterCard = ({ character, onEdit, onJoinCampaign, onLeaveCampaign }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: character.name || '',
        system: character.system || '',
        level: character.level || '',
        summary: character.summary || '',
        backstory: character.backstory || ''
    });

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({
            name: character.name || '',
            system: character.system || '',
            level: character.level || '',
            summary: character.summary || '',
            backstory: character.backstory || ''
        });
    };

    const handleSave = async () => {
        try {
            if (onEdit) {
                await onEdit(character.id, editData);
            }
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao salvar personagem:', error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            name: character.name || '',
            system: character.system || '',
            level: character.level || '',
            summary: character.summary || '',
            backstory: character.backstory || ''
        });
    };

    const getCampaignStatus = () => {
        const activeCampaigns = character.campaigns?.filter(c => 
            c.status === 'active' || c.status === 'open'
        ) || [];
        if (activeCampaigns.length > 0) {
            return {
                text: `${activeCampaigns.length} campanha(s) ativa(s)`,
                color: "text-green-600",
                icon: "✓",
                count: activeCampaigns.length
            };
        } else {
            return {
                text: "Não está em campanha",
                color: "text-gray-500",
                icon: "○",
                count: 0
            };
        }
    };

    const campaignStatus = getCampaignStatus();
    const activeCampaigns = character.campaigns?.filter(c => c.status === 'active') || [];

    return (
        <div className="border border-purple-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
            {isEditing ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-1">
                                Nome do Personagem
                            </label>
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-1">
                                Sistema
                            </label>
                            <input
                                type="text"
                                value={editData.system}
                                onChange={(e) => setEditData(prev => ({ ...prev, system: e.target.value }))}
                                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-1">
                                Nível
                            </label>
                            <input
                                type="number"
                                value={editData.level}
                                onChange={(e) => setEditData(prev => ({ ...prev, level: e.target.value }))}
                                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-700 mb-1">
                            Resumo
                        </label>
                        <textarea
                            value={editData.summary}
                            onChange={(e) => setEditData(prev => ({ ...prev, summary: e.target.value }))}
                            rows="3"
                            className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Resumo breve do personagem..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-700 mb-1">
                            História de Fundo
                        </label>
                        <textarea
                            value={editData.backstory}
                            onChange={(e) => setEditData(prev => ({ ...prev, backstory: e.target.value }))}
                            rows="3"
                            className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="História detalhada do personagem..."
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={handleSave}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm"
                        >
                            Salvar
                        </button>
                        <button
                            onClick={handleCancel}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
                            <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Criado no sistema: {character.system}</div>
                            <div className="text-lg font-semibold text-gray-800">{character.name}</div>
                            {character.level && (
                                <div className="text-sm text-gray-600">Nível {character.level}</div>
                            )}
                            {character.summary && (
                                <div className="text-sm text-gray-600 mt-1">{character.summary}</div>
                            )}
                            
                            {/* Status de Campanhas */}
                            <div className="mt-2">
                                <div className={`text-sm ${campaignStatus.color} flex items-center mb-2`}>
                                    <span className="mr-1">{campaignStatus.icon}</span>
                                    {campaignStatus.text}
                                </div>
                                
                                {/* Lista de Campanhas Ativas */}
                                {activeCampaigns.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {activeCampaigns.map(campaign => (
                                            <div 
                                                key={campaign.id} 
                                                className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-2 py-1.5"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-green-900 truncate">
                                                        {campaign.name}
                                                    </p>
                                                    {campaign.role_note && (
                                                        <p className="text-xs text-green-700 truncate">
                                                            {campaign.role_note}
                                                        </p>
                                                    )}
                                                </div>
                                                {onLeaveCampaign && (
                                                    <button
                                                        onClick={() => onLeaveCampaign(character.id, campaign.id)}
                                                        className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                                                        title="Remover da campanha"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {character.available && activeCampaigns.length === 0 && (
                                <div className="text-green-600 mt-1 text-sm">Personagem disponível!</div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                            <button 
                                onClick={handleEdit}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-md text-sm"
                            >
                                Editar
                            </button>
                            {onJoinCampaign && (
                                <button 
                                    onClick={() => onJoinCampaign(character.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm"
                                >
                                    {activeCampaigns.length > 0 ? 'Adicionar Campanha' : 'Entrar em Campanha'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CharacterCard;




