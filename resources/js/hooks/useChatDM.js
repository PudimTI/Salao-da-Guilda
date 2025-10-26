import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configurar Echo para Pusher
window.Pusher = Pusher;
const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authEndpoint: '/api/broadcasting/auth',
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
    },
});

export const useChatDM = () => {
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});
    
    const typingTimeoutRef = useRef(null);
    const echoRef = useRef(echo);

    // Configurar headers do axios
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    // Carregar conversas do usuário
    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/chat/conversations', {
                params: { type: 'dm' }
            });
            
            if (response.data.success) {
                setConversations(response.data.data.data);
            }
        } catch (err) {
            setError('Erro ao carregar conversas');
            console.error('Erro ao carregar conversas:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carregar mensagens de uma conversa
    const loadMessages = useCallback(async (conversationId, before = null) => {
        try {
            const response = await axios.get(`/api/chat/conversations/${conversationId}/messages`, {
                params: { 
                    per_page: 50,
                    before: before
                }
            });
            
            if (response.data.success) {
                const newMessages = response.data.data.data.reverse(); // Inverter ordem para exibição
                
                if (before) {
                    setMessages(prev => [...newMessages, ...prev]);
                } else {
                    setMessages(newMessages);
                }
                
                return response.data.data;
            }
        } catch (err) {
            setError('Erro ao carregar mensagens');
            console.error('Erro ao carregar mensagens:', err);
        }
    }, []);

    // Enviar mensagem
    const sendMessage = useCallback(async (content, mediaFile = null) => {
        if (!currentConversation) return;

        try {
            const formData = new FormData();
            formData.append('content', content);
            if (mediaFile) {
                formData.append('media', mediaFile);
            }

            const response = await axios.post(
                `/api/chat/conversations/${currentConversation.id}/messages`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                const newMessage = response.data.data;
                setMessages(prev => [newMessage, ...prev]);
                
                // Atualizar última atividade da conversa
                setConversations(prev => 
                    prev.map(conv => 
                        conv.id === currentConversation.id 
                            ? { ...conv, last_activity_at: newMessage.created_at }
                            : conv
                    )
                );
            }
        } catch (err) {
            setError('Erro ao enviar mensagem');
            console.error('Erro ao enviar mensagem:', err);
        }
    }, [currentConversation]);

    // Criar nova conversa DM
    const createDMConversation = useCallback(async (userId) => {
        try {
            const response = await axios.post('/api/chat/conversations', {
                participants: [userId],
                type: 'dm'
            });

            if (response.data.success) {
                const newConversation = response.data.data;
                setConversations(prev => [newConversation, ...prev]);
                setCurrentConversation(newConversation);
                return newConversation;
            }
        } catch (err) {
            setError('Erro ao criar conversa');
            console.error('Erro ao criar conversa:', err);
        }
    }, []);

    // Marcar mensagens como lidas
    const markAsRead = useCallback(async (conversationId) => {
        try {
            await axios.post(`/api/chat/conversations/${conversationId}/mark-read`);
            
            // Atualizar contador de não lidas
            setUnreadCounts(prev => ({
                ...prev,
                [conversationId]: 0
            }));
        } catch (err) {
            console.error('Erro ao marcar como lida:', err);
        }
    }, []);

    // Indicar que está digitando
    const startTyping = useCallback(async () => {
        if (!currentConversation || isTyping) return;

        try {
            setIsTyping(true);
            await axios.post(`/api/chat/conversations/${currentConversation.id}/typing`, {
                is_typing: true
            });

            // Parar de digitar após 3 segundos
            typingTimeoutRef.current = setTimeout(() => {
                stopTyping();
            }, 3000);
        } catch (err) {
            console.error('Erro ao indicar digitação:', err);
        }
    }, [currentConversation, isTyping]);

    // Parar de indicar digitação
    const stopTyping = useCallback(async () => {
        if (!currentConversation || !isTyping) return;

        try {
            setIsTyping(false);
            await axios.post(`/api/chat/conversations/${currentConversation.id}/typing`, {
                is_typing: false
            });

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        } catch (err) {
            console.error('Erro ao parar digitação:', err);
        }
    }, [currentConversation, isTyping]);

    // Configurar eventos de tempo real
    useEffect(() => {
        if (!echoRef.current || !currentConversation) return;

        const channel = echoRef.current.private(`conversation.${currentConversation.id}`);

        // Evento de nova mensagem
        channel.listen('message.sent', (data) => {
            const newMessage = data.message;
            
            // Adicionar mensagem se for da conversa atual
            if (newMessage.conversation_id === currentConversation.id) {
                setMessages(prev => [newMessage, ...prev]);
            }
            
            // Atualizar lista de conversas
            setConversations(prev => 
                prev.map(conv => 
                    conv.id === newMessage.conversation_id 
                        ? { ...conv, last_activity_at: newMessage.created_at }
                        : conv
                )
            );

            // Incrementar contador de não lidas se não for da conversa atual
            if (newMessage.conversation_id !== currentConversation.id) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [newMessage.conversation_id]: (prev[newMessage.conversation_id] || 0) + 1
                }));
            }
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
    }, [currentConversation]);

    // Carregar conversas ao montar o componente
    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // Marcar como lida quando mudar de conversa
    useEffect(() => {
        if (currentConversation) {
            markAsRead(currentConversation.id);
            loadMessages(currentConversation.id);
        }
    }, [currentConversation, markAsRead, loadMessages]);

    // Cleanup ao desmontar
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return {
        conversations,
        currentConversation,
        messages,
        loading,
        error,
        typingUsers,
        isTyping,
        unreadCounts,
        setCurrentConversation,
        sendMessage,
        createDMConversation,
        loadMessages,
        startTyping,
        stopTyping,
        markAsRead,
        loadConversations
    };
};
