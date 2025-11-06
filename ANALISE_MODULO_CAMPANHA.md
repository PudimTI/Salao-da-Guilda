# 📋 Análise Completa do Módulo de Campanha

## 🎯 Visão Geral

O módulo de Campanha é um dos componentes centrais do sistema "Salão da Guilda", permitindo que usuários criem, gerenciem e participem de campanhas de RPG. O módulo oferece funcionalidades completas para gerenciamento colaborativo de campanhas, incluindo chat integrado, sistema de convites, rolagem de dados, gerenciamento de arquivos e muito mais.

---

## 🏗️ Arquitetura do Sistema

### 1. **Backend (Laravel)**

#### **Modelo Campaign** (`app/Models/Campaign.php`)
- **Propósito**: Modelo principal para campanhas de RPG
- **Campos Principais**:
  - `id`, `owner_id`, `name`, `description`, `system`, `type`, `city`, `rules`
  - `status` (open, active, closed, paused)
  - `visibility` (public, private)
  - `created_at`, `updated_at`

#### **Relacionamentos do Modelo Campaign**:
1. **owner()**: `BelongsTo` → User (dono da campanha)
2. **members()**: `BelongsToMany` → User (membros via tabela pivot `campaign_members`)
3. **tags()**: `BelongsToMany` → Tag (categorização via tabela pivot `campaign_tags`)
4. **files()**: `HasMany` → CampaignFile (arquivos da campanha)
5. **mindmapNodes()**: `HasMany` → MindmapNode (nós do mapa mental)
6. **diceRolls()**: `HasMany` → DiceRoll (rolagens de dados)
7. **conversations()**: `HasMany` → Conversation (conversas/chat)
8. **invites()**: `HasMany` → CampaignInvite (convites)
9. **characters()**: `BelongsToMany` → Character (personagens vinculados)

#### **Recursos Especiais**:
- **Laravel Scout**: Busca avançada indexável
- **Políticas de Busca**: Apenas campanhas públicas e ativas são indexadas

---

### 2. **Controller (CampaignController)**

#### **Métodos Principais**:

##### **CRUD Básico**:
- `index()`: Lista campanhas do usuário (dono ou membro)
- `create()`: Formulário de criação
- `store()`: Cria nova campanha
- `show()`: Exibe detalhes da campanha
- `edit()`: Formulário de edição
- `update()`: Atualiza campanha
- `destroy()`: Deleta campanha

##### **Gerenciamento de Membros**:
- `invite()`: Envia convite por email
- `acceptInvite()`: Aceita convite pendente
- `rejectInvite()`: Rejeita convite
- `removeMember()`: Remove membro da campanha
- `leave()`: Usuário sai da campanha
- `updateMemberRole()`: Atualiza role do membro (player, master, co_master)

##### **Gerenciamento de Arquivos**:
- `getCampaignFiles()`: Lista arquivos da campanha
- `uploadCampaignFile()`: Faz upload de arquivo (max 10MB)

##### **APIs para React**:
- `apiIndex()`: Lista campanhas em JSON
- `apiPublic()`: Lista campanhas públicas
- `apiShow()`: Detalhes da campanha em JSON
- `apiStore()`: Cria campanha via API
- `apiUpdate()`: Atualiza campanha via API
- `apiDestroy()`: Deleta campanha via API
- `apiInvite()`: Envia convite via API
- `apiLeave()`: Sai da campanha via API
- `apiUpdateMemberRole()`: Atualiza role via API

---

### 3. **Políticas de Autorização (CampaignPolicy)**

#### **Métodos de Autorização**:

- **view()**: Permite visualização se:
  - Usuário é dono, OU
  - Usuário é membro, OU
  - Campanha é pública

- **create()**: Qualquer usuário autenticado pode criar

- **update()**: Apenas o dono pode atualizar

- **delete()**: Apenas o dono pode deletar

- **invite()**: Permite convidar se:
  - Usuário é dono, OU
  - Usuário é master/co_master

- **removeMember()**: Apenas dono pode remover (não pode remover a si mesmo ou o dono)

- **leave()**: Membro pode sair (mas dono não pode)

- **updateMemberRole()**: Apenas dono pode atualizar (não pode alterar próprio role ou do dono)

