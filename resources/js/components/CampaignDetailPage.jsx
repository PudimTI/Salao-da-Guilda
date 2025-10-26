import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { apiGet, apiPost, apiDelete } from '../utils/api';

const CampaignDetailPage = ({ campaignId }) => {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMember, setIsMember] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');

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
            setIsMember(response.data.is_member || false);
            setIsOwner(response.data.is_owner || false);
        } catch (error) {
            console.error('Erro ao carregar campanha:', error);
            setError('Erro ao carregar campanha');
        } finally {
            setLoading(false);
        }
    };

    const handleInviteMember = async (e) => {
        e.preventDefault();
        try {
            await apiPost(`/api/campaigns/${campaignId}/invite`, {
                email: inviteEmail,
                message: inviteMessage
            });
            setInviteEmail('');
            setInviteMessage('');
            alert('Convite enviado com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar convite:', error);
            alert('Erro ao enviar convite');
        }
    };

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
            loadCampaign(); // Recarregar dados
        } catch (error) {
            console.error('Erro ao atualizar role do membro:', error);
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
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                    campaign.visibility === 'public' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {campaign.visibility === 'public' ? 'Pública' : 'Privada'}
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
                                        {campaign.type === 'digital' ? 'Digital' : 'Presencial'}
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
                                <p className="text-gray-700 whitespace-pre-line">{campaign.description}</p>
                            </div>
                        )}

                        {campaign.rules && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Regras</h3>
                                <p className="text-gray-700 whitespace-pre-line">{campaign.rules}</p>
                            </div>
                        )}

                        {/* Tags */}
                        {campaign.tags && campaign.tags.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {campaign.tags.map(tag => (
                                        <span key={tag.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                                            {tag.name}
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
                                
                                {campaign.members && campaign.members.length > 0 ? (
                                    <div className="space-y-3">
                                        {campaign.members.map(member => (
                                            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                                                        {member.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="font-medium text-gray-900">{member.name}</p>
                                                        <p className="text-sm text-gray-500">{member.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        member.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        member.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {member.status === 'active' ? 'Ativo' :
                                                         member.status === 'invited' ? 'Convidado' :
                                                         member.status}
                                                    </span>
                                                    {isOwner && (
                                                        <select 
                                                            onChange={(e) => updateMemberRole(member.id, e.target.value)}
                                                            className="text-xs border border-gray-300 rounded px-2 py-1"
                                                            value={member.role}
                                                        >
                                                            <option value="player">Player</option>
                                                            <option value="co_master">Co-Master</option>
                                                        </select>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">Nenhum membro ainda.</p>
                                )}
                            </div>

                            {/* Files */}
                            {campaign.files && campaign.files.length > 0 && (
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        Arquivos ({campaign.files.length})
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {campaign.files.map(file => (
                                            <div key={file.id} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center">
                                                    <svg className="w-8 h-8 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{file.name}</p>
                                                        <p className="text-sm text-gray-500">Enviado por {file.uploader?.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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
                                            {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Invite Member */}
                            {isOwner && (
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Convidar Membro</h3>
                                    <form onSubmit={handleInviteMember}>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input 
                                                    type="email" 
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem (opcional)</label>
                                                <textarea 
                                                    value={inviteMessage}
                                                    onChange={(e) => setInviteMessage(e.target.value)}
                                                    rows="3"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <button 
                                                type="submit"
                                                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
                                            >
                                                Enviar Convite
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CampaignDetailPage;
