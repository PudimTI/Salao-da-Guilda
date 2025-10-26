import React, { useState, useRef, useEffect } from 'react';
import NotificationBell from './NotificationBell';

const Header = ({ user: propUser }) => {
    const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
    const [isCampaignsDropdownOpen, setIsCampaignsDropdownOpen] = useState(false);
    const [isSocialDropdownOpen, setIsSocialDropdownOpen] = useState(false);
    const [user, setUser] = useState(propUser);
    const [loading, setLoading] = useState(false);
    const profileCardRef = useRef(null);
    const campaignsDropdownRef = useRef(null);
    const socialDropdownRef = useRef(null);

    // Carregar dados do usuário se não foram passados como props
    useEffect(() => {
        if (!user) {
            loadUserData();
        }
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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/profile', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // Implementar logout aqui
        // Por exemplo, fazer uma requisição para /logout ou limpar localStorage
        fetch('/logout', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'Content-Type': 'application/json',
            },
        })
        .then(() => {
            window.location.href = '/login';
        })
        .catch(() => {
            // Fallback: redirecionar mesmo se a requisição falhar
            window.location.href = '/login';
        });
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

                {/* Profile */}
                <div className="flex items-center space-x-4 relative" ref={profileCardRef}>
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
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
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
                <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-100">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;

