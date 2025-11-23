import React, { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost, apiDelete } from '../utils/api';

const CampaignInviteManager = ({ campaignId }) => {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('sent'); // 'sent' ou 'requests'
    const isLoadingRef = useRef(false); // Ref para evitar múltiplas chamadas

    const loadInvites = React.useCallback(async () => {
        if (!campaignId || isLoadingRef.current) return; // Evitar chamadas simultâneas
        
        try {
            isLoadingRef.current = true;
            setLoading(true);
            const response = await apiGet(`/campaigns/${campaignId}/invites`);
            // Ajustar estrutura da resposta
            const invitesData = response.data?.data || response.data || [];
            setInvites(Array.isArray(invitesData) ? invitesData : []);
        } catch (error) {
            console.error('Erro ao carregar convites:', error);
            setError('Erro ao carregar convites');
            setInvites([]);
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [campaignId]);

    useEffect(() => {
        if (campaignId) {
            loadInvites();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignId]); // Removido loadInvites das dependências para evitar loop

    const handleApprove = async (inviteId) => {
        try {
            await apiPost(`/campaigns/${campaignId}/invites/${inviteId}/approve`);
            loadInvites(); // Recarregar lista
            // TODO: Mostrar notificação de sucesso
        } catch (error) {
            console.error('Erro ao aprovar solicitação:', error);
            // TODO: Mostrar notificação de erro
        }
    };

    const handleReject = async (inviteId) => {
        try {
            await apiPost(`/campaigns/${campaignId}/invites/${inviteId}/reject-request`);
            loadInvites(); // Recarregar lista
            // TODO: Mostrar notificação de sucesso
        } catch (error) {
            console.error('Erro ao rejeitar solicitação:', error);
            // TODO: Mostrar notificação de erro
        }
    };

    const handleCancel = async (inviteId) => {
        try {
            await apiDelete(`/api/invites/${inviteId}/cancel`);
            loadInvites(); // Recarregar lista
        } catch (error) {
            console.error('Erro ao cancelar convite:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'accepted': return 'Aceito';
            case 'rejected': return 'Rejeitado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    // Separar convites enviados de solicitações recebidas
    // Solicitações: quando invitee_id === campaign_owner_id (alguém está pedindo entrada)
    // Convites enviados: quando invitee_id !== campaign_owner_id (mestre convidou alguém)
    const sentInvites = invites.filter(invite => 
        invite && invite.id && !invite.is_request
    );
    const requests = invites.filter(invite => 
        invite && invite.id && invite.is_request
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Carregando convites...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    return (
        <div>
            {/* Header com tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`flex-1 py-4 px-6 text-sm font-medium transition-colors duration-200 ${
                            activeTab === 'sent'
                                ? 'text-green-600 border-b-2 border-green-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Convites Enviados</span>
                            {sentInvites.length > 0 && (
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                    activeTab === 'sent' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                                }`}>
                                    {sentInvites.length}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-4 px-6 text-sm font-medium transition-colors duration-200 ${
                            activeTab === 'requests'
                                ? 'text-green-600 border-b-2 border-green-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Solicitações</span>
                            {requests.length > 0 && (
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                    activeTab === 'requests' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                                }`}>
                                    {requests.length}
                                </span>
                            )}
                        </div>
                    </button>
                </div>
            </div>

            {/* Conteúdo das tabs */}
            <div className="p-6 bg-white">
                {activeTab === 'sent' ? (
                    <div className="space-y-4">
                        {sentInvites.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900">Nenhum convite enviado</h3>
                                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                                    Você ainda não enviou convites. Clique em "Novo Convite" para começar.
                                </p>
                            </div>
                        ) : (
                            sentInvites
                                .filter(invite => invite && invite.id && invite.invitee) // Filtrar antes do map
                                .map((invite) => {
                                const inviteeName = (invite.invitee?.name || invite.invitee?.display_name || 'Usuário').trim();
                                const inviteeEmail = invite.invitee?.email || '';
                                
                                if (!inviteeName) return null; // Se não tiver nome, não renderizar
                                
                                return (
                                <div key={invite.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center border-2 border-green-200">
                                                <span className="text-green-700 font-semibold text-sm">
                                                    {inviteeName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 truncate">{inviteeName}</h4>
                                            {inviteeEmail && (
                                                <p className="text-xs text-gray-500 truncate mt-0.5">{inviteeEmail}</p>
                                            )}
                                            {invite.message && (
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{invite.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(invite.status)}`}>
                                            {getStatusText(invite.status)}
                                        </span>
                                        
                                        {invite.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancel(invite.id)}
                                                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 whitespace-nowrap flex-shrink-0"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900">Nenhuma solicitação</h3>
                                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                                    As solicitações de entrada na campanha aparecerão aqui quando forem recebidas.
                                </p>
                            </div>
                        ) : (
                            requests
                                .filter(invite => invite && invite.id && invite.inviter) // Filtrar antes do map
                                .map((invite) => {
                                const inviterName = (invite.inviter?.name || invite.inviter?.display_name || 'Usuário').trim();
                                
                                if (!inviterName) return null; // Se não tiver nome, não renderizar
                                
                                return (
                                <div key={invite.id} className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-blue-200">
                                                    <span className="text-blue-700 font-semibold text-sm">
                                                        {inviterName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900 truncate">{inviterName}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">Solicitação de entrada</p>
                                                {invite.message && (
                                                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{invite.message}</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invite.status)}`}>
                                                {getStatusText(invite.status)}
                                            </span>
                                            
                                            {invite.status === 'pending' && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(invite.id)}
                                                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 shadow-sm hover:shadow transition-all duration-200 flex items-center space-x-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span>Aprovar</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(invite.id)}
                                                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 shadow-sm hover:shadow transition-all duration-200 flex items-center space-x-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        <span>Rejeitar</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampaignInviteManager;
