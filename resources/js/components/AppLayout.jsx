import React, { useState, useEffect } from 'react';
import FloatingChat from './FloatingChat';

// Layout principal que inclui o chat flutuante
const AppLayout = ({ children, showChat = true }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar se o usuário está autenticado
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('user');
        setIsAuthenticated(!!(token && user));
    }, []);

    // Persistir estado do chat no localStorage
    useEffect(() => {
        const savedState = localStorage.getItem('chat_open');
        if (savedState !== null) {
            setIsChatOpen(JSON.parse(savedState));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('chat_open', JSON.stringify(isChatOpen));
    }, [isChatOpen]);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Conteúdo principal */}
            {children}
            
            {/* Chat flutuante - apenas para usuários autenticados */}
            {showChat && isAuthenticated && (
                <FloatingChat
                    isOpen={isChatOpen}
                    onToggle={toggleChat}
                />
            )}
        </div>
    );
};

export default AppLayout;
