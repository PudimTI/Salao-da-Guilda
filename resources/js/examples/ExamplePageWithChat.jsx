import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import FloatingChat from '../components/FloatingChat';

// Exemplo de como integrar chat em qualquer página
const ExamplePageWithChat = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <AppLayout showChat={true}>
            <div className="min-h-screen bg-gray-50">
                {/* Seu conteúdo da página */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Minha Página com Chat
                    </h1>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <p className="text-gray-600 mb-4">
                            Esta é uma página de exemplo que mostra como integrar o chat DM.
                        </p>
                        
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Funcionalidades Disponíveis:
                            </h2>
                            
                            <ul className="list-disc list-inside space-y-2 text-gray-600">
                                <li>Chat flutuante no canto inferior direito</li>
                                <li>Botão no header para abrir chat</li>
                                <li>Persistência do estado entre páginas</li>
                                <li>Contador de mensagens não lidas</li>
                                <li>Busca de usuários para novas conversas</li>
                                <li>Interface responsiva</li>
                            </ul>
                        </div>
                        
                        <div className="mt-6">
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Abrir Chat Manualmente
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat flutuante adicional (opcional) */}
            <FloatingChat
                isOpen={isChatOpen}
                onToggle={() => setIsChatOpen(!isChatOpen)}
            />
        </AppLayout>
    );
};

export default ExamplePageWithChat;
