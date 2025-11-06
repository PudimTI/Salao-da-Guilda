import axios from 'axios';

class FriendshipService {
    constructor() {
        this.baseURL = '/api';
        this.setupAxios();
    }

    setupAxios() {
        // Configurar token de autenticação
        const token = localStorage.getItem('auth_token') || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        }

        // Configurar interceptors
        axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    // Redirecionar para login se não autenticado
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    setAuthToken(token) {
        localStorage.setItem('auth_token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // ===== AMIZADES =====
    
    async getFriends(params = {}) {
        try {
            const response = await axios.get(`${this.baseURL}/friendships/`, { params });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getFriendRequests(type = 'received') {
        try {
            const endpoint = type === 'received' ? 'requests/received' : 'requests/sent';
            const response = await axios.get(`${this.baseURL}/friendships/${endpoint}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async sendFriendRequest(userId, message = '') {
        try {
            const response = await axios.post(`${this.baseURL}/friendships/send-request`, {
                user_id: userId,
                message: message
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async respondToFriendRequest(requestId, action) {
        try {
            const response = await axios.post(`${this.baseURL}/friendships/respond-request`, {
                request_id: requestId,
                action: action // 'accept' ou 'reject'
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async cancelFriendRequest(requestId) {
        try {
            const response = await axios.post(`${this.baseURL}/friendships/cancel-request`, {
                request_id: requestId
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async removeFriend(friendId) {
        try {
            // A API espera friend_id (ID do amigo), não friendship_id
            const response = await axios.post(`${this.baseURL}/friendships/remove`, {
                friend_id: friendId
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async blockUser(userId) {
        try {
            const response = await axios.post(`${this.baseURL}/friendships/block`, {
                user_id: userId
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async unblockUser(userId) {
        try {
            const response = await axios.post(`${this.baseURL}/friendships/unblock`, {
                user_id: userId
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getRelationshipStatus(userId) {
        try {
            const response = await axios.get(`${this.baseURL}/friendships/relationship-status`, {
                params: { user_id: userId }
            });
            // A API retorna { success, data, message }
            const result = response.data.success ? response.data.data : response.data;
            return result;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ===== BUSCA DE USUÁRIOS =====
    
    async searchUsers(query, params = {}) {
        try {
            const response = await axios.get(`${this.baseURL}/users/search`, {
                params: { query: query, ...params }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getUserProfile(userId) {
        try {
            const response = await axios.get(`${this.baseURL}/users/${userId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ===== NOTIFICAÇÕES =====
    
    async getNotifications(params = {}) {
        try {
            const response = await axios.get(`${this.baseURL}/notifications`, { params });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async markNotificationAsRead(notificationIds) {
        try {
            // A API espera notification_ids como array
            const ids = Array.isArray(notificationIds) ? notificationIds : (notificationIds ? [notificationIds] : []);
            const response = await axios.post(`${this.baseURL}/notifications/mark-read`, {
                notification_ids: ids.length > 0 ? ids : undefined
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async markAllNotificationsAsRead() {
        try {
            const response = await axios.post(`${this.baseURL}/notifications/mark-read`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getUnreadCount() {
        try {
            const response = await axios.get(`${this.baseURL}/notifications/unread-count`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ===== UTILITÁRIOS =====
    
    handleError(error) {
        const errorData = {
            message: 'Erro desconhecido',
            status: error.response?.status || 500,
            data: error.response?.data
        };

        if (error.response?.data?.message) {
            errorData.message = error.response.data.message;
        } else if (error.message) {
            errorData.message = error.message;
        }

        // Log para debug
        if (localStorage.getItem('debug_friendships') === 'true') {
            console.error('FriendshipService Error:', errorData);
        }

        return errorData;
    }
}

// Criar instância singleton
const friendshipService = new FriendshipService();

export default friendshipService;