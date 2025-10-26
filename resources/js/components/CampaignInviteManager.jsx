import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api';

const CampaignInviteManager = ({ campaignId }) => {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('sent'); // 'sent' ou 'requests'

    useEffect(() => {
        loadInvites();
    }, [campaignId]);

    const loadInvites = async () => {
        try {
            setLoading(true);
            const response = await apiGet(`/campaigns/${campaignId}/invites`);
            setInvites(response.data || []);
        } catch (error) {
            console.error('Erro ao carregar convites:', error);
            setError('Erro ao carregar convites');
        } finally {
            setLoading(false);
        }
    };

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
            await apiPost(`/invites/${inviteId}/cancel`);
            loadInvites(); // Recarregar lista
            // TODO: Mostrar notificação de sucesso
        } catch (error) {
            console.error('Erro ao cancelar convite:', error);
            // TODO: Mostrar notificação de erro
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

    const sentInvites = invites.filter(invite => !invite.is_self_invite);
    const requests = invites.filter(invite => invite.is_self_invite);

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
        <div className="bg-white rounded-lg shadow">
            {/* Header com tabs */}
            <div className="border-b border-gray-200">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`flex-1 py-4 px-6 text-sm font-medium ${
                            activeTab === 'sent'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Convites Enviados ({sentInvites.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-4 px-6 text-sm font-medium ${
                            activeTab === 'requests'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Solicitações ({requests.length})
                    </button>
                </div>
            </div>

            {/* Conteúdo das tabs */}
            <div className="p-6">
                {activeTab === 'sent' ? (
                    <div className="space-y-4">
                        {sentInvites.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum convite enviado</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Os convites enviados aparecerão aqui.
                                </p>
                            </div>
                        ) : (
                            sentInvites.map((invite) => (
                                <div key={invite.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <span className="text-gray-600 font-medium">
                                                    {invite.invitee.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">{invite.invitee.name}</h4>
                                            <p className="text-sm text-gray-500">{invite.invitee.email}</p>
                                            {invite.message && (
                                                <p className="text-xs text-gray-600 mt-1">{invite.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invite.status)}`}>
                                            {getStatusText(invite.status)}
                                        </span>
                                        
                                        {invite.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancel(invite.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma solicitação</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    As solicitações de entrada aparecerão aqui.
                                </p>
                            </div>
                        ) : (
                            requests.map((invite) => (
                                <div key={invite.id} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-medium">
                                                        {invite.inviter.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">{invite.inviter.name}</h4>
                                                <p className="text-sm text-gray-500">Solicitação de entrada</p>
                                                {invite.message && (
                                                    <p className="text-sm text-gray-700 mt-2">{invite.message}</p>
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
                                                        className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
                                                    >
                                                        Aprovar
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(invite.id)}
                                                        className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
                                                    >
                                                        Rejeitar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampaignInviteManager;
