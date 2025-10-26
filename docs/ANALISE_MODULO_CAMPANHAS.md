# Análise do Módulo de Campanhas - Sistema RPG Social Network

## 📋 Visão Geral

O módulo de campanhas é um dos componentes centrais do sistema, permitindo que usuários criem, gerenciem e participem de campanhas de RPG. O sistema oferece funcionalidades completas para gerenciamento de campanhas, incluindo convites, chat, mapas mentais, rolagem de dados e muito mais.

## 🏗️ Arquitetura do Sistema

### 1. **Modelos (Models)**

#### **Campaign** (`app/Models/Campaign.php`)
- **Propósito**: Modelo principal para campanhas de RPG
- **Funcionalidades**:
  - Relacionamentos com usuários (owner, members)
  - Sistema de tags para categorização
  - Upload de arquivos
  - Integração com mapas mentais
  - Sistema de rolagem de dados
  - Conversas/chat
  - Convites
  - Personagens vinculados
- **Recursos de Busca**: Integrado com Laravel Scout para busca avançada
- **Campos Principais**:
  - `name`, `description`, `system`, `type`, `city`, `rules`
  - `status` (open, closed, active, paused)
  - `visibility` (public, private)

#### **Modelos Relacionados**:
- **CampaignMember**: Gerencia membros e suas roles
- **CampaignInvite**: Sistema de convites
- **CampaignFile**: Upload de arquivos
- **CampaignTag**: Sistema de tags

### 2. **Controlador (Controller)**

#### **CampaignController** (`app/Http/Controllers/CampaignController.php`)
- **CRUD Completo**: Create, Read, Update, Delete
- **Funcionalidades Especiais**:
  - Sistema de convites (invite, accept, reject)
  - Gerenciamento de membros
  - Controle de roles (master, co_master, player)
  - APIs para componentes React
- **Métodos Principais**:
  - `index()`: Lista campanhas do usuário
  - `show()`: Exibe detalhes da campanha
  - `store()`: Cria nova campanha
  - `update()`: Atualiza campanha
  - `invite()`: Envia convites
  - `acceptInvite()`/`rejectInvite()`: Gerencia convites
  - `removeMember()`: Remove membros
  - `leave()`: Sai da campanha

### 3. **Validação e Autorização**

#### **Form Requests**:
- **StoreCampaignRequest**: Validação para criação
- **UpdateCampaignRequest**: Validação para atualização
- **InviteToCampaignRequest**: Validação para convites

#### **Policies**:
- **CampaignPolicy**: Controle de acesso granular
- **Funcionalidades**:
  - Visualização (owner, members, public)
  - Edição (apenas owner)
  - Convites (owner e co_masters)
  - Gerenciamento de membros
  - Upload de arquivos
  - Controle de mapas mentais

### 4. **Banco de Dados**

#### **Tabelas Principais**:
- **campaigns**: Dados principais da campanha
- **campaign_members**: Relacionamento usuário-campanha com roles
- **campaign_invites**: Sistema de convites
- **campaign_tags**: Tags das campanhas
- **campaign_files**: Arquivos da campanha

#### **Relacionamentos**:
- **Many-to-Many**: Campaign ↔ User (através de campaign_members)
- **Many-to-Many**: Campaign ↔ Tag (através de campaign_tags)
- **One-to-Many**: Campaign → CampaignFile
- **One-to-Many**: Campaign → CampaignInvite
- **One-to-Many**: Campaign → MindmapNode
- **One-to-Many**: Campaign → DiceRoll
- **One-to-Many**: Campaign → Conversation

### 5. **Interface do Usuário (React)**

#### **Componentes Principais**:

##### **CampaignsListPage.jsx**
- Lista campanhas do usuário
- Sistema de busca e filtros
- Paginação
- Estados vazios e de erro

##### **FindCampaignsPage.jsx**
- Busca campanhas públicas
- Filtros avançados (sistema, tipo, localização)
- Interface de descoberta

##### **CampaignPage.jsx**
- Página principal da campanha
- Layout com sidebars
- Integração com chat e controles

##### **CampaignSidebar.jsx**
- Navegação da campanha
- Informações dos membros
- Recursos da campanha

##### **CampaignControls.jsx**
- Controles do GM
- Ações de sessão
- Integração com mapa mental

### 6. **Funcionalidades Avançadas**

