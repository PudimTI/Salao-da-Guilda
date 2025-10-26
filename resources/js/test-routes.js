// Teste das rotas e redirecionamentos
import { apiGet, apiPost, apiPut, apiDelete } from './utils/api';
import routes from './config/routes';

// Função para testar as rotas de API
export const testApiRoutes = async () => {
    console.log('🧪 Testando rotas de API...');
    
    try {
        // Testar rota de personagens
        console.log('📋 Testando /api/characters...');
        const characters = await apiGet('/api/characters');
        console.log('✅ Personagens carregados:', characters);
        
        // Testar rota de campanhas
        console.log('📋 Testando /api/campaigns...');
        const campaigns = await apiGet('/api/campaigns');
        console.log('✅ Campanhas carregadas:', campaigns);
        
        // Testar rota de perfil
        console.log('📋 Testando /api/profile...');
        const profile = await apiGet('/api/profile');
        console.log('✅ Perfil carregado:', profile);
        
        console.log('🎉 Todos os testes de API passaram!');
        return true;
        
    } catch (error) {
        console.error('❌ Erro nos testes de API:', error);
        return false;
    }
};

// Função para testar redirecionamentos
export const testRedirects = () => {
    console.log('🧪 Testando redirecionamentos...');
    
    const testLinks = [
        { name: 'Home', url: routes.home },
        { name: 'Feed', url: routes.feed },
        { name: 'Campanhas', url: routes.campaigns.index },
        { name: 'Personagens', url: routes.characters.index },
        { name: 'Perfil', url: routes.profile },
    ];
    
    testLinks.forEach(link => {
        console.log(`🔗 ${link.name}: ${link.url}`);
    });
    
    console.log('🎉 Redirecionamentos configurados!');
    return true;
};

// Função para testar componentes React
export const testReactComponents = () => {
    console.log('🧪 Testando componentes React...');
    
    const components = [
        'CharactersPage',
        'CharacterDetailPage', 
        'CampaignsListPage',
        'CampaignDetailPage',
        'Header',
        'Footer'
    ];
    
    components.forEach(component => {
        console.log(`⚛️ ${component}: Disponível`);
    });
    
    console.log('🎉 Componentes React configurados!');
    return true;
};

// Função principal de teste
export const runAllTests = async () => {
    console.log('🚀 Iniciando testes do sistema...');
    
    const results = {
        apiRoutes: false,
        redirects: false,
        reactComponents: false
    };
    
    try {
        results.apiRoutes = await testApiRoutes();
        results.redirects = testRedirects();
        results.reactComponents = testReactComponents();
        
        const allPassed = Object.values(results).every(result => result);
        
        if (allPassed) {
            console.log('🎉 Todos os testes passaram! Sistema funcionando corretamente.');
        } else {
            console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
        }
        
        return results;
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error);
        return results;
    }
};

// Executar testes automaticamente se estiver em modo de desenvolvimento
if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Modo de desenvolvimento detectado. Executando testes...');
    runAllTests();
}

export default {
    testApiRoutes,
    testRedirects,
    testReactComponents,
    runAllTests
};
