import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

const PusherConnectionTest = () => {
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [connectionDetails, setConnectionDetails] = useState(null);
    const [testChannel, setTestChannel] = useState(null);
    const [events, setEvents] = useState([]);
    const [testMessage, setTestMessage] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    useEffect(() => {
        const echo = window.Echo;
        if (!echo) {
            setConnectionStatus('error');
            setConnectionDetails({ error: 'Laravel Echo não está configurado' });
            return;
        }

        // Verificar status da conexão Pusher
        const pusher = echo.connector.pusher;
        
        if (!pusher) {
            setConnectionStatus('error');
            setConnectionDetails({ error: 'Pusher não está configurado' });
            return;
        }

        // Monitorar mudanças de estado
        const updateConnectionStatus = () => {
            const state = pusher.connection.state;
            setConnectionStatus(state);

            setConnectionDetails({
                socket_id: pusher.connection.socket_id,
                state: state,
                url: pusher.config?.wsHost || 'N/A',
                cluster: pusher.config?.cluster || 'N/A',
                encrypted: pusher.config?.encrypted || false,
            });

            // Mostrar toast quando conectar
            if (state === 'connected') {
                toast.success('Conectado ao Pusher!');
            } else if (state === 'disconnected') {
                toast.error('Desconectado do Pusher');
            } else if (state === 'failed') {
                toast.error('Falha na conexão com Pusher');
            }
        };

        // Event listeners
        pusher.connection.bind('state_change', (states) => {
            console.log('Pusher state changed:', states);
            updateConnectionStatus();
        });

        pusher.connection.bind('connected', () => {
            console.log('Pusher connected');
            updateConnectionStatus();
        });

        pusher.connection.bind('disconnected', () => {
            console.log('Pusher disconnected');
            updateConnectionStatus();
        });

        pusher.connection.bind('error', (error) => {
            console.error('Pusher error:', error);
            toast.error(`Erro Pusher: ${error.error?.data?.message || error.message || 'Erro desconhecido'}`);
            updateConnectionStatus();
        });

        // Estado inicial
        updateConnectionStatus();

        // Cleanup
        return () => {
            pusher.connection.unbind('state_change');
            pusher.connection.unbind('connected');
            pusher.connection.unbind('disconnected');
            pusher.connection.unbind('error');
        };
    }, []);

    // Testar conexão em canal público
    const testPublicChannel = () => {
        const echo = window.Echo;
        if (!echo) {
            toast.error('Laravel Echo não está disponível');
            return;
        }

        try {
            const channel = echo.channel('test-channel');
            
            channel.listen('.test', (data) => {
                console.log('Evento de teste recebido:', data);
                setEvents(prev => [...prev, {
                    type: 'public',
                    event: 'test',
                    data,
                    timestamp: new Date().toISOString()
                }]);
                toast.success('Evento de teste recebido!');
            });

            setTestChannel(channel);
            toast.success('Escutando canal público "test-channel"');
        } catch (error) {
            console.error('Erro ao testar canal público:', error);
            toast.error('Erro ao testar canal público: ' + error.message);
        }
    };

    // Testar conexão em canal privado
    const testPrivateChannel = () => {
        const echo = window.Echo;
        if (!echo) {
            toast.error('Laravel Echo não está disponível');
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!currentUser.id) {
            toast.error('Usuário não autenticado');
            return;
        }

        try {
            const channel = echo.private(`test-user-${currentUser.id}`);
            
            channel.listen('.test', (data) => {
                console.log('Evento de teste privado recebido:', data);
                setEvents(prev => [...prev, {
                    type: 'private',
                    event: 'test',
                    data,
                    timestamp: new Date().toISOString()
                }]);
                toast.success('Evento de teste privado recebido!');
            });

            // Tentar autorização
            channel.subscribed(() => {
                toast.success('Canal privado autorizado!');
            });

            channel.error((error) => {
                console.error('Erro no canal privado:', error);
                toast.error('Erro ao acessar canal privado');
            });

            setTestChannel(channel);
            toast.success(`Escutando canal privado "test-user-${currentUser.id}"`);
        } catch (error) {
            console.error('Erro ao testar canal privado:', error);
            toast.error('Erro ao testar canal privado: ' + error.message);
        }
    };

    // Testar canal de conversa
    const testConversationChannel = () => {
        const echo = window.Echo;
        if (!echo) {
            toast.error('Laravel Echo não está disponível');
            return;
        }

        const conversationId = prompt('Digite o ID da conversa para testar:');
        if (!conversationId) return;

        try {
            const channel = echo.private(`conversation.${conversationId}`);
            
            channel.listen('message.sent', (data) => {
                console.log('Mensagem recebida:', data);
                setEvents(prev => [...prev, {
                    type: 'conversation',
                    event: 'message.sent',
                    data,
                    timestamp: new Date().toISOString()
                }]);
                toast.success('Nova mensagem recebida!');
            });

            channel.listen('user.typing', (data) => {
                console.log('Usuário digitando:', data);
                setEvents(prev => [...prev, {
                    type: 'conversation',
                    event: 'user.typing',
                    data,
                    timestamp: new Date().toISOString()
                }]);
            });

            channel.subscribed(() => {
                toast.success(`Conectado ao canal da conversa ${conversationId}!`);
            });

            channel.error((error) => {
                console.error('Erro no canal de conversa:', error);
                toast.error('Erro ao acessar canal de conversa (verifique permissões)');
            });

            setTestChannel(channel);
            toast.success(`Escutando canal "conversation.${conversationId}"`);
        } catch (error) {
            console.error('Erro ao testar canal de conversa:', error);
            toast.error('Erro ao testar canal de conversa: ' + error.message);
        }
    };

    // Parar escuta
    const stopListening = () => {
        if (testChannel) {
            testChannel.stopListening('.test');
            testChannel.stopListening('message.sent');
            testChannel.stopListening('user.typing');
            setTestChannel(null);
            toast.info('Escuta parada');
        }
    };

    // Limpar eventos
    const clearEvents = () => {
        setEvents([]);
        toast.info('Eventos limpos');
    };

    // Enviar evento de teste
    const sendTestEvent = async (type, conversationId = null) => {
        setSendingTest(true);
        try {
            let endpoint = '';
            let payload = { message: testMessage || 'Mensagem de teste' };

            switch (type) {
                case 'public':
                    endpoint = '/api/pusher-test/public';
                    break;
                case 'private':
                    endpoint = '/api/pusher-test/private';
                    break;
                case 'conversation':
                    if (!conversationId) {
                        const convId = prompt('Digite o ID da conversa:');
                        if (!convId) return;
                        conversationId = convId;
                    }
                    endpoint = `/api/pusher-test/conversation/${conversationId}`;
                    break;
            }

            const token = localStorage.getItem('auth_token');
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Evento de teste enviado! Verifique os eventos recebidos.');
            } else {
                toast.error(data.message || 'Erro ao enviar evento de teste');
            }
        } catch (error) {
            console.error('Erro ao enviar evento de teste:', error);
            toast.error('Erro ao enviar evento de teste: ' + error.message);
        } finally {
            setSendingTest(false);
        }
    };

    // Obter cor do status
    const getStatusColor = (status) => {
        switch (status) {
            case 'connected':
                return 'bg-green-500';
            case 'connecting':
                return 'bg-yellow-500';
            case 'disconnected':
                return 'bg-gray-500';
            case 'failed':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <Toaster position="top-right" />
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Teste de Conexão Pusher</h2>

            {/* Status da Conexão */}
            <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(connectionStatus)}`}></div>
                    <span className="font-semibold text-gray-700">
                        Status: <span className="capitalize">{connectionStatus}</span>
                    </span>
                </div>

                {connectionDetails && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        {connectionDetails.error ? (
                            <p className="text-red-600">{connectionDetails.error}</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">Socket ID:</span>{' '}
                                        <span className="text-gray-800">{connectionDetails.socket_id || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Cluster:</span>{' '}
                                        <span className="text-gray-800">{connectionDetails.cluster}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Host:</span>{' '}
                                        <span className="text-gray-800">{connectionDetails.url}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Criptografado:</span>{' '}
                                        <span className="text-gray-800">{connectionDetails.encrypted ? 'Sim' : 'Não'}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Input de Mensagem de Teste */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem de Teste (opcional)
                </label>
                <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Digite uma mensagem para o teste..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>

            {/* Botões de Teste - Escutar */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Escutar Canais</h3>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={testPublicChannel}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Escutar Canal Público
                    </button>
                    <button
                        onClick={testPrivateChannel}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Escutar Canal Privado
                    </button>
                    <button
                        onClick={testConversationChannel}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Escutar Canal de Conversa
                    </button>
                    <button
                        onClick={stopListening}
                        disabled={!testChannel}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Parar Escuta
                    </button>
                </div>
            </div>

            {/* Botões de Teste - Enviar */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Enviar Eventos de Teste</h3>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => sendTestEvent('public')}
                        disabled={sendingTest}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sendingTest ? 'Enviando...' : 'Enviar para Canal Público'}
                    </button>
                    <button
                        onClick={() => sendTestEvent('private')}
                        disabled={sendingTest}
                        className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sendingTest ? 'Enviando...' : 'Enviar para Canal Privado'}
                    </button>
                    <button
                        onClick={() => sendTestEvent('conversation')}
                        disabled={sendingTest}
                        className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sendingTest ? 'Enviando...' : 'Enviar para Canal de Conversa'}
                    </button>
                    <button
                        onClick={clearEvents}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Limpar Eventos
                    </button>
                </div>
            </div>

            {/* Eventos Recebidos */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-700">
                        Eventos Recebidos ({events.length})
                    </h3>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
                    {events.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Nenhum evento recebido ainda...</p>
                    ) : (
                        events.map((event, index) => (
                            <div key={index} className="bg-white rounded p-3 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            event.type === 'public' ? 'bg-blue-100 text-blue-800' :
                                            event.type === 'private' ? 'bg-purple-100 text-purple-800' :
                                            'bg-indigo-100 text-indigo-800'
                                        }`}>
                                            {event.type}
                                        </span>
                                        <span className="font-semibold text-gray-700">{event.event}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(event.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(event.data, null, 2)}
                                </pre>
                            </div>
                        )).reverse() // Mais recentes primeiro
                    )}
                </div>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Dicas para Testar:</h4>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Use o canal público para testar conexão básica</li>
                    <li>Use o canal privado para testar autenticação</li>
                    <li>Use o canal de conversa para testar com uma conversa real</li>
                    <li>Envie mensagens via chat para ver eventos em tempo real</li>
                    <li>Verifique o console do navegador para logs detalhados</li>
                </ul>
            </div>
        </div>
    );
};

export default PusherConnectionTest;