#### **Sistema de Convites**:
- Envio de convites por email
- Aceitar/rejeitar convites
- Controle de status (pending, accepted, rejected)

#### **Gerenciamento de Membros**:
- Roles: master, co_master, player
- Status: active, invited, inactive
- Controle de permissões baseado em roles

#### **Sistema de Tags**:
- Categorização de campanhas
- Filtros por tags
- Busca avançada

#### **Upload de Arquivos**:
- Arquivos específicos da campanha
- Controle de permissões
- Integração com sistema de mídia

#### **Integração com Outros Módulos**:
- **Chat**: Conversas da campanha
- **Mindmap**: Mapas mentais colaborativos
- **DiceRoll**: Sistema de rolagem de dados
- **Characters**: Personagens vinculados

### 7. **APIs e Rotas**

#### **Rotas Web**:
- `/campaigns` - Lista de campanhas
- `/campaigns/create` - Criação
- `/campaigns/{id}` - Detalhes
- `/campaigns/{id}/edit` - Edição
- `/campaigns/{id}/chat` - Chat da campanha
- `/campaigns/{id}/mindmap` - Mapa mental

#### **APIs REST**:
- `GET /api/campaigns` - Lista campanhas do usuário
- `GET /api/campaigns/public` - Campanhas públicas
- `POST /api/campaigns` - Criar campanha
- `PUT /api/campaigns/{id}` - Atualizar campanha
- `DELETE /api/campaigns/{id}` - Excluir campanha

### 8. **Sistemas de RPG Suportados**

O sistema suporta diversos sistemas de RPG:
- D&D 5e, D&D 3.5
- Pathfinder, Pathfinder 2e
- Call of Cthulhu
- Vampire: The Masquerade
- World of Darkness
- GURPS, Savage Worlds
- FATE, Cypher System
- Powered by the Apocalypse
- E outros sistemas customizados

### 9. **Recursos de Busca e Filtros**

#### **Filtros Disponíveis**:
- Sistema de RPG
- Tipo (digital/presencial)
- Localização (cidade)
- Status da campanha
- Visibilidade
- Tags
- Busca por texto

#### **Integração com Scout**:
- Busca full-text
- Indexação automática
- Filtros avançados
- Resultados relevantes

### 10. **Estados e Status**

#### **Status da Campanha**:
- **open**: Aberta para novos membros
- **closed**: Fechada para novos membros
- **active**: Sessão ativa
- **paused**: Sessão pausada

#### **Visibilidade**:
- **public**: Visível para todos
- **private**: Apenas membros

#### **Roles dos Membros**:
- **master**: Dono da campanha
- **co_master**: Co-mestre
- **player**: Jogador

### 11. **Integração com Outros Módulos**

#### **Chat System**:
- Conversas específicas da campanha
- Notificações em tempo real
- Histórico de mensagens

#### **Mindmap System**:
- Mapas mentais colaborativos
- Nós e conexões
- Arquivos anexados

#### **Character System**:
- Personagens vinculados à campanha
- Controle de disponibilidade
- Gerenciamento de jogadores

#### **Dice Roll System**:
- Rolagem de dados
- Histórico de rolagens
- Integração com chat

### 12. **Pontos Fortes do Sistema**

1. **Arquitetura Robusta**: Separação clara de responsabilidades
2. **Flexibilidade**: Suporte a múltiplos sistemas de RPG
3. **Usabilidade**: Interface intuitiva e responsiva
4. **Escalabilidade**: Estrutura preparada para crescimento
5. **Segurança**: Controle de acesso granular
6. **Integração**: Conecta diversos módulos do sistema
7. **Busca Avançada**: Sistema de busca e filtros eficiente
8. **Colaboração**: Recursos para trabalho em equipe

### 13. **Áreas de Melhoria Potencial**

1. **Notificações**: Sistema de notificações mais robusto
2. **Calendário**: Agendamento de sessões
3. **Relatórios**: Analytics de campanhas
4. **Templates**: Modelos de campanhas pré-definidos
5. **Exportação**: Exportar dados da campanha
6. **Backup**: Sistema de backup automático

## 🎯 Conclusão

O módulo de campanhas é um sistema completo e bem estruturado que oferece todas as funcionalidades necessárias para gerenciar campanhas de RPG online. A arquitetura é sólida, a interface é intuitiva e a integração com outros módulos é bem implementada. O sistema está preparado para escalar e pode ser facilmente estendido com novas funcionalidades.
