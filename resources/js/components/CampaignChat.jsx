import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { useDiceRoll } from '../hooks/useDiceRoll';
import DiceRollMessage from './DiceRollMessage';

const CampaignChat = ({ conversationId, campaignId }) => {
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showDiceModal, setShowDiceModal] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [diceFormula, setDiceFormula] = useState('1d20');
    const [diceDescription, setDiceDescription] = useState('');
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const {
        messages,
        loading,
        error,
        typingUsers,
        sendMessage,
        startTyping,
        stopTyping,
        markAsRead,
        setCurrentConversation
    } = useChat(conversationId);

    const {
        rollDice,
        validateFormula,
        parseFormula,
        getCommonFormulas,
        loading: diceLoading
    } = useDiceRoll(campaignId);

    // Configurar conversa atual
    useEffect(() => {
        if (conversationId) {
            setCurrentConversation({ id: conversationId });
        }
    }, [conversationId, setCurrentConversation]);

    // Marcar mensagens como lidas quando a conversa muda
    useEffect(() => {
        if (conversationId) {
            markAsRead(conversationId);
        }
    }, [conversationId, markAsRead]);

    // Scroll automático para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            try {
                await sendMessage(newMessage.trim());
                setNewMessage('');
                stopTyping();
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
            }
        }
    };

    const handleDiceRoll = async () => {
        if (!validateFormula(diceFormula)) {
            alert('Fórmula inválida. Use formato como: 1d20, 2d6+3, 3d4-1');
            return;
        }

        try {
            const result = await rollDice(diceFormula, diceDescription);
            const parsed = parseFormula(diceFormula);
            const diceMessage = `🎲 ${result.roller.name} rolou ${parsed.display}: [${result.result}]${diceDescription ? ` - ${diceDescription}` : ''}`;
            
            await sendMessage(diceMessage);
            setShowDiceModal(false);
            setDiceFormula('1d20');
            setDiceDescription('');
        } catch (error) {
            console.error('Erro ao rolar dados:', error);
            alert('Erro ao rolar dados: ' + error.message);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setShowFileUpload(true);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;

        try {
            await sendMessage('', selectedFile);
            setShowFileUpload(false);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Erro ao enviar arquivo:', error);
            alert('Erro ao enviar arquivo: ' + error.message);
        }
    };

    const handleQuickDiceRoll = async (formula) => {
        try {
            const result = await rollDice(formula);
            const parsed = parseFormula(formula);
            const diceMessage = `🎲 ${result.roller.name} rolou ${parsed.display}: [${result.result}]`;
            
            await sendMessage(diceMessage);
        } catch (error) {
            console.error('Erro ao rolar dados:', error);
            alert('Erro ao rolar dados: ' + error.message);
        }
    };

    // Detectar se uma mensagem é uma rolagem de dados
    const isDiceRollMessage = (message) => {
        return message.content && message.content.includes('🎲') && message.content.includes('rolou');
    };

    // Extrair dados da rolagem da mensagem
    const parseDiceRollFromMessage = (message) => {
        if (!isDiceRollMessage(message)) return null;
        
        // Regex para extrair: 🎲 Nome rolou formula: [resultado]
        const match = message.content.match(/🎲 (.+?) rolou (.+?): \[(\d+)\](?: - (.+))?/);
        if (!match) return null;
        
        const [, rollerName, formula, result, description] = match;
        
        return {
            roller: { name: rollerName },
            formula,
            result: parseInt(result),
            detail: {
                description: description || null,
                dice_rolls: [parseInt(result)],
                modifier: 0,
                formula_parsed: parseFormula(formula)
            },
            created_at: message.created_at
        };
    };

    const handleTyping = (e) => {
        const value = e.target.value;
        setNewMessage(value);
        
        if (value.trim() && !isTyping) {
            startTyping();
            setIsTyping(true);
        } else if (!value.trim() && isTyping) {
            stopTyping();
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    if (loading && messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando mensagens...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white">
                <div className="text-center text-red-600">
                    <p>Erro ao carregar chat: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Área de Mensagens */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <p>Nenhuma mensagem ainda. Seja o primeiro a conversar!</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id} className="flex items-start space-x-3">
                                {/* Avatar */}
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                    {message.sender?.avatar ? (
                                        <img 
                                            src={message.sender.avatar} 
                                            alt={message.sender.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                    )}
                                </div>

                                {/* Conteúdo da Mensagem */}
                                <div className="flex-1 min-w-0">
                                    {/* Cabeçalho da Mensagem */}
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-semibold text-gray-800">
                                            {message.sender?.name || 'Usuário'}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(message.created_at).toLocaleString()}
                                        </span>
                                        {message.edited_at && (
                                            <span className="text-xs text-gray-400">(editado)</span>
                                        )}
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="text-gray-700">
                                        {isDiceRollMessage(message) ? (
                                            <DiceRollMessage 
                                                roll={parseDiceRollFromMessage(message)} 
                                                showDetails={true}
                                            />
                                        ) : (
                                            message.content
                                        )}
                                    </div>

                                    {/* Mídia */}
                                    {message.media_url && (
                                        <div className="mt-2">
                                            <img 
                                                src={message.media_url} 
                                                alt="Mídia da mensagem"
                                                className="max-w-xs rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    
                    {/* Indicador de usuários digitando */}
                    {typingUsers.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500 italic">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span>
                                {typingUsers.map(user => user.name).join(', ')} 
                                {typingUsers.length === 1 ? ' está' : ' estão'} digitando...
                            </span>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input de Mensagem */}
            <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleTyping}
                            onKeyPress={handleKeyPress}
                            placeholder="Converse ou role dados com /r"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            disabled={loading}
                        />
                    </div>
                    
                    {/* Botão de Upload de Arquivo */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-gray-500 hover:text-purple-600 transition-colors duration-200"
                        title="Enviar arquivo"
                        disabled={loading}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>
                    
                    {/* Botão de Rolagem de Dados */}
                    <button
                        type="button"
                        onClick={() => setShowDiceModal(true)}
                        className="p-3 text-gray-500 hover:text-purple-600 transition-colors duration-200"
                        title="Rolar dados"
                        disabled={loading}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                    
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || loading}
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Enviar'
                        )}
                    </button>
                </form>
                
                {/* Input de arquivo oculto */}
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
            </div>

            {/* Modal de Rolagem de Dados */}
            {showDiceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Rolagem de Dados</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fórmula
                                </label>
                                <input
                                    type="text"
                                    value={diceFormula}
                                    onChange={(e) => setDiceFormula(e.target.value)}
                                    placeholder="Ex: 1d20, 2d6+3, 3d4-1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descrição (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={diceDescription}
                                    onChange={(e) => setDiceDescription(e.target.value)}
                                    placeholder="Ex: Ataque com espada"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            
                            {/* Fórmulas Comuns */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fórmulas Comuns
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {getCommonFormulas().slice(0, 6).map((formula) => (
                                        <button
                                            key={formula.formula}
                                            type="button"
                                            onClick={() => setDiceFormula(formula.formula)}
                                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            {formula.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowDiceModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDiceRoll}
                                disabled={diceLoading || !validateFormula(diceFormula)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {diceLoading ? 'Rolando...' : 'Rolar Dados'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Upload de Arquivo */}
            {showFileUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Enviar Arquivo</h3>
                        
                        {selectedFile && (
                            <div className="mb-4">
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowFileUpload(false);
                                    setSelectedFile(null);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleFileUpload}
                                disabled={!selectedFile || loading}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Enviando...' : 'Enviar Arquivo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignChat;
