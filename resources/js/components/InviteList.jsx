import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api';

const InviteList = () => {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadInvites();
    }, []);

    const loadInvites = async () => {
        try {
            setLoading(true);
            const response = await apiGet('/invites');
            setInvites(response.data || []);
        } catch (error) {
            console.error('Erro ao carregar convites:', error);
            setError('Erro ao carregar convites');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (inviteId) => {
        try {
            await apiPost(`/invites/${inviteId}/accept`);
            setInvites(invites.filter(invite => invite.id !== inviteId));
            // TODO: Mostrar notificação de sucesso
        } catch (error) {
            console.error('Erro ao aceitar convite:', error);
            // TODO: Mostrar notificação de erro
        }
    };

    const handleReject = async (inviteId) => {
        try {
            await apiPost(`/invites/${inviteId}/reject`);
            setInvites(invites.filter(invite => invite.id !== inviteId));
            // TODO: Mostrar notificação de sucesso
        } catch (error) {
            console.error('Erro ao rejeitar convite:', error);
            // TODO: Mostrar notificação de erro
        }
    };

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

    if (invites.length === 0) {
        return (
            <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum convite pendente</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Você não possui convites pendentes no momento.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {invites.map((invite) => (
                <div key={invite.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <span className="text-indigo-600 font-medium">
                                            {invite.campaign.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {invite.campaign.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Convite de <span className="font-medium">{invite.inviter.name}</span>
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {invite.campaign.system} • {invite.campaign.type === 'digital' ? 'Digital' : 'Presencial'}
                                        {invite.campaign.city && ` • ${invite.campaign.city}`}
                                    </p>
                                </div>
                            </div>
                            
                            {invite.message && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700">{invite.message}</p>
                                </div>
                            )}
                            
                            <div className="mt-4 text-xs text-gray-500">
                                Enviado em {new Date(invite.sent_at).toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                            <button
                                onClick={() => handleAccept(invite.id)}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                            >
                                Aceitar
                            </button>
                            <button
                                onClick={() => handleReject(invite.id)}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                            >
                                Rejeitar
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InviteList;
