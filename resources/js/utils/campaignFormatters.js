/**
 * Utilitários para formatação de dados de campanha
 */

/**
 * Formata o status da campanha para exibição
 * @param {string} status - Status da campanha (open, active, closed, paused)
 * @returns {string} Status formatado em português
 */
export const formatCampaignStatus = (status) => {
    const statusMap = {
        'open': 'Aberto',
        'active': 'Ativo',
        'closed': 'Fechado',
        'paused': 'Pausado'
    };
    return statusMap[status] || status;
};

/**
 * Retorna as classes CSS para o badge de status
 * @param {string} status - Status da campanha
 * @returns {string} Classes CSS do Tailwind
 */
export const getCampaignStatusColor = (status) => {
    const colorMap = {
        'open': 'bg-green-100 text-green-800',
        'active': 'bg-blue-100 text-blue-800',
        'closed': 'bg-red-100 text-red-800',
        'paused': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Formata a visibilidade da campanha
 * @param {string} visibility - Visibilidade (public, private)
 * @returns {string} Visibilidade formatada em português
 */
export const formatCampaignVisibility = (visibility) => {
    return visibility === 'public' ? 'Pública' : 'Privada';
};

/**
 * Retorna as classes CSS para o badge de visibilidade
 * @param {string} visibility - Visibilidade da campanha
 * @returns {string} Classes CSS do Tailwind
 */
export const getCampaignVisibilityColor = (visibility) => {
    return visibility === 'public' 
        ? 'bg-blue-100 text-blue-800' 
        : 'bg-gray-100 text-gray-800';
};

/**
 * Formata o tipo de campanha
 * @param {string} type - Tipo da campanha (digital, presential)
 * @returns {string} Tipo formatado em português
 */
export const formatCampaignType = (type) => {
    return type === 'digital' ? 'Digital' : 'Presencial';
};

/**
 * Formata a role do membro da campanha
 * @param {string} role - Role do membro (player, co_master, master)
 * @returns {string} Role formatada em português
 */
export const formatMemberRole = (role) => {
    const roleMap = {
        'player': 'Player',
        'co_master': 'Co-Master',
        'master': 'Mestre'
    };
    return roleMap[role] || role;
};

/**
 * Formata o status do membro da campanha
 * @param {string} status - Status do membro (active, invited, inactive)
 * @returns {string} Status formatado em português
 */
export const formatMemberStatus = (status) => {
    const statusMap = {
        'active': 'Ativo',
        'invited': 'Convidado',
        'inactive': 'Inativo'
    };
    return statusMap[status] || status || 'Ativo';
};

/**
 * Retorna as classes CSS para o badge de status do membro
 * @param {string} status - Status do membro
 * @returns {string} Classes CSS do Tailwind
 */
export const getMemberStatusColor = (status) => {
    const colorMap = {
        'active': 'bg-green-100 text-green-800',
        'invited': 'bg-yellow-100 text-yellow-800',
        'inactive': 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Formata data para exibição completa (data e hora)
 * @param {string|Date} date - Data a ser formatada
 * @param {boolean} includeTime - Se deve incluir hora (padrão: true)
 * @returns {string} Data formatada em pt-BR
 */
export const formatCampaignDate = (date, includeTime = true) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    
    if (includeTime) {
        return dateObj.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Formata data relativa (ex: "há 2 dias", "há 1 hora")
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data relativa formatada
 */
export const formatRelativeDate = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const dateObj = new Date(date);
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) return 'Agora';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `há ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `há ${diffInMonths} mês${diffInMonths > 1 ? 'es' : ''}`;
    
    return formatCampaignDate(date, false);
};

/**
 * Formata texto preservando quebras de linha
 * Nota: Para formatação avançada (links, markdown), use um componente dedicado
 * @param {string} text - Texto a ser formatado
 * @returns {string} Texto formatado (preserva quebras de linha)
 */
export const formatCampaignText = (text) => {
    if (!text) return '';
    // Por enquanto, apenas retorna o texto
    // Quebras de linha são preservadas pelo CSS whitespace-pre-line
    return text;
};

