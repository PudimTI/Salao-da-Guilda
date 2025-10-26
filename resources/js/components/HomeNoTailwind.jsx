import React from 'react';

const HomeNoTailwind = () => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
            {/* Header */}
            <header style={{
                backgroundColor: '#f3f4f6',
                borderBottom: '1px solid #e5e7eb',
                padding: '1rem 1.5rem'
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <button style={{
                        backgroundColor: '#d1d5db',
                        color: '#374151',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer'
                    }}>
                        Logo
                    </button>
                    <nav style={{ display: 'flex', gap: '2rem' }}>
                        <a href="#" style={{ color: '#374151', textDecoration: 'none' }}>Home</a>
                        <a href="#" style={{ color: '#374151', textDecoration: 'none' }}>Campanhas</a>
                        <a href="#" style={{ color: '#374151', textDecoration: 'none' }}>Encontrar</a>
                    </nav>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <a href="#" style={{ color: '#374151', textDecoration: 'none' }}>Perfil</a>
                        <div style={{
                            width: '2rem',
                            height: '2rem',
                            backgroundColor: '#e9d5ff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            👤
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(to right, #faf5ff, #fdf2f8)',
                padding: '4rem 1.5rem',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '1.5rem'
                }}>
                    Salão da Guilda
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    color: '#6b7280',
                    marginBottom: '3rem',
                    maxWidth: '768px',
                    margin: '0 auto 3rem auto'
                }}>
                    Se reuna com aventureiros para sua jornada!
                </p>
                
                {/* Hero Image Placeholder */}
                <div style={{
                    maxWidth: '1024px',
                    margin: '0 auto',
                    backgroundColor: '#e5e7eb',
                    border: '2px dashed #9ca3af',
                    borderRadius: '0.5rem',
                    padding: '4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🖼️</div>
                        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                            Imagem ou vídeo da aventura
                        </p>
                    </div>
                </div>
            </section>

            {/* Campaigns Section */}
            <section style={{ padding: '4rem 1.5rem' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '1.875rem',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }}>
                        Campanhas em Destaque
                    </h2>
                    
                    {/* Campaign Card */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb',
                        padding: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                            {/* Campaign Image */}
                            <div style={{
                                width: '6rem',
                                height: '6rem',
                                background: 'linear-gradient(135deg, #e9d5ff, #fce7f3)',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <div style={{ fontSize: '2rem' }}>🎲</div>
                            </div>

                            {/* Campaign Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            color: '#1f2937',
                                            marginBottom: '0.5rem'
                                        }}>
                                            A Jornada dos Cinco Anéis
                                        </h3>
                                        <p style={{
                                            color: '#6b7280',
                                            fontSize: '1.125rem',
                                            lineHeight: '1.6',
                                            marginBottom: '1rem'
                                        }}>
                                            Uma aventura épica no mundo de Rokugan, onde honra e tradição se misturam com magia e intriga política.
                                        </p>
                                        
                                        {/* Campaign Stats */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.5rem',
                                            fontSize: '0.875rem',
                                            color: '#6b7280'
                                        }}>
                                            <span>⭐ 4.8 estrelas</span>
                                            <span>👥 5 jogadores</span>
                                            <span>✅ Ativa</span>
                                        </div>
                                    </div>

                                    {/* Join Button */}
                                    <button style={{
                                        backgroundColor: '#7c3aed',
                                        color: 'white',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.5rem',
                                        fontWeight: '500',
                                        border: 'none',
                                        cursor: 'pointer',
                                        flexShrink: 0
                                    }}>
                                        Entrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                backgroundColor: '#f3f4f6',
                borderTop: '1px solid #e5e7eb',
                padding: '3rem 1.5rem'
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#6b7280',
                        marginBottom: '1rem'
                    }}>
                        [Footer]
                    </h3>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginBottom: '1.5rem'
                    }}>
                        <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Sobre</a>
                        <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Contato</a>
                        <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Termos</a>
                        <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Privacidade</a>
                    </div>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#9ca3af',
                        borderTop: '1px solid #e5e7eb',
                        paddingTop: '1.5rem'
                    }}>
                        © 2024 Salão da Guilda. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomeNoTailwind;










