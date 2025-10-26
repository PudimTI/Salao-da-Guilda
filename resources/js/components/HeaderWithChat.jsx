import React, { useState, useEffect, useRef } from 'react';
import FloatingChat from './FloatingChat';

// Componente de header com chat integrado
const HeaderWithChat = ({ children, showChatButton = true }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isCampaignsDropdownOpen, setIsCampaignsDropdownOpen] = useState(false);
    const [isSocialDropdownOpen, setIsSocialDropdownOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const campaignsDropdownRef = useRef(null);
    const socialDropdownRef = useRef(null);

    // Verificar autenticação e carregar dados do usuário
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');
        
        setIsAuthenticated(!!(token && userData));
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (err) {
                console.error('Erro ao parsear dados do usuário:', err);
            }
        }
    }, []);

    // Fechar os dropdowns quando clicar fora deles
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (campaignsDropdownRef.current && !campaignsDropdownRef.current.contains(event.target)) {
                setIsCampaignsDropdownOpen(false);
            }
            if (socialDropdownRef.current && !socialDropdownRef.current.contains(event.target)) {
                setIsSocialDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <>
            {/* Header principal */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <a href="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">SG</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">Salão da Guilda</span>
                            </a>
                        </div>

                        {/* Navegação */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Home
                            </a>
                            <a href="/feed" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Feed
                            </a>
                            
                            {/* Dropdown Campanhas */}
                            <div className="relative" ref={campaignsDropdownRef}>
                                <button
                                    onClick={() => setIsCampaignsDropdownOpen(!isCampaignsDropdownOpen)}
                                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Campanhas
                                    <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isCampaignsDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {isCampaignsDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <a href="/campaigns" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                            Minhas Campanhas
                                        </a>
                                        <a href="/encontrar" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                            Encontrar
                                        </a>
                                        <a href="/characters" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                            Personagens
                                        </a>
                                    </div>
                                )}
                            </div>
                            
                            {/* Dropdown Social */}
                            <div className="relative" ref={socialDropdownRef}>
                                <button
                                    onClick={() => setIsSocialDropdownOpen(!isSocialDropdownOpen)}
                                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Social
                                    <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isSocialDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {isSocialDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <a href="/amigos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                            Amizades
                                        </a>
                                        <a href="/convites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                            Convites de campanhas
                                        </a>
                                        <a href="/solicitacoes-amizade" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                            Solicitações de amizades
                                        </a>
                                    </div>
                                )}
                            </div>
                        </nav>

                        {/* Ações do usuário */}
                        <div className="flex items-center space-x-4">
                            {/* Botão de chat */}
                            {showChatButton && isAuthenticated && (
                                <button
                                    onClick={toggleChat}
                                    className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="Abrir Chat"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </button>
                            )}

                            {/* Menu do usuário */}
                            {isAuthenticated ? (
                                <div className="flex items-center space-x-3">
                                    {/* Avatar */}
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    
                                    {/* Dropdown do usuário */}
                                    <div className="relative">
                                        <button className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors">
                                            <span className="text-sm font-medium">{user?.name || 'Usuário'}</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        
                                        {/* Menu dropdown */}
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                                            <a href="/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Perfil
                                            </a>
                                            <a href="/amigos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Amigos
                                            </a>
                                            <a href="/personagem" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Personagens
                                            </a>
                                            <a href="/notificacoes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Notificações
                                            </a>
                                            <hr className="my-1" />
                                            <a href="/chat" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                Chat DM
                                            </a>
                                            <hr className="my-1" />
                                            <button 
                                                onClick={() => {
                                                    localStorage.removeItem('auth_token');
                                                    localStorage.removeItem('user');
                                                    window.location.href = '/login';
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Sair
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <a href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                                        Entrar
                                    </a>
                                    <a href="/register" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                        Cadastrar
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo principal */}
            {children}

            {/* Chat flutuante */}
            {isAuthenticated && (
                <FloatingChat
                    isOpen={isChatOpen}
                    onToggle={toggleChat}
                />
            )}
        </>
    );
};

export default HeaderWithChat;
