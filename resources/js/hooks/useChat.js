import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

export const useChat = (conversationId = null) => {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    
    const typingTimeoutRef = useRef(null);
    const echo = window.Echo;

    // Carregar conversas
    const loadConversations = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get('/api/chat/conversations');
            setConversations(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao carregar conversas');
        } finally {
            setLoading(false);
        }
    }, []);

    // Carregar mensagens de uma conversa
    const loadMessages = useCallback(async (convId, options = {}) => {
        if (!convId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams();
            if (options.before) params.append('before', options.before);
            if (options.after) params.append('after', options.after);
            if (options.per_page) params.append('per_page', options.per_page);
            
            const response = await axios.get(`/api/chat/conversations/${convId}/messages?${params}`);
            setMessages(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao carregar mensagens');
        } finally {
            setLoading(false);
        }
    }, []);

    // Enviar mensagem
    const sendMessage = useCallback(async (content, media = null, replyTo = null) => {
        if (!currentConversation) return;
        
        try {
            const formData = new FormData();
            formData.append('content', content || '');
            if (media) formData.append('media', media);
            if (replyTo) formData.append('reply_to', replyTo);
            
            const response = await axios.post(
                `/api/chat/conversations/${currentConversation.id}/messages`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            
            // A mensagem será adicionada automaticamente via evento de broadcasting
            return response.data.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao enviar mensagem');
            throw err;
        }
    }, [currentConversation]);

    // Indicar que está digitando
    const startTyping = useCallback(async () => {
        if (!currentConversation || isTyping) return;
        
        try {
            await axios.post(`/api/chat/conversations/${currentConversation.id}/typing`, {
                is_typing: true
            });
            setIsTyping(true);
        } catch (err) {
            console.error('Erro ao indicar digitação:', err);
        }
    }, [currentConversation, isTyping]);

    // Parar de indicar digitação
    const stopTyping = useCallback(async () => {
        if (!currentConversation || !isTyping) return;
        
        try {
            await axios.post(`/api/chat/conversations/${currentConversation.id}/typing`, {
                is_typing: false
            });
            setIsTyping(false);
        } catch (err) {
            console.error('Erro ao parar digitação:', err);
        }
    }, [currentConversation, isTyping]);

    // Marcar mensagens como lidas
    const markAsRead = useCallback(async (convId) => {
        try {
            await axios.post(`/api/chat/conversations/${convId}/mark-read`);
        } catch (err) {
            console.error('Erro ao marcar como lida:', err);
        }
    }, []);

    // Configurar eventos de tempo real
    useEffect(() => {
        if (!echo || !currentConversation) return;

        const channel = echo.private(`conversation.${currentConversation.id}`);

        // Evento de nova mensagem
        channel.listen('message.sent', (data) => {
            setMessages(prev => [data.message, ...prev]);
            
            // Atualizar lista de conversas
            setConversations(prev => 
                prev.map(conv => 
                    conv.id === data.message.conversation_id 
                        ? { ...conv, last_activity_at: data.message.created_at }
                        : conv
                )
            );
        });

        // Evento de usuário digitando
        channel.listen('user.typing', (data) => {
            if (data.is_typing) {
                setTypingUsers(prev => {
                    const exists = prev.find(user => user.id === data.user.id);
                    if (!exists) {
                        return [...prev, data.user];
                    }
                    return prev;
                });
            } else {
                setTypingUsers(prev => 
                    prev.filter(user => user.id !== data.user.id)
                );
            }
        });

        // Evento de usuário entrou na conversa
        channel.listen('user.joined', (data) => {
            console.log(`${data.user.name} entrou na conversa`);
        });

        // Evento de usuário saiu da conversa
        channel.listen('user.left', (data) => {
            console.log(`${data.user.name} saiu da conversa`);
        });

        return () => {
            channel.stopListening('message.sent');
            channel.stopListening('user.typing');
            channel.stopListening('user.joined');
            channel.stopListening('user.left');
        };
    }, [echo, currentConversation]);

    // Gerenciar timeout de digitação
    useEffect(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
                stopTyping();
            }, 3000); // Para de digitar após 3 segundos de inatividade
        }

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [isTyping, stopTyping]);

    // Carregar conversas na inicialização
    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // Carregar mensagens quando a conversa muda
    useEffect(() => {
        if (conversationId) {
            loadMessages(conversationId);
        }
    }, [conversationId, loadMessages]);

    return {
        conversations,
        messages,
        currentConversation,
        loading,
        error,
        typingUsers,
        isTyping,
        loadConversations,
        loadMessages,
        sendMessage,
        startTyping,
        stopTyping,
        markAsRead,
        setCurrentConversation,
        setMessages,
    };
};
