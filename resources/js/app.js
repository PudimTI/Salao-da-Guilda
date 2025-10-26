import './bootstrap';
import './test-simple';
import './test-components';
import './services/profileService';
import './utils/api';
import './test-routes';
import './chat-integration';
import './friendship-integration';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { Home, Feed, CampaignsPage, UserProfilePage, CampaignPage, CharactersPage, CharacterDetailPage, CampaignsListPage, CampaignDetailPage, FindCampaignsPage, MindmapPage, InvitesPage, CampaignCreatePage, CampaignEditPage } from './components';

// Exportar componentes globais para uso em scripts inline
window.React = React;
window.ReactDOM = { createRoot };

// Exportar componentes para uso global
window.CampaignCreatePage = CampaignCreatePage;
window.CampaignEditPage = CampaignEditPage;

// Função para inicializar a aplicação React
window.initReactComponents = () => {
    console.log('initReactComponents: Iniciando...');
    
    // Teste simples primeiro
    const debugElement = document.getElementById('debug-app');
    if (debugElement) {
        console.log('DebugApp: Renderizando teste simples');
        debugElement.innerHTML = `
            <div style="padding: 2rem; background-color: #e8f5e8; border: 2px solid #4caf50; border-radius: 8px; margin: 1rem;">
                <h2 style="color: #2e7d32; margin-bottom: 1rem;">✅ Teste JavaScript Simples</h2>
                <p style="color: #2e7d32; margin-bottom: 1rem;">Se você está vendo esta mensagem, o JavaScript está funcionando!</p>
                <p style="color: #666; font-size: 0.9rem;">Timestamp: ${new Date().toLocaleString()}</p>
            </div>
        `;
    }
    
    // Montar Home via React
    const homeElement = document.getElementById('home-app');
    if (homeElement) {
        console.log('Home: Montando aplicação principal');
        const root = createRoot(homeElement);
        root.render(<Home />);
    } else {
        console.log('Home: Elemento home-app não encontrado');
    }

    // Montar Feed via React quando existir o container
    const feedElement = document.getElementById('feed-app');
    if (feedElement) {
        console.log('Feed: Montando aplicação de feed');
        const root = createRoot(feedElement);
        root.render(<Feed />);
    }

    // Montar Listagem de Campanhas
    const campaignsElement = document.getElementById('campaigns-app');
    if (campaignsElement) {
        console.log('Campaigns: Montando listagem de campanhas');
        const root = createRoot(campaignsElement);
        root.render(<CampaignsPage />);
    }

    // Montar Perfil de Usuário
    const profileElement = document.getElementById('profile-app');
    if (profileElement) {
        console.log('Profile: Montando página de perfil');
        const root = createRoot(profileElement);
        root.render(<UserProfilePage />);
    }

    // Montar Página de Campanha
    const campaignElement = document.getElementById('campaign-app');
    if (campaignElement) {
        console.log('Campaign: Montando página de campanha');
        const root = createRoot(campaignElement);
        root.render(<CampaignPage />);
    }

    // Montar Chat da Campanha
    const campaignChatElement = document.getElementById('campaign-chat-app');
    if (campaignChatElement) {
        console.log('Campaign Chat: Montando chat da campanha');
        const campaignId = campaignChatElement.dataset.campaignId;
        const root = createRoot(campaignChatElement);
        root.render(<CampaignPage campaignId={campaignId} />);
    }

    // Montar Mapa Mental da Campanha
    const mindmapElement = document.getElementById('mindmap-app');
    if (mindmapElement) {
        console.log('Mindmap: Montando mapa mental da campanha');
        const campaignId = mindmapElement.dataset.campaignId;
        const root = createRoot(mindmapElement);
        root.render(<MindmapPage campaignId={campaignId} />);
    }

    // Montar Listagem de Personagens
    const charactersElement = document.getElementById('characters-app');
    if (charactersElement) {
        console.log('Characters: Montando listagem de personagens');
        const root = createRoot(charactersElement);
        root.render(<CharactersPage />);
    }

    // Montar Detalhes de Personagem
    const characterDetailElement = document.getElementById('character-detail-app');
    if (characterDetailElement) {
        console.log('Character Detail: Montando detalhes do personagem');
        const characterId = characterDetailElement.dataset.characterId;
        const root = createRoot(characterDetailElement);
        root.render(<CharacterDetailPage characterId={characterId} />);
    }

    // Montar Listagem de Campanhas (nova versão)
    const campaignsListElement = document.getElementById('campaigns-list-app');
    if (campaignsListElement) {
        console.log('Campaigns List: Montando listagem de campanhas');
        const root = createRoot(campaignsListElement);
        root.render(<CampaignsListPage />);
    }

    // Montar Detalhes de Campanha
    const campaignDetailElement = document.getElementById('campaign-detail-app');
    if (campaignDetailElement) {
        console.log('Campaign Detail: Montando detalhes da campanha');
        const campaignId = campaignDetailElement.dataset.campaignId;
        const root = createRoot(campaignDetailElement);
        root.render(<CampaignDetailPage campaignId={campaignId} />);
    }

    // Montar Página de Encontrar Campanhas
    const findCampaignsElement = document.getElementById('find-campaigns-app');
    if (findCampaignsElement) {
        console.log('Find Campaigns: Montando página de encontrar campanhas');
        const root = createRoot(findCampaignsElement);
        root.render(<FindCampaignsPage />);
    }

    // Montar Página de Convites
    const invitesElement = document.getElementById('invites-app');
    if (invitesElement) {
        console.log('Invites: Montando página de convites');
        const root = createRoot(invitesElement);
        root.render(<InvitesPage />);
    }

    // Montar Página de Criar Campanha
    const campaignCreateElement = document.getElementById('campaign-create-app');
    if (campaignCreateElement) {
        console.log('Campaign Create: Montando página de criar campanha');
        const root = createRoot(campaignCreateElement);
        root.render(<CampaignCreatePage />);
    }

    // Montar Página de Editar Campanha
    const campaignEditElement = document.getElementById('campaign-edit-app');
    if (campaignEditElement) {
        console.log('Campaign Edit: Montando página de editar campanha');
        const root = createRoot(campaignEditElement);
        root.render(<CampaignEditPage 
            campaignId={campaignEditElement.dataset.campaignId}
            campaignData={campaignEditElement.dataset.campaignData ? JSON.parse(campaignEditElement.dataset.campaignData) : {}}
            tags={campaignEditElement.dataset.tags ? JSON.parse(campaignEditElement.dataset.tags) : []}
            campaignTags={campaignEditElement.dataset.campaignTags ? JSON.parse(campaignEditElement.dataset.campaignTags) : []}
        />);
    }
};

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded: DOM carregado');
    window.initReactComponents();
});