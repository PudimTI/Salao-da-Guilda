import React from 'react';

const SimpleHomeTest = () => {
    console.log('SimpleHomeTest: Componente carregado');
    
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            padding: '2rem',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{
                    color: '#7c3aed',
                    fontSize: '2.5rem',
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>
                    🎲 Salão da Guilda
                </h1>
                
                <p style={{
                    color: '#666',
                    fontSize: '1.2rem',
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    Se reuna com aventureiros para sua jornada!
                </p>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginTop: '2rem'
                }}>
                    {/* Card de Campanha */}
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        padding: '1.5rem'
                    }}>
                        <h3 style={{ color: '#333', marginBottom: '1rem' }}>
                            A Jornada dos Cinco Anéis
                        </h3>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            Uma aventura épica no mundo de Rokugan, onde honra e tradição se misturam com magia e intriga política.
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                ⭐ 4.8 | 👥 5 jogadores | ✅ Ativa
                            </div>
                            <button style={{
                                backgroundColor: '#7c3aed',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}>
                                Entrar
                            </button>
                        </div>
                    </div>
                    
                    {/* Card de Nova Aventura */}
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        padding: '1.5rem'
                    }}>
                        <h3 style={{ color: '#333', marginBottom: '1rem' }}>
                            Comece novas aventuras
                        </h3>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            Explore campanhas recomendadas ou crie sua própria aventura épica.
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            <button style={{
                                backgroundColor: '#7c3aed',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                flex: 1
                            }}>
                                Recomendações
                            </button>
                            <button style={{
                                backgroundColor: 'transparent',
                                color: '#7c3aed',
                                border: '1px solid #7c3aed',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                flex: 1
                            }}>
                                Criar
                            </button>
                        </div>
                    </div>
                </div>
                
                <div style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    padding: '1rem',
                    backgroundColor: '#e8f5e8',
                    borderRadius: '4px',
                    border: '1px solid #4caf50'
                }}>
                    <p style={{ margin: 0, color: '#2e7d32' }}>
                        ✅ React funcionando corretamente!<br/>
                        ✅ Componentes renderizados<br/>
                        ✅ Timestamp: {new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SimpleHomeTest;