- **uploadFiles()**: Dono e membros ativos podem fazer upload

- **manageMindmap()**: Dono e masters podem gerenciar mapa mental

- **rollDice()**: Dono e membros ativos podem rolar dados

---

### 4. **Frontend (React)**

#### **Estrutura de Componentes**:

##### **Páginas Principais**:
1. **CampaignsListPage** (`resources/js/components/CampaignsListPage.jsx`)
   - Lista todas as campanhas do usuário
   - Busca e filtros
   - Paginação
   - Estado vazio com call-to-action

2. **CampaignDetailPage** (`resources/js/components/CampaignDetailPage.jsx`)
   - Detalhes completos da campanha
   - Lista de membros
   - Sistema de convites (para dono)
   - Estatísticas
   - Ações (entrar no chat, editar, sair)

3. **CampaignCreatePage** (`resources/js/components/CampaignCreatePage.jsx`)
   - Formulário de criação
   - Seleção de sistema RPG
   - Tags múltiplas
   - Validação de campos

4. **CampaignEditPage** (`resources/js/components/CampaignEditPage.jsx`)
   - Edição de campanha existente
   - Mesmas opções da criação

5. **CampaignPage** (`resources/js/components/CampaignPage.jsx`)
   - Página principal da campanha
   - Layout com sidebar esquerda, chat central, sidebar direita
   - Integração com chat e controles

##### **Componentes de Chat**:
1. **CampaignChat** (`resources/js/components/CampaignChat.jsx`)
   - **Funcionalidades**:
     - Chat em tempo real
     - Rolagem de dados integrada
     - Upload de arquivos/mídia
     - Indicador de usuários digitando
     - Mensagens com avatares
     - Marcação de mestre (ícone de coroa)
     - Modal de rolagem de dados
     - Modal de upload de arquivo
     - Fórmulas comuns de dados
     - Validação de fórmulas em tempo real
   
   - **Hooks Utilizados**:
     - `useChat`: Gerenciamento de chat
     - `useDiceRoll`: Sistema de rolagem de dados
     - `useCampaignConversation`: Conversa específica da campanha

2. **CampaignChatHeader** (`resources/js/components/CampaignChatHeader.jsx`)
   - Header do chat com informações da campanha
   - Botão de voltar
   - Contador de participantes
   - Badge do dono

##### **Componentes de Sidebar**:
1. **CampaignSidebar** (`resources/js/components/CampaignSidebar.jsx`)
   - Sidebar esquerda com abas
   - Abas: Chat, Jogadores, Convites, Recursos, Mais
   - Canais de chat (Geral, Rolagem de Dados)

2. **CampaignChatSidebar** (`resources/js/components/CampaignChatSidebar.jsx`)
   - Sidebar esquerda no chat
   - Abas: Membros / Arquivos
   - Lista de participantes com avatares
   - Indicador de status online (preparado para implementação)
   - Badge de mestre
   - Upload e lista de arquivos

3. **CampaignMasterSidebar** (`resources/js/components/CampaignMasterSidebar.jsx`)
   - Sidebar direita (exclusiva para mestre)
   - Controles exclusivos:
     - Acesso ao mapa mental
     - Configurações da campanha
     - Gerenciar membros
     - Convidar membros
     - Arquivos da campanha
   - Renderização condicional (só aparece se for mestre)

##### **Componentes Auxiliares**:
1. **CampaignCard**: Card para exibição em listagens
2. **CampaignListItem**: Item de lista para campanhas
3. **CampaignInviteManager**: Gerenciamento de convites
4. **CampaignInviteModal**: Modal de convite
5. **CampaignFileUpload**: Upload de arquivos
6. **CampaignFilesList**: Lista de arquivos
7. **CampaignFilters**: Filtros de busca
8. **CampaignControls**: Controles adicionais
9. **CampaignHeader**: Header reutilizável

---

### 5. **Hooks Customizados**

#### **useCampaignConversation** (`resources/js/hooks/useCampaignConversation.js`)
- **Propósito**: Gerencia conversas de campanha com prevenção de race conditions
- **Funcionalidades**:
  - Busca conversa existente da campanha
  - Cria conversa automaticamente se não existir
  - Prevenção de múltiplas criações simultâneas
  - Cancelamento de requisições com AbortController
  - Verificação de membros antes de criar
  - Tratamento de erros (409 = já existe, buscar novamente)
  - Estados: `loading`, `creating`, `error`, `conversation`

