import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CampaignFilesList from './CampaignFilesList';
import CampaignFileUpload from './CampaignFileUpload';

const CampaignChatSidebar = ({ campaignId, conversation, campaign }) => {
    const [activeTab, setActiveTab] = useState('members'); // 'members' ou 'files'
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshFiles, setRefreshFiles] = useState(false);
    const [ownerId, setOwnerId] = useState(null);

    useEffect(() => {
        if (activeTab === 'members') {
            loadParticipants();
        }
    }, [campaignId, activeTab]);

    useEffect(() => {
        if (campaign?.owner_id) {
            setOwnerId(campaign.owner_id);
        } else if (campaign?.owner?.id) {
            setOwnerId(campaign.owner.id);
        }
    }, [campaign]);

    const loadParticipants = async () => {
        if (!campaignId) return;
        
        try {
            setLoading(true);
            const response = await axios.get(`/api/campaigns/${campaignId}/members`);
            
            if (response.data.success && response.data.data) {
                setParticipants(response.data.data);
                if (response.data.owner_id) {
                    setOwnerId(response.data.owner_id);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar participantes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUploaded = () => {
        setRefreshFiles(prev => !prev);
    };

    // Formatar status online (se disponível)
    const getStatusColor = (user) => {
        // Por enquanto, sempre mostrar offline
        // Pode ser implementado posteriormente com sistema de presença
        return 'bg-gray-400';
    };

    return (
        <div className="w-80 flex flex-col h-full bg-white border-r border-gray-200">
            {/* Navegação por Abas */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('members')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'members'
                            ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>Membros</span>
                        {activeTab === 'members' && participants.length > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                                {participants.length}
                            </span>
                        )}
                    </div>
                </button>
                
                <button
                    onClick={() => setActiveTab('files')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'files'
                            ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Arquivos</span>
                    </div>
                </button>
            </div>

            {/* Conteúdo da Aba */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {activeTab === 'members' ? (
                    <>
                        {/* Header da Aba Membros */}
                        <div className="p-4 border-b border-gray-200">
                            <p className="text-sm text-gray-500">
                                {participants.length} {participants.length === 1 ? 'membro' : 'membros'}
                            </p>
                        </div>

                        {/* Lista de Participantes */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : participants.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <p>Nenhum participante encontrado</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {participants
                                        .filter(member => member && (member.id || member.user_id))
                                        .map((member) => {
                                            // Priorizar display_name sobre name
                                            const memberName = (member.display_name || member.name || 'Usuário').trim();
                                            if (!memberName) return null;
                                            
                                            return (
                                                <div 
                                                    key={member.id || member.user_id}
                                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    {/* Avatar */}
                                                    <div className="relative flex-shrink-0">
                                                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                            {member.avatar ? (
                                                                <img 
                                                                    src={member.avatar} 
                                                                    alt={memberName}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                memberName.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        {/* Indicador de status */}
                                                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(member)} rounded-full border-2 border-white`}></div>
                                                    </div>
                                                    
                                                    {/* Informações do usuário */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-1">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {memberName}
                                                            </p>
                                                            {member.name && member.name !== member.display_name && (
                                                                <span className="text-xs text-gray-500">({member.name})</span>
                                                            )}
                                                    {(member.is_owner || member.id === ownerId || member.role === 'owner' || member.role === 'master') && (
                                                        <svg 
                                                            className="w-4 h-4 text-yellow-500 flex-shrink-0" 
                                                            fill="currentColor" 
                                                            viewBox="0 0 24 24"
                                                            title="Mestre"
                                                        >
                                                            <path d="M5 16h3v6h8v-6h3l-3-7H8L5 16zM12 2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2z"/>
                                                            <path d="M5 16v6h14v-6H5z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                                                        </svg>
                                                    )}
                                                </div>
                                                {member.role && (
                                                    <p className="text-xs text-gray-500 capitalize">
                                                        {(member.is_owner || member.id === ownerId || member.role === 'owner' || member.role === 'master') ? 'Mestre' :
                                                         member.role === 'admin' ? 'Administrador' : 
                                                         'Membro'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Upload de Arquivo */}
                        <CampaignFileUpload 
                            campaignId={campaignId}
                            onUploadSuccess={handleFileUploaded}
                        />

                        {/* Lista de Arquivos */}
                        <CampaignFilesList 
                            campaignId={campaignId}
                            key={refreshFiles}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default CampaignChatSidebar;

