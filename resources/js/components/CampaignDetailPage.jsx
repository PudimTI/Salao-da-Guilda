import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import CampaignInviteModal from './CampaignInviteModal';
import CampaignInviteManager from './CampaignInviteManager';
import { Toaster } from 'react-hot-toast';
import { apiGet, apiPost, apiDelete } from '../utils/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReportModal from './ReportModal';
import {
    formatCampaignStatus,
    getCampaignStatusColor,
    formatCampaignVisibility,
    getCampaignVisibilityColor,
    formatCampaignType,
    formatMemberRole,
    formatMemberStatus,
    getMemberStatusColor,
    formatCampaignDate,
    formatCampaignText
} from '../utils/campaignFormatters';

const CampaignDetailPage = ({ campaignId }) => {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMember, setIsMember] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const isLoadingRef = useRef(false); // Ref para evitar múltiplas chamadas simultâneas

    const loadCampaign = useCallback(async () => {
        if (!campaignId || isLoadingRef.current) return; // Evitar chamadas simultâneas
        
        try {
            isLoadingRef.current = true;
            setLoading(true);
            setError(null);
            const response = await apiGet(`/api/campaigns/${campaignId}`);
            
            // Verificar estrutura da resposta da API
            // A API retorna { success: true, data: {...} }
            const campaignData = response.data?.data || response.data;
            
            if (!campaignData) {
                setError('Campanha não encontrada');
                return;
            }
            
            setCampaign(campaignData);
            setIsMember(campaignData.is_member || false);
            setIsOwner(campaignData.is_owner || false);
        } catch (error) {
            console.error('Erro ao carregar campanha:', error);
            setError(error.response?.data?.message || 'Erro ao carregar campanha');
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [campaignId]);

    useEffect(() => {
        if (campaignId) {
            loadCampaign();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignId]); // loadCampaign já está memoizado com useCallback e depende de campaignId

    const handleInviteSuccess = useCallback(() => {
        setShowInviteModal(false);
        loadCampaign(); // Recarregar dados para atualizar lista de membros
    }, [loadCampaign]);

    const handleLeaveCampaign = async () => {
        if (!confirm('Tem certeza que deseja sair desta campanha?')) {
            return;
        }

        try {
            await apiDelete(`/api/campaigns/${campaignId}/leave`);
            window.location.href = '/campaigns';
        } catch (error) {
            console.error('Erro ao sair da campanha:', error);
        }
    };

    const updateMemberRole = async (userId, role) => {
        try {
            await apiPost(`/api/campaigns/${campaignId}/members/${userId}/role`, { role });
            toast.success('Role do membro atualizado com sucesso!');
            loadCampaign(); // Recarregar dados
        } catch (error) {
            console.error('Erro ao atualizar role do membro:', error);
            toast.error(error.response?.data?.message || 'Erro ao atualizar role do membro');
        }
    };

    const handleRemoveMember = async (userId, memberName) => {
        if (!confirm(`Tem certeza que deseja expulsar ${memberName} da campanha?`)) {
            return;
        }

        try {
            await axios.delete(`/api/campaigns/${campaignId}/members/${userId}`);
            toast.success('Membro expulso com sucesso!');
            loadCampaign(); // Recarregar dados
        } catch (error) {
            console.error('Erro ao expulsar membro:', error);
            toast.error(error.response?.data?.message || 'Erro ao expulsar membro');
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
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <main className="py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
                                <p className="text-gray-600 mt-2">Criado por {campaign.owner?.display_name || campaign.owner?.name || 'Usuário'}</p>
                            </div>
                            <div className="flex space-x-2">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCampaignStatusColor(campaign.status)}`}>
                                    {formatCampaignStatus(campaign.status)}
                                </span>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCampaignVisibilityColor(campaign.visibility)}`}>
                                    {formatCampaignVisibility(campaign.visibility)}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-6">
                            {campaign.system && (
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <span className="text-sm text-gray-700">{campaign.system}</span>
                                </div>
                            )}
                            {campaign.type && (
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                                    </svg>
                                    <span className="text-sm text-gray-700">
                                        {formatCampaignType(campaign.type)}
                                    </span>
                                </div>
                            )}
                            {campaign.city && (
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                    </svg>
                                    <span className="text-sm text-gray-700">{campaign.city}</span>
                                </div>
                            )}
                        </div>

                        {campaign.description && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {formatCampaignText(campaign.description)}
                                </p>
                            </div>
                        )}

                        {campaign.rules && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Regras</h3>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {formatCampaignText(campaign.rules)}
                                </p>
                            </div>
                        )}

                        {/* Tags */}
                        {campaign.tags && Array.isArray(campaign.tags) && campaign.tags.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {campaign.tags
                                        .filter(tag => tag && tag.id) // Filtrar tags inválidas antes do map
                                        .map(tag => (
                                            <span key={tag.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                                                {tag.name || 'Sem nome'}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-4">
                            {isMember && (
                                <a 
                                    href={`/campaigns/${campaign.id}/chat`}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Entrar no Chat
                                </a>
                            )}
                            
                            {isOwner && (
                                <a 
                                    href={`/campaigns/${campaign.id}/edit`}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium transition-colors"
                                >
                                    Editar Campanha
                                </a>
                            )}
                            
                            {isMember && !isOwner && (
                                <button 
                                    onClick={handleLeaveCampaign}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors"
                                >
                                    Sair da Campanha
                                </button>
                            )}

                            <button
                                onClick={() => setShowReportModal(true)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded font-medium transition-colors flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9l3 6H9l3-6zm0 8h.01" />
                                </svg>
                                Denunciar campanha
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Members */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Membros ({campaign.members?.length || 0})
                                </h2>
                                
                                {campaign.members && Array.isArray(campaign.members) && campaign.members.length > 0 ? (
                                    <div className="space-y-3">
                                        {campaign.members
                                            .filter(member => member && member.id) // Filtrar membros inválidos antes do map
                                            .map(member => {
                                            const isMemberOwner = campaign.owner_id === member.id;
                                            const canRemove = isOwner && !isMemberOwner && member.id !== campaign.owner_id;
                                            // Priorizar display_name sobre name
                                            const memberName = (member.display_name || member.name || 'Usuário').trim();
                                            
                                            if (!memberName) return null; // Se não tiver nome, não renderizar
                                            
                                            return (
                                                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center flex-1">
                                                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                                                            {memberName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ml-3 flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <p className="font-medium text-gray-900">{memberName}</p>
                                                                {member.name && member.name !== member.display_name && (
                                                                    <span className="text-xs text-gray-500">({member.name})</span>
                                                                )}
                                                                {isMemberOwner && (
                                                                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" title="Mestre">
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <p className="text-sm text-gray-500">{formatMemberRole(member.role || 'player')}</p>
                                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getMemberStatusColor(member.status)}`}>
                                                                    {formatMemberStatus(member.status)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        {isOwner && !isMemberOwner && (
                                                            <select 
                                                                onChange={(e) => updateMemberRole(member.id, e.target.value)}
                                                                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                value={member.role || 'player'}
                                                            >
                                                                <option value="player">Player</option>
                                                                <option value="co_master">Co-Master</option>
                                                            </select>
                                                        )}
                                                        {canRemove && (
                                                            <button
                                                                onClick={() => handleRemoveMember(member.id, memberName)}
                                                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Expulsar membro"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">Nenhum membro ainda.</p>
                                )}
                            </div>

                            {/* Files */}
                            {campaign.files && Array.isArray(campaign.files) && campaign.files.length > 0 && (
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        Arquivos ({campaign.files.filter(f => f && f.id).length})
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {campaign.files
                                            .filter(file => file && file.id) // Filtrar arquivos inválidos
                                            .map(file => {
                                                const fileName = file.name || 'Arquivo sem nome';
                                                const uploaderName = file.uploader?.name || file.uploader?.display_name || 'Desconhecido';
                                                return (
                                                    <div key={file.id} className="p-4 border border-gray-200 rounded-lg">
                                                        <div className="flex items-center">
                                                            <svg className="w-8 h-8 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                                                            </svg>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{fileName}</p>
                                                                <p className="text-sm text-gray-500">Enviado por {uploaderName}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Statistics */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Membros:</span>
                                        <span className="font-medium">{campaign.members?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Arquivos:</span>
                                        <span className="font-medium">{campaign.files?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Rolagens:</span>
                                        <span className="font-medium">{campaign.dice_rolls_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Criado em:</span>
                                        <span className="font-medium">
                                            {formatCampaignDate(campaign.created_at, false)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Invite Member */}
                            {isOwner && (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                    {/* Header do container */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Convidar Membro</h3>
                                                    <p className="text-sm text-gray-600">Gerencie convites e solicitações de entrada</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowInviteModal(true)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                <span>Novo Convite</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Conteúdo do gerenciador de convites */}
                                    <div className="p-0">
                                        <CampaignInviteManager campaignId={campaignId} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Modal de Convite */}
            <CampaignInviteModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                campaignId={campaignId}
                campaignName={campaign?.name}
                onInviteSuccess={handleInviteSuccess}
            />

            {/* Toaster para notificações */}
            <Toaster position="top-right" />

            {showReportModal && (
                <ReportModal
                    isOpen={showReportModal}
                    targetType="campaign"
                    targetId={campaign.id}
                    targetName={campaign.name}
                    targetDescription={campaign.description}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </div>
    );
};

export default CampaignDetailPage;
