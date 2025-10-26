// Configuração do sistema de chat DM
export const chatConfig = {
    // Configurações do Pusher
    pusher: {
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: true,
        authEndpoint: '/api/broadcasting/auth',
    },
    
    // Configurações da API
    api: {
        baseUrl: '/api',
        endpoints: {
            conversations: '/chat/conversations',
            messages: '/chat/conversations/{id}/messages',
            users: '/users/search',
            friendships: '/friendships'
        }
    },
    
    // Configurações da interface
    ui: {
        messagesPerPage: 50,
        maxMessageLength: 5000,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        typingTimeout: 3000, // 3 segundos
        autoScrollDelay: 100, // 100ms
        searchDebounce: 300, // 300ms
    },
    
    // Tipos de arquivo permitidos
    allowedFileTypes: [
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/avi',
        'video/mov',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    
    // Configurações de notificação
    notifications: {
        enableSound: true,
        enableDesktop: true,
        soundFile: '/sounds/notification.mp3'
    }
};

// Utilitários para o chat
export const chatUtils = {
    // Formatar timestamp relativo
    formatRelativeTime: (timestamp) => {
        if (!timestamp) return '';
        
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Agora';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d`;
        
        return messageTime.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
        });
    },
    
    // Truncar texto
    truncateText: (text, maxLength = 50) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    // Formatar tamanho de arquivo
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Validar tipo de arquivo
    isValidFileType: (file) => {
        return chatConfig.allowedFileTypes.includes(file.type);
    },
    
    // Validar tamanho de arquivo
    isValidFileSize: (file) => {
        return file.size <= chatConfig.ui.maxFileSize;
    },
    
    // Obter cor do avatar baseada no nome
    getAvatarColor: (name) => {
        const colors = [
            'bg-red-500',
            'bg-blue-500', 
            'bg-green-500',
            'bg-yellow-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-teal-500'
        ];
        
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    }
};

// Hook para gerenciar notificações
export const useNotifications = () => {
    const requestPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    };
    
    const showNotification = (title, options = {}) => {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options
            });
        }
    };
    
    const playSound = () => {
        if (chatConfig.notifications.enableSound) {
            const audio = new Audio(chatConfig.notifications.soundFile);
            audio.play().catch(console.error);
        }
    };
    
    return {
        requestPermission,
        showNotification,
        playSound
    };
};

export default chatConfig;
