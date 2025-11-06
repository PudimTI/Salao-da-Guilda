// Funções utilitárias para chamadas de API
const API_BASE_URL = '';

// Função helper global para verificar localStorage
window.debugLocalStorage = function() {
    console.log('🔍 === DEBUG LOCALSTORAGE ===');
    console.log('📦 Todos os itens do localStorage:');
    
    if (localStorage.length === 0) {
        console.log('  ⚠️ localStorage está vazio!');
    } else {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            console.log(`  - ${key}:`, value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : 'null');
        }
    }
    
    const token = localStorage.getItem('auth_token');
    console.log('🎫 Token auth_token específico:', token ? `SIM (${token.substring(0, 50)}...)` : 'NÃO');
    console.log('🎫 Token completo:', token || 'null');
    console.log('🔍 === FIM DEBUG ===');
};

// Função helper para salvar token com log
window.saveAuthToken = function(token) {
    console.log('💾 [saveAuthToken] === INÍCIO ===');
    console.log('💾 [saveAuthToken] Salvando token no localStorage...');
    console.log('💾 [saveAuthToken] Token recebido:', token ? `${token.substring(0, 50)}...` : 'null');
    
    if (token) {
        localStorage.setItem('auth_token', token);
        console.log('✅ [saveAuthToken] Token salvo com sucesso!');
        
        // Verificar imediatamente
        const savedToken = localStorage.getItem('auth_token');
        console.log('✅ [saveAuthToken] Verificando se foi salvo:', savedToken ? 'SIM' : 'NÃO');
        console.log('✅ [saveAuthToken] Token salvo completo:', savedToken ? `${savedToken.substring(0, 50)}...` : 'NÃO');
        
        if (!savedToken) {
            console.error('❌ [saveAuthToken] ERRO: Token não foi persistido no localStorage!');
            console.error('❌ [saveAuthToken] Possíveis causas: localStorage desabilitado ou quota excedida');
        }
    } else {
        console.error('❌ [saveAuthToken] Token é null ou vazio!');
    }
    
    // Verificar novamente
    window.debugLocalStorage();
    console.log('💾 [saveAuthToken] === FIM ===');
};

// Função helper para fazer login e salvar token automaticamente
window.testLogin = async function(email, password) {
    console.log('🔐 [testLogin] Iniciando teste de login...');
    console.log('🔐 [testLogin] Email:', email);
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        console.log('📥 [testLogin] Resposta do servidor:', data);
        
        if (data.success && data.token) {
            console.log('✅ [testLogin] Login bem-sucedido!');
            console.log('🎫 [testLogin] Token recebido:', data.token);
            console.log('🎫 [testLogin] Token preview:', data.token_preview);
            console.log('🎫 [testLogin] Token length:', data.token_length);
            
            // Salvar token
            window.saveAuthToken(data.token);
            
            // Testar se o token funciona
            console.log('🧪 [testLogin] Testando token...');
            const testResponse = await fetch('/api/auth/test', {
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Accept': 'application/json'
                }
            });
            
            const testData = await testResponse.json();
            console.log('🧪 [testLogin] Resultado do teste:', testData);
            
            return {
                success: true,
                token: data.token,
                user: data.user,
                testResult: testData
            };
        } else {
            console.error('❌ [testLogin] Login falhou:', data.message);
            return {
                success: false,
                message: data.message
            };
        }
    } catch (error) {
        console.error('❌ [testLogin] Erro:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Função para fazer requisições GET
export const apiGet = async (url, options = {}) => {
    console.log(`🌐 [apiGet] Iniciando requisição para: ${url}`);
    
    // Debug completo do localStorage
    console.log('📦 [apiGet] Todos os itens do localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(`  - ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
    }
    
    const token = localStorage.getItem('auth_token');
    console.log('🎫 [apiGet] Token auth_token encontrado:', token ? `SIM (${token.substring(0, 30)}...)` : 'NÃO');
    console.log('🎫 [apiGet] Token completo:', token);
    
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    console.log('🛡️ [apiGet] CSRF Meta encontrado:', csrfMeta ? 'SIM' : 'NÃO');
    
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Adicionar CSRF token se disponível
    if (csrfMeta) {
        headers['X-CSRF-TOKEN'] = csrfMeta.getAttribute('content');
        console.log('🛡️ [apiGet] CSRF Token adicionado aos headers');
    }
    
    // Adicionar token de autenticação se disponível
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ [apiGet] Authorization header adicionado:', `Bearer ${token.substring(0, 20)}...`);
    } else {
        console.warn('⚠️ [apiGet] Token não encontrado');
        // Se não há token e a rota requer autenticação, redirecionar
        if (url.includes('/recommendations') || url.includes('/friendships') || url.includes('/notifications')) {
            console.error('❌ [apiGet] Token de autenticação não encontrado. Redirecionando para login...');
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
            throw new Error('Não autenticado');
        }
    }
    
    console.log('📤 [apiGet] Headers finais:', headers);
    
    console.log(`🚀 [apiGet] Enviando requisição para: ${API_BASE_URL}${url}`);
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers,
        ...options
    });

    console.log(`📥 [apiGet] Resposta recebida - Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
        // Se for erro 401, tratar especificamente
        if (response.status === 401) {
            console.error('❌ [apiGet] Erro 401 - Não autenticado');
            console.error('❌ [apiGet] Limpando token do localStorage');
            localStorage.removeItem('auth_token');
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [apiGet] Dados do erro:', errorData);
            const error = new Error(errorData.message || 'Não autenticado');
            error.status = 401;
            throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ [apiGet] Erro ${response.status}:`, errorData);
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    console.log('✅ [apiGet] Dados recebidos com sucesso:', data);
    return data;
};

