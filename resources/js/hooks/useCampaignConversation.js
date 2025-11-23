import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * Hook especializado para gerenciar conversas de campanha
 * Centraliza lógica de busca/criação e previne race conditions
 */
export const useCampaignConversation = (campaignId) => {
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [creating, setCreating] = useState(false);
    
    // Ref para prevenir múltiplas criações simultâneas
    const creatingRef = useRef(false);
    const abortControllerRef = useRef(null);

    // Buscar ou criar conversa da campanha
    const findOrCreateConversation = async () => {
        if (!campaignId) {
            setLoading(false);
            return;
        }

        // Cancelar requisição anterior se existir
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            setLoading(true);
            setError(null);

            // Primeiro, buscar conversas existentes da campanha
            const response = await axios.get(
                `/api/campaigns/${campaignId}/conversations`,
                { signal: abortController.signal }
            );

            if (response.data.success && response.data.data) {
                const conversations = Array.isArray(response.data.data) 
                    ? response.data.data 
                    : [];

                // Filtrar conversas do tipo 'campaign'
                const campaignConversation = conversations.find(
                    conv => conv.type === 'campaign'
                );

                if (campaignConversation) {
                    setConversation(campaignConversation);
                    setLoading(false);
                    return;
                }

                // Se não encontrou, criar nova (com lock)
                if (!creatingRef.current) {
                    await createConversation(abortController);
                }
            } else {
                // Se não há conversas, criar
                if (!creatingRef.current) {
                    await createConversation(abortController);
                }
            }
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                // Requisição foi cancelada, ignorar
                return;
            }

            console.error('Erro ao buscar conversa da campanha:', err);
            
            // Se erro não é 404, tentar criar
            if (err.response?.status !== 404 && !creatingRef.current) {
                await createConversation(abortController);
            } else {
                setError('Erro ao carregar conversa da campanha');
                setLoading(false);
            }
        }
    };

    // Criar nova conversa (com prevenção de race condition)
    const createConversation = async (abortController = null) => {
        if (creatingRef.current) {
            return; // Já está criando, aguardar
        }

        creatingRef.current = true;
        setCreating(true);

        try {
            // Primeiro, verificar se usuário é membro da campanha
            const membersResponse = await axios.get(
                `/api/campaigns/${campaignId}/members`,
                { signal: abortController?.signal }
            );

            if (!membersResponse.data.success) {
                throw new Error('Não foi possível verificar membros da campanha');
            }

            const members = membersResponse.data.data || [];
            
            // Verificar se usuário atual está nos membros
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const isMember = members.some(
                member => (member.user_id || member.id) === currentUser.id
            );

            if (!isMember) {
                throw new Error('Você não é membro desta campanha');
            }

            // Criar conversa incluindo todos os membros
            const participants = members.map(member => member.user_id || member.id);
            
            const conversationResponse = await axios.post(
                '/api/chat/conversations',
                {
                    participants,
                    title: `Chat da Campanha`,
                    type: 'campaign',
                    campaign_id: campaignId
                },
                { signal: abortController?.signal }
            );

            if (conversationResponse.data.success && conversationResponse.data.data) {
                // Verificar novamente se não foi criada por outro usuário
                const finalCheck = await axios.get(
                    `/api/campaigns/${campaignId}/conversations`,
                    { signal: abortController?.signal }
                );

                if (finalCheck.data.success && finalCheck.data.data) {
                    const conversations = Array.isArray(finalCheck.data.data) 
                        ? finalCheck.data.data 
                        : [];
                    const campaignConv = conversations.find(
                        conv => conv.type === 'campaign'
                    );

                    if (campaignConv) {
                        setConversation(campaignConv);
                        setLoading(false);
                        setCreating(false);
                        creatingRef.current = false;
                        return;
                    }
                }

                setConversation(conversationResponse.data.data);
            }
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                return;
            }

            console.error('Erro ao criar conversa da campanha:', err);
            
            if (err.response?.status === 409) {
                // Conversa já existe (criada por outro usuário), buscar novamente
                await findOrCreateConversation();
            } else {
                setError(err.response?.data?.message || err.message || 'Erro ao criar conversa');
            }
        } finally {
            setCreating(false);
            creatingRef.current = false;
        }
    };

    // Atualizar conversa manualmente
    const refreshConversation = async () => {
        await findOrCreateConversation();
    };

    // Efeito principal
    useEffect(() => {
        findOrCreateConversation();

        return () => {
            // Cleanup: cancelar requisições pendentes
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            creatingRef.current = false;
        };
    }, [campaignId]);

    return {
        conversation,
        loading,
        error,
        creating,
        refreshConversation,
        findOrCreateConversation
    };
};
















