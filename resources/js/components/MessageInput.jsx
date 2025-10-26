import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ onSendMessage, disabled = false }) => {
    const [message, setMessage] = useState('');
    const [isComposing, setIsComposing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-resize do textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    // Limpar preview quando arquivo for removido
    useEffect(() => {
        if (selectedFile && previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
    }, [selectedFile, previewUrl]);

    // Lidar com mudança no input
    const handleInputChange = (e) => {
        const value = e.target.value;
        setMessage(value);
        
        // Indicar que está digitando
        if (value.length > 0 && !isComposing) {
            setIsComposing(true);
        } else if (value.length === 0 && isComposing) {
            setIsComposing(false);
        }
    };

    // Lidar com envio da mensagem
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!message.trim() && !selectedFile) return;
        if (disabled) return;

        try {
            await onSendMessage(message.trim(), selectedFile);
            setMessage('');
            setSelectedFile(null);
            setPreviewUrl(null);
            setIsComposing(false);
            
            // Resetar altura do textarea
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        }
    };

    // Lidar com teclas especiais
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Lidar com seleção de arquivo
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/avi', 'video/mov',
            'application/pdf', 'text/plain',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('Tipo de arquivo não suportado');
            return;
        }

        // Validar tamanho (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Arquivo muito grande. Máximo 10MB');
            return;
        }

        setSelectedFile(file);

        // Criar preview para imagens
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    // Remover arquivo selecionado
    const removeFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Formatar tamanho do arquivo
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-3">
            {/* Preview do arquivo */}
            {previewUrl && (
                <div className="relative bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={removeFile}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Input de mensagem */}
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
                {/* Botão de anexo */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>

                {/* Input de texto */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite sua mensagem..."
                        disabled={disabled}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        rows={1}
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                    
                    {/* Contador de caracteres */}
                    {message.length > 0 && (
                        <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                            {message.length}/5000
                        </div>
                    )}
                </div>

                {/* Botão de envio */}
                <button
                    type="submit"
                    disabled={disabled || (!message.trim() && !selectedFile)}
                    className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>

            {/* Input de arquivo oculto */}
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept="image/*,video/*,.pdf,.txt,.doc,.docx"
                className="hidden"
            />

            {/* Dicas de uso */}
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                    <span>Pressione Enter para enviar</span>
                    <span>Shift + Enter para nova linha</span>
                </div>
                <div>
                    Máximo 10MB por arquivo
                </div>
            </div>
        </div>
    );
};

export default MessageInput;