// Função para fazer requisições POST
export const apiPost = async (url, data = {}, options = {}) => {
    const token = localStorage.getItem('auth_token');
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    
    const headers = {
        'Accept': 'application/json',
        ...options.headers
    };
    
    // Determinar se é FormData ou JSON
    const isFormData = data instanceof FormData;
    
    // Se não for FormData, adicionar Content-Type JSON
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    
    // Adicionar CSRF token se disponível
    if (csrfMeta) {
        headers['X-CSRF-TOKEN'] = csrfMeta.getAttribute('content');
    }
    
    // Adicionar token de autenticação se disponível
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data),
        ...options
    });

    if (!response.ok) {
        // Se for erro 401, tratar especificamente
        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || 'Não autenticado');
            error.status = 401;
            throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    return await response.json();
};

// Função para fazer requisições PUT
export const apiPut = async (url, data = {}, options = {}) => {
    const token = localStorage.getItem('auth_token');
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Adicionar CSRF token se disponível
    if (csrfMeta) {
        headers['X-CSRF-TOKEN'] = csrfMeta.getAttribute('content');
    }
    
    // Adicionar token de autenticação se disponível
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        ...options
    });

    if (!response.ok) {
        // Se for erro 401, tratar especificamente
        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || 'Não autenticado');
            error.status = 401;
            throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    return await response.json();
};

// Função para fazer requisições DELETE
export const apiDelete = async (url, options = {}) => {
    const token = localStorage.getItem('auth_token');
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Adicionar CSRF token se disponível
    if (csrfMeta) {
        headers['X-CSRF-TOKEN'] = csrfMeta.getAttribute('content');
    }
    
    // Adicionar token de autenticação se disponível
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        headers,
        ...options
    });

    if (!response.ok) {
        // Se for erro 401, tratar especificamente
        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || 'Não autenticado');
            error.status = 401;
            throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    return await response.json();
};

// Função para fazer requisições PATCH
export const apiPatch = async (url, data = {}, options = {}) => {
    const token = localStorage.getItem('auth_token');
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Adicionar CSRF token se disponível
    if (csrfMeta) {
        headers['X-CSRF-TOKEN'] = csrfMeta.getAttribute('content');
    }
    
    // Adicionar token de autenticação se disponível
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
        ...options
    });

    if (!response.ok) {
        // Se for erro 401, tratar especificamente
        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || 'Não autenticado');
            error.status = 401;
            throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    return await response.json();
};

// Função para fazer upload de arquivos
export const apiUpload = async (url, formData, options = {}) => {
    const token = localStorage.getItem('auth_token');
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    
    const headers = {
        'Accept': 'application/json',
        ...options.headers
    };
    
    // Adicionar CSRF token se disponível
    if (csrfMeta) {
        headers['X-CSRF-TOKEN'] = csrfMeta.getAttribute('content');
    }
    
    // Adicionar token de autenticação se disponível
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers,
        body: formData,
        ...options
    });

    if (!response.ok) {
        // Se for erro 401, tratar especificamente
        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || 'Não autenticado');
            error.status = 401;
            throw error;
        }
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    return await response.json();
};

// Função para lidar com erros de API
export const handleApiError = (error) => {
    console.error('API Error:', error);
    
    // Verificar status HTTP diretamente ou na mensagem
    const status = error.status || (error.message.match(/\d{3}/) ? parseInt(error.message.match(/\d{3}/)[0]) : null);
    
    if (status === 401 || error.message.includes('401') || error.message.includes('Não autenticado')) {
        // Limpar token e redirecionar para login se não autenticado
        localStorage.removeItem('auth_token');
        // Não mostrar alerta para 401, apenas redirecionar
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
        return;
    }
    
    if (status === 403 || error.message.includes('403')) {
        alert('Você não tem permissão para realizar esta ação.');
        return;
    }
    
    if (status === 404 || error.message.includes('404')) {
        alert('Recurso não encontrado.');
        return;
    }
    
    if (status === 422 || error.message.includes('422')) {
        alert('Dados inválidos. Verifique os campos e tente novamente.');
        return;
    }
    
    if (status === 500 || error.message.includes('500')) {
        alert('Erro interno do servidor. Tente novamente mais tarde.');
        return;
    }
    
    // Erro genérico - não mostrar alerta para erros de autenticação
    if (!error.message.includes('Não autenticado') && !error.message.includes('401')) {
        alert(error.message || 'Ocorreu um erro inesperado. Tente novamente.');
    }
};

// Função para mostrar loading
export const showLoading = (element) => {
    if (element) {
        element.innerHTML = `
            <div class="flex items-center justify-center p-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span class="ml-2 text-gray-600">Carregando...</span>
            </div>
        `;
    }
};

// Função para mostrar erro
export const showError = (element, message = 'Erro ao carregar dados') => {
    if (element) {
        element.innerHTML = `
            <div class="flex items-center justify-center p-4 text-red-600">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>${message}</span>
            </div>
        `;
    }
};

// Função para mostrar estado vazio
export const showEmpty = (element, message = 'Nenhum item encontrado') => {
    if (element) {
        element.innerHTML = `
            <div class="flex flex-col items-center justify-center p-8 text-gray-500">
                <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span>${message}</span>
            </div>
        `;
    }
};