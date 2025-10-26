// Teste simples sem React
console.log('Simple test loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, testing simple functionality');
    
    const testElement = document.getElementById('debug-app');
    if (testElement) {
        testElement.innerHTML = `
            <div style="padding: 2rem; background-color: #e8f5e8; border: 2px solid #4caf50; border-radius: 8px; margin: 1rem;">
                <h2 style="color: #2e7d32; margin-bottom: 1rem;">✅ Teste JavaScript Simples</h2>
                <p style="color: #2e7d32; margin-bottom: 1rem;">Se você está vendo esta mensagem, o JavaScript está funcionando!</p>
                <p style="color: #666; font-size: 0.9rem;">Timestamp: ${new Date().toLocaleString()}</p>
            </div>
        `;
    }
    
    const homeElement = document.getElementById('home-app');
    if (homeElement) {
        homeElement.innerHTML = `
            <div style="min-height: 100vh; background-color: white; font-family: Arial, sans-serif;">
                <header style="background-color: #f3f4f6; border-bottom: 1px solid #e5e7eb; padding: 1rem 1.5rem;">
                    <div style="max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
                        <button style="background-color: #d1d5db; color: #374151; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 500; border: none; cursor: pointer;">
                            Logo
                        </button>
                        <nav style="display: flex; gap: 2rem;">
                            <a href="/" style="color: #374151; text-decoration: none;">Home</a>
                            <a href="/feed" style="color: #374151; text-decoration: none;">Feed</a>
                            <a href="/campanhas" style="color: #374151; text-decoration: none;">Campanhas</a>
                            <a href="/perfil" style="color: #374151; text-decoration: none;">Perfil</a>
                        </nav>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <a href="/perfil" style="color: #374151; text-decoration: none;">Perfil</a>
                            <div style="width: 2rem; height: 2rem; background-color: #e9d5ff; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                👤
                            </div>
                        </div>
                    </div>
                </header>
                
                <section style="background: linear-gradient(to right, #faf5ff, #fdf2f8); padding: 4rem 1.5rem; text-align: center;">
                    <h1 style="font-size: 3rem; font-weight: bold; color: #1f2937; margin-bottom: 1.5rem;">
                        Salão da Guilda
                    </h1>
                    <p style="font-size: 1.25rem; color: #6b7280; margin-bottom: 3rem; max-width: 768px; margin: 0 auto 3rem auto;">
                        Se reuna com aventureiros para sua jornada!
                    </p>
                    
                    <div style="max-width: 1024px; margin: 0 auto; background-color: #e5e7eb; border: 2px dashed #9ca3af; border-radius: 0.5rem; padding: 4rem; display: flex; align-items: center; justify-content: center;">
                        <div style="text-align: center;">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">🖼️</div>
                            <p style="color: #6b7280; font-size: 1.125rem;">
                                Imagem ou vídeo da aventura
                            </p>
                        </div>
                    </div>
                </section>
                
                <section style="padding: 4rem 1.5rem;">
                    <div style="max-width: 1280px; margin: 0 auto;">
                        <h2 style="font-size: 1.875rem; font-weight: bold; color: #1f2937; margin-bottom: 2rem; text-align: center;">
                            Campanhas em Destaque
                        </h2>
                        
                        <div style="background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; padding: 1.5rem; margin-bottom: 2rem;">
                            <div style="display: flex; align-items: flex-start; gap: 1.5rem;">
                                <div style="width: 6rem; height: 6rem; background: linear-gradient(135deg, #e9d5ff, #fce7f3); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <div style="font-size: 2rem;">🎲</div>
                                </div>
                                
                                <div style="flex: 1; min-width: 0;">
                                    <div style="display: flex; align-items: flex-start; justify-content: space-between;">
                                        <div style="flex: 1;">
                                            <h3 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;">
                                                A Jornada dos Cinco Anéis
                                            </h3>
                                            <p style="color: #6b7280; font-size: 1.125rem; line-height: 1.6; margin-bottom: 1rem;">
                                                Uma aventura épica no mundo de Rokugan, onde honra e tradição se misturam com magia e intriga política.
                                            </p>
                                            
                                            <div style="display: flex; align-items: center; gap: 1.5rem; font-size: 0.875rem; color: #6b7280;">
                                                <span>⭐ 4.8 estrelas</span>
                                                <span>👥 5 jogadores</span>
                                                <span>✅ Ativa</span>
                                            </div>
                                        </div>
                                        
                                        <button style="background-color: #7c3aed; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 500; border: none; cursor: pointer; flex-shrink: 0;">
                                            Entrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <footer style="background-color: #f3f4f6; border-top: 1px solid #e5e7eb; padding: 3rem 1.5rem;">
                    <div style="max-width: 1280px; margin: 0 auto; text-align: center;">
                        <h3 style="font-size: 1.125rem; font-weight: 600; color: #6b7280; margin-bottom: 1rem;">
                            [Footer]
                        </h3>
                        <div style="display: flex; justify-content: center; gap: 2rem; font-size: 0.875rem; color: #6b7280; margin-bottom: 1.5rem;">
                            <a href="#" style="color: #6b7280; text-decoration: none;">Sobre</a>
                            <a href="#" style="color: #6b7280; text-decoration: none;">Contato</a>
                            <a href="#" style="color: #6b7280; text-decoration: none;">Termos</a>
                            <a href="#" style="color: #6b7280; text-decoration: none;">Privacidade</a>
                        </div>
                        <p style="font-size: 0.875rem; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 1.5rem;">
                            © 2024 Salão da Guilda. Todos os direitos reservados.
                        </p>
                    </div>
                </footer>
            </div>
        `;
    }
});


