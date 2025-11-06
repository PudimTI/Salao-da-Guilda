import React, { useState, useEffect } from 'react';

const CampaignMasterSidebar = ({ campaignId, campaign }) => {
    const [isOwner, setIsOwner] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Verificar se o usuário atual é o owner
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(user);

        // Debug logs
        console.log('🔍 [CampaignMasterSidebar] Verificando se usuário é owner:', {
            userId: user.id,
            userEmail: user.email,
            campaignOwnerId: campaign?.owner_id,
            campaignOwner: campaign?.owner,
            campaignIsOwner: campaign?.is_owner
        });

        let ownerCheck = false;

        // Verificar por owner_id
        if (campaign?.owner_id) {
            ownerCheck = Number(user.id) === Number(campaign.owner_id);
            console.log('✅ [CampaignMasterSidebar] Verificado por owner_id:', ownerCheck);
        }
        
        // Verificar por owner.id
        if (!ownerCheck && campaign?.owner?.id) {
            ownerCheck = Number(user.id) === Number(campaign.owner.id);
            console.log('✅ [CampaignMasterSidebar] Verificado por owner.id:', ownerCheck);
        }
        
        // Verificar por is_owner
        if (!ownerCheck && campaign?.is_owner !== undefined) {
            ownerCheck = campaign.is_owner === true;
            console.log('✅ [CampaignMasterSidebar] Verificado por is_owner:', ownerCheck);
        }

        setIsOwner(ownerCheck);
        console.log('🎯 [CampaignMasterSidebar] Resultado final - é owner:', ownerCheck);
    }, [campaign]);

    // Se não for owner, não renderizar nada
    if (!isOwner) {
        return null;
    }

    const handleMindmapClick = () => {
        if (campaignId) {
            window.location.href = `/campaigns/${campaignId}/mindmap`;
        }
    };

    const handleCampaignSettings = () => {
        if (campaignId) {
            window.location.href = `/campaigns/${campaignId}/edit`;
        }
    };

    const handleManageMembers = () => {
        if (campaignId) {
            window.location.href = `/campaigns/${campaignId}`;
        }
    };

    const handleInviteMembers = () => {
        if (campaignId) {
            window.location.href = `/campaigns/${campaignId}#invites`;
        }
    };

    return (
        <div className="w-64 flex flex-col h-full bg-gradient-to-b from-purple-50 to-purple-100 border-l border-purple-200">
            {/* Header da Sidebar do Mestre */}
            <div className="p-4 border-b border-purple-200 bg-purple-600">
                <div className="flex items-center space-x-2">
                    <svg 
                        className="w-5 h-5 text-yellow-400" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white">
                        Painel do Mestre
                    </h3>
                </div>
                <p className="text-xs text-purple-200 mt-1">
                    Controles exclusivos
                </p>
            </div>

            {/* Controles do Mestre */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Botão Mapa Mental - Destaque */}
                <button
                    onClick={handleMindmapClick}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                    title="Abrir mapa mental da campanha"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span>Mapa Mental</span>
                </button>

                {/* Separador */}
                <div className="border-t border-purple-200 my-3"></div>

                {/* Configurações da Campanha */}
                <button
                    onClick={handleCampaignSettings}
                    className="w-full text-left p-3 rounded-lg bg-white border border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200 flex items-center space-x-3 group"
                    title="Editar configurações da campanha"
                >
                    <svg className="w-5 h-5 text-purple-600 group-hover:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-gray-700 group-hover:text-purple-800">Configurações</span>
                </button>

                {/* Gerenciar Membros */}
                <button
                    onClick={handleManageMembers}
                    className="w-full text-left p-3 rounded-lg bg-white border border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200 flex items-center space-x-3 group"
                    title="Gerenciar membros da campanha"
                >
                    <svg className="w-5 h-5 text-purple-600 group-hover:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="font-medium text-gray-700 group-hover:text-purple-800">Gerenciar Membros</span>
                </button>

                {/* Convidar Membros */}
                <button
                    onClick={handleInviteMembers}
                    className="w-full text-left p-3 rounded-lg bg-white border border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200 flex items-center space-x-3 group"
                    title="Convidar novos membros"
                >
                    <svg className="w-5 h-5 text-purple-600 group-hover:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="font-medium text-gray-700 group-hover:text-purple-800">Convidar Membros</span>
                </button>

                {/* Arquivos da Campanha */}
                <button
                    onClick={() => {
                        // Scroll para a aba de arquivos na sidebar esquerda (se necessário)
                        // Por enquanto, apenas um placeholder
                        console.log('Gerenciar arquivos');
                    }}
                    className="w-full text-left p-3 rounded-lg bg-white border border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200 flex items-center space-x-3 group"
                    title="Gerenciar arquivos da campanha"
                >
                    <svg className="w-5 h-5 text-purple-600 group-hover:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium text-gray-700 group-hover:text-purple-800">Arquivos</span>
                </button>
            </div>

            {/* Footer com Badge de Mestre */}
            <div className="p-4 border-t border-purple-200 bg-purple-50">
                <div className="flex items-center justify-center space-x-2 text-purple-700">
                    <svg 
                        className="w-5 h-5 text-yellow-500" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">Você é o Mestre</span>
                </div>
            </div>
        </div>
    );
};

export default CampaignMasterSidebar;

