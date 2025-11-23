import React, { useState, useRef, useEffect } from 'react';
import NotificationBell from './NotificationBell';

const Header = ({ user: propUser }) => {
    const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
    const [isCampaignsDropdownOpen, setIsCampaignsDropdownOpen] = useState(false);
    const [isSocialDropdownOpen, setIsSocialDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileCampaignsOpen, setIsMobileCampaignsOpen] = useState(false);
    const [isMobileSocialOpen, setIsMobileSocialOpen] = useState(false);
    const [user, setUser] = useState(propUser);
    const [loading, setLoading] = useState(false);
    const profileCardRef = useRef(null);
    const campaignsDropdownRef = useRef(null);
    const socialDropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // Carregar dados do usuário se não foram passados como props
    useEffect(() => {
        // Aguardar um pouco para garantir que o localStorage foi carregado
        const checkAndLoad = async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (!user) {
                loadUserData();
            }
        };
        
        checkAndLoad();
    }, []);

    // Fechar os dropdowns quando clicar fora deles
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileCardRef.current && !profileCardRef.current.contains(event.target)) {
                setIsProfileCardOpen(false);
            }
            if (campaignsDropdownRef.current && !campaignsDropdownRef.current.contains(event.target)) {
                setIsCampaignsDropdownOpen(false);
            }
            if (socialDropdownRef.current && !socialDropdownRef.current.contains(event.target)) {
                setIsSocialDropdownOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                // Verificar se o clique foi no botão do menu (para permitir toggle)
                const menuButton = event.target.closest('[data-mobile-menu-button]');
                if (!menuButton) {
                    setIsMobileMenuOpen(false);
                    setIsMobileCampaignsOpen(false);
                    setIsMobileSocialOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fechar menu mobile quando navegar
    const handleMobileNavClick = () => {
        setIsMobileMenuOpen(false);
        setIsMobileCampaignsOpen(false);
        setIsMobileSocialOpen(false);
    };

    const loadUserData = async () => {
        try {
            setLoading(true);
            
            // Verificar token primeiro
            const token = localStorage.getItem('auth_token');
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : null;
            
            console.log('👤 [Header] Carregando dados do usuário...');
            console.log('🎫 [Header] Token encontrado:', token ? 'SIM' : 'NÃO');
            console.log('🔍 [Header] Token preview:', token ? `${token.substring(0, 30)}...` : 'N/A');
            
            // Se não há token, verificar se estamos em uma página pública
            if (!token) {
                const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
                const currentPath = window.location.pathname;
                
                // Se não estiver em página pública, redirecionar
                if (!publicPaths.some(path => currentPath.startsWith(path))) {
                    console.warn('⚠️ [Header] Sem token em página protegida. Redirecionando para /login');
                    try {
                        const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
                        if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
                        await fetch('/logout', { method: 'POST', headers, credentials: 'include' });
                    } catch (e) {
                        console.warn('⚠️ [Header] Falha ao chamar /logout:', e);
                    }
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return;
                } else {
                    console.log('ℹ️ [Header] Sem token mas em página pública. Continuando sem autenticação.');
                    setLoading(false);
                    return;
                }
            }
            
            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            };
            
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }
            
            console.log('📤 [Header] Fazendo requisição para /api/profile...');
            const response = await fetch('/api/profile', {
                headers,
                credentials: 'include',
            });
            
            console.log('📥 [Header] Resposta:', response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ [Header] Dados do usuário carregados:', data.user);
                setUser(data.user);
                
                // Salvar dados atualizados no localStorage
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
            } else if (response.status === 401) {
                console.error('❌ [Header] Erro 401 - Token inválido ou expirado. Efetuando logout e redirecionando');
                try {
                    const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
                    if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
                    await fetch('/logout', { method: 'POST', headers, credentials: 'include' });
                } catch (e) {
                    console.warn('⚠️ [Header] Falha ao chamar /logout após 401:', e);
                }
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else {
                console.error('❌ [Header] Erro ao carregar perfil:', response.status);
            }
        } catch (error) {
            console.error('❌ [Header] Erro ao carregar dados do usuário:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : null;
            const token = localStorage.getItem('auth_token');

            const headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
            if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
            if (token) headers['Authorization'] = `Bearer ${token}`;

            await fetch('/logout', {
                method: 'POST',
                headers,
                credentials: 'include',
            });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    };

    return (
        <header className="bg-gray-100 border-b border-gray-200 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    <a href="/" className="flex items-center">
                        {/* Logo para desktop */}
                        <img 
                            src="/src/Logo header.png" 
                            alt="Salão da Guilda" 
                            className="hidden md:block h-10 w-auto hover:opacity-80 transition-opacity duration-200"
                        />
                        {/* Logo para mobile */}
                        <img 
                            src="/src/Logo.png" 
                            alt="Salão da Guilda" 
                            className="block md:hidden h-8 w-auto hover:opacity-80 transition-opacity duration-200"
                        />
                    </a>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                    <a href="/" className="text-gray-800 hover:text-purple-600 font-medium transition-colors duration-200">
                        Home
                    </a>
                    <a href="/feed" className="text-gray-800 hover:text-purple-600 font-medium transition-colors duration-200">
                        Feed
                    </a>
                    
                    {/* Dropdown Campanhas */}
                    <div className="relative" ref={campaignsDropdownRef}>
                        <button
                            onClick={() => setIsCampaignsDropdownOpen(!isCampaignsDropdownOpen)}
                            className="flex items-center text-gray-800 hover:text-purple-600 font-medium transition-colors duration-200"
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
                            className="flex items-center text-gray-800 hover:text-purple-600 font-medium transition-colors duration-200"
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
                                <a href="/solicitacoes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                                    Solicitações de amizades
                                </a>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Profile - Desktop only */}
                <div className="hidden md:flex items-center space-x-4 relative" ref={profileCardRef}>
                    <a href="/perfil" className="text-gray-800 hover:text-purple-600 font-medium transition-colors duration-200">
                        Perfil
                    </a>
                    
                    {/* Sistema de Notificações */}
                    <NotificationBell />
                    
                    <button 
                        onClick={() => setIsProfileCardOpen(!isProfileCardOpen)}
                        className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </button>

                    {/* Profile Card */}
                    {isProfileCardOpen && (
                        <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <div className="flex items-center space-x-3">
                                    {user?.avatar_url ? (
                                        <img 
                                            src={user.avatar_url} 
                                            alt="Avatar" 
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                            </svg>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {user?.display_name || user?.name || 'Usuário'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {user?.email || 'usuario@exemplo.com'}
                                        </p>
                                        {user?.handle && (
                                            <p className="text-xs text-purple-600">@{user.handle}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="py-2">
                                <a 
                                    href="/perfil" 
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Meu Perfil
                                </a>
                                
                                <a 
                                    href="/configuracoes" 
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Configurações
                                </a>
                                
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                                >
                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sair
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile menu button */}
                <button 
                    data-mobile-menu-button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Menu mobile"
                >
                    {isMobileMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <>
                    {/* Overlay */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>
                    
                    {/* Menu Drawer */}
                    <div 
                        ref={mobileMenuRef}
                        className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header do menu mobile */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-100 transition-colors duration-200"
                                    aria-label="Fechar menu"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Conteúdo do menu */}
                            <nav className="flex-1 overflow-y-auto py-4">
                                {/* Home */}
                                <a 
                                    href="/" 
                                    onClick={handleMobileNavClick}
                                    className="flex items-center px-4 py-3 text-gray-800 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Home
                                </a>

                                {/* Feed */}
                                <a 
                                    href="/feed" 
                                    onClick={handleMobileNavClick}
                                    className="flex items-center px-4 py-3 text-gray-800 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    Feed
                                </a>

                                {/* Campanhas - Accordion */}
                                <div>
                                    <button
                                        onClick={() => setIsMobileCampaignsOpen(!isMobileCampaignsOpen)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                                    >
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            Campanhas
                                        </div>
                                        <svg 
                                            className={`w-4 h-4 transition-transform duration-200 ${isMobileCampaignsOpen ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {isMobileCampaignsOpen && (
                                        <div className="bg-gray-50">
                                            <a 
                                                href="/campaigns" 
                                                onClick={handleMobileNavClick}
                                                className="flex items-center px-4 py-2 pl-12 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 text-sm"
                                            >
                                                Minhas Campanhas
                                            </a>
                                            <a 
                                                href="/encontrar" 
                                                onClick={handleMobileNavClick}
                                                className="flex items-center px-4 py-2 pl-12 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 text-sm"
                                            >
                                                Encontrar
                                            </a>
                                            <a 
                                                href="/characters" 
                                                onClick={handleMobileNavClick}
                                                className="flex items-center px-4 py-2 pl-12 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 text-sm"
                                            >
                                                Personagens
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Social - Accordion */}
                                <div>
                                    <button
                                        onClick={() => setIsMobileSocialOpen(!isMobileSocialOpen)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                                    >
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Social
                                        </div>
                                        <svg 
                                            className={`w-4 h-4 transition-transform duration-200 ${isMobileSocialOpen ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {isMobileSocialOpen && (
                                        <div className="bg-gray-50">
                                            <a 
                                                href="/amigos" 
                                                onClick={handleMobileNavClick}
                                                className="flex items-center px-4 py-2 pl-12 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 text-sm"
                                            >
                                                Amizades
                                            </a>
                                            <a 
                                                href="/convites" 
                                                onClick={handleMobileNavClick}
                                                className="flex items-center px-4 py-2 pl-12 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 text-sm"
                                            >
                                                Convites de campanhas
                                            </a>
                                            <a 
                                                href="/solicitacoes" 
                                                onClick={handleMobileNavClick}
                                                className="flex items-center px-4 py-2 pl-12 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 text-sm"
                                            >
                                                Solicitações de amizades
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Perfil */}
                                <a 
                                    href="/perfil" 
                                    onClick={handleMobileNavClick}
                                    className="flex items-center px-4 py-3 text-gray-800 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 border-t border-gray-200 mt-4"
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Perfil
                                </a>

                                {/* Configurações */}
                                <a 
                                    href="/configuracoes" 
                                    onClick={handleMobileNavClick}
                                    className="flex items-center px-4 py-3 text-gray-800 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Configurações
                                </a>

                                {/* Logout */}
                                <button 
                                    onClick={() => {
                                        handleMobileNavClick();
                                        handleLogout();
                                    }}
                                    className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 border-t border-gray-200 mt-4"
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sair
                                </button>
                            </nav>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
};

export default Header;

