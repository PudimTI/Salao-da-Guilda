// Serviço para comunicação com a API do perfil
class ProfileService {
    constructor() {
        this.baseUrl = '/api/profile';
    }

    // Obter dados do perfil
    async getProfile(userId = null) {
        try {
            const url = userId ? `${this.baseUrl}/${userId}` : this.baseUrl;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao obter perfil:', error);
            throw error;
        }
    }

    // Atualizar perfil
    async updateProfile(profileData) {
        try {
            console.log('🔄 ProfileService: Iniciando atualização de perfil', profileData);
            
            const formData = new FormData();
            
            // Adicionar campos de texto (sempre enviar, mesmo se vazios)
            formData.append('display_name', profileData.display_name || '');
            console.log('📝 ProfileService: Adicionando display_name:', profileData.display_name || '');
            
            formData.append('bio', profileData.bio || '');
            console.log('📝 ProfileService: Adicionando bio:', profileData.bio || '');
            
            // Adicionar arquivo de avatar se fornecido
            if (profileData.avatar) {
                formData.append('avatar', profileData.avatar);
                console.log('🖼️ ProfileService: Adicionando avatar:', {
                    name: profileData.avatar.name,
                    size: profileData.avatar.size,
                    type: profileData.avatar.type
                });
            }

            // Obter CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('🔐 ProfileService: CSRF Token obtido:', csrfToken ? 'Presente' : 'Ausente');
            console.log('🔐 ProfileService: CSRF Token valor:', csrfToken);
            
            if (csrfToken) {
                formData.append('_token', csrfToken);
            } else {
                console.warn('⚠️ ProfileService: CSRF Token não encontrado!');
            }

            console.log('📤 ProfileService: Enviando requisição para:', this.baseUrl);
            console.log('📤 ProfileService: Headers:', {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': csrfToken ? 'Presente' : 'Ausente'
            });

            const response = await fetch(this.baseUrl, {
                method: 'PUT',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'same-origin'
            });

            console.log('📥 ProfileService: Resposta recebida:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ ProfileService: Erro na resposta:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ ProfileService: Perfil atualizado com sucesso:', result);
            return result;
        } catch (error) {
            console.error('❌ ProfileService: Erro ao atualizar perfil:', {
                message: error.message,
                stack: error.stack,
                profileData: profileData
            });
            throw error;
        }
    }

    // Obter personagens do usuário
    async getCharacters(userId = null) {
        try {
            const url = userId ? `${this.baseUrl}/characters/${userId}` : `${this.baseUrl}/characters`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao obter personagens:', error);
            throw error;
        }
    }

    // Obter posts do usuário
    async getPosts(userId = null, page = 1) {
        try {
            const url = userId ? `${this.baseUrl}/posts/${userId}?page=${page}` : `${this.baseUrl}/posts?page=${page}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao obter posts:', error);
            throw error;
        }
    }

    // Obter campanhas do usuário
    async getCampaigns(userId = null) {
        try {
            const url = userId ? `${this.baseUrl}/campaigns/${userId}` : `${this.baseUrl}/campaigns`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao obter campanhas:', error);
            throw error;
        }
    }

    // Atualizar preferências
    async updatePreferences(preferences) {
        try {
            // Obter CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch(`${this.baseUrl}/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    ...preferences,
                    _token: csrfToken
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar preferências:', error);
            throw error;
        }
    }

    // Atualizar filtros
    async updateFilters(filters) {
        try {
            // Obter CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch(`${this.baseUrl}/filters`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    ...filters,
                    _token: csrfToken
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar filtros:', error);
            throw error;
        }
    }
}

// Instância global do serviço
window.profileService = new ProfileService();