---

## 🔄 Fluxos de Dados Principais

### 1. **Criação de Campanha**:
```
Usuário → CampaignCreatePage → API POST /campaigns → CampaignController::store()
→ Criar Campaign → Adicionar membros (owner como master) → Adicionar tags
→ Redirecionar para /campaigns/{id}
```

### 2. **Carregamento da Página da Campanha**:
```
Usuário → CampaignPage → API GET /api/campaigns/{id} → Carregar dados
→ useCampaignConversation → Buscar/criar conversa → CampaignChat
→ Renderizar layout completo
```

### 3. **Chat da Campanha**:
```
CampaignChat → useCampaignConversation → Buscar conversa existente
→ Se não existir: Criar conversa com todos os membros
→ useChat → Conectar à conversa → Receber/enviar mensagens
→ useDiceRoll → Rolagem de dados → Enviar como mensagem
```

### 4. **Sistema de Convites**:
```
Mestre → CampaignInviteManager → API POST /api/campaigns/{id}/invite
→ CampaignController::invite() → Criar CampaignInvite
→ Notificar usuário convidado → Aceitar/Rejeitar
```

---

## 📊 Estrutura de Dados

### **Tabelas Relacionadas**:

1. **campaigns**:
   - Campos básicos da campanha
   - Foreign key para `users.id` (owner_id)

2. **campaign_members** (pivot):
   - `campaign_id`, `user_id`
   - `role` (player, master, co_master)
   - `status` (active, invited)
   - `joined_at`

3. **campaign_tags** (pivot):
   - `campaign_id`, `tag_id`
   - `created_at`

4. **campaign_invites**:
   - `campaign_id`, `inviter_id`, `invitee_id`
   - `message`, `status` (pending, accepted, rejected)
   - `sent_at`, `responded_at`

5. **campaign_files**:
   - `campaign_id`, `uploaded_by`
   - `name`, `type`, `size`, `url`
   - `uploaded_at`

---

## ✨ Funcionalidades Principais

### 1. **Gerenciamento de Campanhas**:
- ✅ Criar, editar, deletar campanhas
- ✅ Status (open, active, closed, paused)
- ✅ Visibilidade (public, private)
- ✅ Sistema de tags
- ✅ Descrição e regras personalizadas
- ✅ Sistema RPG configurável

### 2. **Gerenciamento de Membros**:
- ✅ Sistema de roles (master, co_master, player)
- ✅ Convites por email
- ✅ Aceitar/rejeitar convites
- ✅ Remover membros (apenas mestre)
- ✅ Sair da campanha

### 3. **Chat Integrado**:
- ✅ Chat em tempo real
- ✅ Indicador de digitação
- ✅ Upload de mídia
- ✅ Rolagem de dados integrada
- ✅ Mensagens formatadas
- ✅ Identificação de mestre

### 4. **Sistema de Dados**:
- ✅ Fórmulas de rolagem (1d20, 2d6+3, etc.)
- ✅ Validação de fórmulas
- ✅ Fórmulas comuns pré-definidas
- ✅ Descrição opcional para rolagens
- ✅ Integração com mensagens do chat

### 5. **Gerenciamento de Arquivos**:
- ✅ Upload de arquivos (max 10MB)
- ✅ Tipos: imagem, vídeo, áudio, documento
- ✅ Listagem de arquivos
- ✅ Informações do uploader

### 6. **Integrações**:
- ✅ Mapas mentais (MindmapNode)
- ✅ Personagens (Character)
- ✅ Busca avançada (Laravel Scout)

---

## 🎨 Interface do Usuário

### **Design Pattern**:
- **Estilo**: TailwindCSS com cores temáticas (purple para campanha)
- **Layout**: Sidebar esquerda + Chat central + Sidebar direita (mestre)
- **Responsividade**: Design adaptativo

### **Componentes Visuais**:
- Badges de status (open, active, closed)
- Avatares de usuários
- Ícones SVG customizados
- Modais para ações (dados, arquivos)
- Loading states
- Estados vazios com mensagens

---

## 🔒 Segurança e Autorização

### **Pontos Fortes**:
- ✅ Políticas de autorização bem definidas
- ✅ Validação de permissões no backend
- ✅ Verificação de membros antes de criar conversas
- ✅ Controle de acesso a arquivos
- ✅ Proteção contra criação duplicada de conversas

### **Melhorias Sugeridas**:
- ⚠️ Validação adicional no frontend (feedback mais rápido)
- ⚠️ Rate limiting para criação de campanhas/convites
- ⚠️ Sanitização de input (descrições, regras)

---

## 🚀 Pontos Fortes do Módulo

1. **Arquitetura Robusta**:
   - Separação clara entre frontend e backend
   - Hooks customizados bem estruturados
   - Políticas de autorização completas

2. **Funcionalidades Completas**:
   - CRUD completo
   - Sistema de membros e roles
   - Chat integrado
   - Rolagem de dados
   - Upload de arquivos

3. **Experiência do Usuário**:
   - Interface intuitiva
   - Feedback visual (loading, erros)
   - Estados vazios informativos

4. **Prevenção de Problemas**:
   - Race condition na criação de conversas
   - Cancelamento de requisições
   - Validação de fórmulas de dados

---

## ⚠️ Áreas de Melhoria

### 1. **Performance**:
- ⚠️ Lazy loading de mensagens antigas
- ⚠️ Paginação de arquivos
- ⚠️ Cache de dados da campanha
- ⚠️ Otimização de queries N+1

### 2. **Funcionalidades Faltantes**:
- ⚠️ Notificações em tempo real (WebSockets/Pusher)
- ⚠️ Busca dentro do chat
- ⚠️ Edição/exclusão de mensagens
- ⚠️ Compartilhamento de campanhas
- ⚠️ Histórico de atividades

### 3. **UX/UI**:
- ⚠️ Modo escuro
- ⚠️ Notificações toast mais visíveis
- ⚠️ Preview de arquivos (imagens, PDFs)
- ⚠️ Drag and drop para upload

### 4. **Código**:
- ⚠️ Testes unitários e de integração
- ⚠️ Documentação de APIs
- ⚠️ Tratamento de erros mais robusto
- ⚠️ TypeScript (atualmente JavaScript)

---

## 📝 Recomendações de Implementação

### **Curto Prazo**:
1. Implementar busca dentro do chat
2. Adicionar preview de imagens/PDFs
3. Melhorar tratamento de erros
4. Adicionar validação no frontend

### **Médio Prazo**:
1. WebSockets para chat em tempo real
2. Paginação de mensagens
3. Sistema de notificações
4. Cache de dados

### **Longo Prazo**:
1. Migração para TypeScript
2. Testes automatizados
3. Documentação completa
4. Sistema de plugins/extensões

---

## 🔗 Integrações com Outros Módulos

1. **Módulo de Usuários**: Owner e membros
2. **Módulo de Chat**: Conversas da campanha
3. **Módulo de Dados**: Rolagens de dados
4. **Módulo de Personagens**: Personagens vinculados
5. **Módulo de Arquivos**: Upload e gerenciamento
6. **Módulo de Mapas Mentais**: Nós da campanha
7. **Módulo de Tags**: Categorização

---

## 📚 Conclusão

O módulo de Campanha é uma peça fundamental do sistema, bem arquitetado e com funcionalidades completas. A separação entre frontend React e backend Laravel está bem implementada, com APIs RESTful e componentes reutilizáveis. As políticas de autorização garantem segurança adequada, e a experiência do usuário é fluida e intuitiva.

**Principais Destaques**:
- ✅ Arquitetura sólida e escalável
- ✅ Funcionalidades completas para gerenciamento de campanhas
- ✅ Integração eficiente com outros módulos
- ✅ Segurança bem implementada

**Próximos Passos Sugeridos**:
- Implementar melhorias de performance
- Adicionar funcionalidades faltantes
- Melhorar testes e documentação
- Aprimorar UX com novas features

---

**Documento gerado em**: {{ data_atual }}
**Versão do Módulo**: 1.0
**Última atualização**: Análise completa do módulo de campanha






