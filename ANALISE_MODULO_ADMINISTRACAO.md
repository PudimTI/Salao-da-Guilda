# Análise do Módulo de Administração - Salão da Guilda

## 📋 Resumo Executivo

Este documento apresenta uma análise completa do módulo de administração da aplicação Salão da Guilda, identificando todos os modelos que podem ser controlados pelo administrador, os recursos disponíveis no painel admin e as funcionalidades de gerenciamento implementadas.

## 🏗️ Arquitetura do Sistema de Administração

### 1. **Painel Admin (Filament)**

O sistema utiliza **Filament 4.0** como framework para o painel administrativo.

**Localização:** `app/Providers/Filament/SgAdminPanelProvider.php`

**Configurações:**
- **ID do Painel:** `sg_admin`
- **Caminho de Acesso:** `/sg_admin`
- **Autenticação:** Login próprio do Filament
- **Cor Primária:** Amber
- **Recursos:** Descoberta automática de recursos em `app/Filament/Resources`
- **Widgets:** AccountWidget, FilamentInfoWidget

### 2. **Middleware de Autenticação Admin**

**Arquivo:** `app/Http/Middleware/AdminMiddleware.php`

**Funcionalidade:**
- Verifica autenticação do usuário
- Valida se o usuário possui role 'admin' através do método `hasRole('admin')`
- Retorna erro 403 se não for administrador

**Aplicação:**
- Middleware alias: `admin`
- Usado em rotas específicas de administração (ex: rotas de Mindmap)

### 3. **Sistema de Auditoria**

**Modelo:** `app/Models/AdminAuditLog.php`

**Estrutura:**
- Registra todas as ações administrativas
- Campos: `admin_id`, `entity_type`, `entity_id`, `operation`, `details`, `acted_at`
- Relacionamento com User através de `admin_id`

**Uso:** Rastreamento de ações administrativas para compliance e segurança

### 4. **Sistema de Moderação**

**Modelo:** `app/Models/ModerationAction.php`

**Estrutura:**
- Registra ações de moderação do conteúdo
- Campos: `admin_id`, `target_type`, `target_id`, `action`, `reason`, `starts_at`, `ends_at`
- Suporta ações temporárias com período de início e fim

**Funcionalidades:**
- Bloqueio temporário/permanente de conteúdo
- Ações de moderação em posts, comentários, usuários, etc.

---

## 📊 Modelos Controláveis pelo Admin

### 1. **Campanhas (Campaign)** ✅ COMPLETO

**Resource:** `app/Filament/Resources/CampaignResource.php`

**Funcionalidades Admin:**
- ✅ Listagem de todas as campanhas
- ✅ Visualização detalhada
- ✅ Criação de campanhas
- ✅ Edição de campanhas
- ✅ Exclusão de campanhas
- ✅ Ordenação no menu (sort: 1)

**Páginas Implementadas:**
- `ListCampaigns` - Lista com filtros
- `ViewCampaign` - Visualização com ações de editar/deletar
- `EditCampaign` - Edição com redirecionamento
- `CreateCampaign` - Criação de novas campanhas

**Campos Controláveis:**
- `owner_id` - Dono da campanha
- `name` - Nome
- `description` - Descrição
- `system` - Sistema de RPG
- `type` - Tipo
- `city` - Cidade
- `rules` - Regras
- `status` - Status (active, inactive, etc.)
- `visibility` - Visibilidade (public, private)

**Relacionamentos:**
- Owner (User)
- Members (Users)
- Tags
- Files
- MindmapNodes
- DiceRolls
- Conversations
- Invites
- Characters

### 2. **Personagens (Character)** ✅ COMPLETO

**Resource:** `app/Filament/Resources/CharacterResource.php`

**Funcionalidades Admin:**
- ✅ Listagem de todos os personagens
- ✅ Visualização detalhada
- ✅ Criação de personagens
- ✅ Edição de personagens
- ✅ Exclusão de personagens

**Páginas Implementadas:**
- `ListCharacters` - Lista com ação de criar
- `ViewCharacter` - Visualização com ação de editar
- `EditCharacter` - Edição com ações de visualizar/deletar
- `CreateCharacter` - Criação de novos personagens

**Campos Controláveis:**
- `user_id` - Usuário proprietário
- `name` - Nome do personagem
- `level` - Nível
- `summary` - Resumo
- `backstory` - História de fundo
- `system` - Sistema de RPG

**Relacionamentos:**
- User (proprietário)
- Campaigns (many-to-many através de character_campaign_links)

### 3. **Usuários (User)** ⚠️ PARCIAL

**Resource:** `app/Filament/Resources/UserResource/` (incompleto)

**Status:** Apenas página de listagem implementada (`ListUsers.php`)

**Funcionalidades Atuais:**
- ✅ Listagem de usuários (parcial)
- ❌ Visualização detalhada (não implementado)
- ❌ Criação de usuários (não implementado)
- ❌ Edição de usuários (não implementado)
- ❌ Exclusão de usuários (não implementado)

**Campos do Modelo (potencialmente controláveis):**
- `handle` - Handle/username
- `email` - Email
- `password_hash` - Senha (hash)
- `display_name` - Nome de exibição
- `avatar_url` - URL do avatar
- `bio` - Biografia
- `status` - Status do usuário
- `last_login_at` - Último login

**Relacionamentos:**
- Profile (UserProfile)
- Preferences (UserPreference)
- Filters (UserFilter)
- Characters
- Campaigns (ownadas)
- Posts
- Friendships
- Notifications

### 4. **Posts** ❌ NÃO IMPLEMENTADO

**Status:** Não há Resource do Filament para Posts

**Modelo Existente:** `app/Models/Post.php`

**Campos Potenciais para Admin:**
- `author_id` - Autor
- `content` - Conteúdo
- `visibility` - Visibilidade
- `reply_to_post_id` - Post original (se for resposta)
- `created_at` - Data de criação

**Funcionalidades que poderiam ser implementadas:**
- Listagem de todos os posts
- Moderação de conteúdo
- Remoção de posts inapropriados
- Edição de posts
- Visualização de estatísticas (likes, comentários, reposts)

**Relacionamentos:**
- Author (User)
- Comments
- Likes
- Reposts
- Mentions
- Tags
- Media (attachments)

### 5. **Tags** ⚠️ INDIRETO

**Status:** Não há Resource do Filament, mas há controle através de Policies

**Modelo:** `app/Models/Tag.php`

**Políticas de Acesso (TagPolicy):**
- ✅ Admins podem editar qualquer tag
- ✅ Admins podem deletar tags
- ✅ Admins podem moderar tags

**Campos:**
- `name` - Nome da tag
- `type` - Tipo
- `description` - Descrição
- `synonyms` - Sinônimos (JSON)
- `usage_count` - Contador de uso
- `is_moderated` - Status de moderação

**Funcionalidades Admin Atuais:**
- Edição via Policies
- Exclusão via Policies
- Moderação via Policies

**Recomendação:** Criar Resource do Filament para melhor gerenciamento

### 6. **Comentários (Comment)** ❌ NÃO IMPLEMENTADO

**Modelo:** `app/Models/Comment.php`

**Status:** Não há Resource do Filament

**Campos:**
- `post_id` - Post relacionado
- `author_id` - Autor do comentário
- `content` - Conteúdo
- `created_at` - Data de criação

**Recomendação:** Implementar Resource para moderação de comentários

---

## 🎯 Recursos Admin Adicionais

### 1. **Mindmap Admin**

**Controller:** `app/Http/Controllers/Admin/MindmapController.php`

**Rotas:** `/admin/mindmap/*`

**Funcionalidades:**
- ✅ Listagem de campanhas com mapas mentais
- ✅ Visualização de mapas mentais específicos
- ✅ API para dados do mapa mental
- ✅ Estatísticas de uso de mapas mentais
- ✅ Deletar nós (admin)
- ✅ Deletar conexões (admin)
- ✅ Exportar todos os mapas mentais
- ✅ Exportar mapa mental de campanha específica

**Estatísticas Disponíveis:**
- Total de campanhas
- Campanhas com mindmap
- Taxa de adoção de mindmaps
- Total de nós
- Total de conexões
- Atividade recente

**Modelos Relacionados:**
- `MindmapNode` - Nós do mapa mental
- `MindmapEdge` - Conexões entre nós
- `MindmapNodeFile` - Arquivos anexados aos nós

---

## 🔐 Sistema de Permissões e Roles

### Verificação de Roles

**Método Usado:** `hasRole('admin')`

**Localização de Uso:**
- `AdminMiddleware.php`
- `TagPolicy.php`
- `MergeTagsRequest.php`
- `BulkImportTagsRequest.php`

**Observação:** O método `hasRole()` é chamado mas a implementação não foi encontrada nos arquivos analisados. Pode ser:
1. Implementação customizada no modelo User
2. Método mágico através de acesso a campo de role
3. Trait ou pacote não identificado

**Recomendação:** Verificar implementação do sistema de roles para garantir segurança

---

## 📈 Funcionalidades de Moderação Disponíveis

### 1. **ModerationAction**

Permite ações administrativas como:
- Bloqueio temporário/permanente
- Suspensão de conteúdo
- Moderação de usuários, posts, comentários

### 2. **AdminAuditLog**

Registra todas as ações administrativas para:
- Auditoria
- Compliance
- Rastreamento de mudanças
- Segurança

---

## 🚀 Recomendações de Melhorias

### 1. **Recursos Prioritários a Implementar:**

#### **UserResource Completo**
- Implementar formulários completos
- Adicionar campos editáveis
- Implementar ações em massa
- Adicionar filtros avançados

#### **PostResource**
- Criar Resource completo para Posts
- Adicionar funcionalidades de moderação
- Filtros por autor, data, visibilidade
- Ações de moderação rápida

#### **TagResource**
- Criar Resource do Filament para Tags
- Interface visual para gerenciamento
- Estatísticas de uso
- Moderação de tags

#### **CommentResource**
- Resource para moderação de comentários
- Filtros e buscas
- Ações de moderação

### 2. **Funcionalidades Adicionais:**

- **Dashboard Administrativo:** Estatísticas gerais do sistema
- **Relatórios:** Usuários, campanhas, posts, etc.
- **Logs de Sistema:** Visualização de logs de aplicação
- **Gerenciamento de Notificações:** Envio em massa
- **Backup e Restore:** Ferramentas de backup
- **Configurações do Sistema:** Configurações globais

### 3. **Segurança:**

- Implementar sistema de roles/permissions robusto
- Adicionar verificação de permissões granulares
- Implementar 2FA para administradores
- Logs de segurança mais detalhados

---

## 📝 Resumo dos Modelos Controláveis

| Modelo | Status | Resource Filament | Páginas | Funcionalidades |
|--------|--------|------------------|---------|-----------------|
| **Campaign** | ✅ Completo | ✅ Sim | List, Create, View, Edit | CRUD completo |
| **Character** | ✅ Completo | ✅ Sim | List, Create, View, Edit | CRUD completo |
| **User** | ⚠️ Parcial | ⚠️ Sim (incompleto) | List apenas | Listagem básica |
| **Post** | ❌ Não | ❌ Não | - | Via API apenas |
| **Tag** | ⚠️ Indireto | ❌ Não | - | Via Policies |
| **Comment** | ❌ Não | ❌ Não | - | Via API apenas |
| **MindmapNode** | ✅ Via Controller | ❌ Não | - | API Admin |
| **MindmapEdge** | ✅ Via Controller | ❌ Não | - | API Admin |
| **ModerationAction** | ⚠️ Modelo apenas | ❌ Não | - | - |
| **AdminAuditLog** | ⚠️ Modelo apenas | ❌ Não | - | - |

---

## 🔗 Acesso ao Painel Admin

**URL:** `/sg_admin`

**Autenticação:**
- Login próprio do Filament
- Requer usuário com role 'admin'

**Middleware:**
- Autenticação de sessão
- Verificação CSRF
- Middlewares padrão do Filament

---

## 📚 Arquivos Relacionados

### Providers
- `app/Providers/Filament/SgAdminPanelProvider.php`

### Resources
- `app/Filament/Resources/CampaignResource.php`
- `app/Filament/Resources/CharacterResource.php`
- `app/Filament/Resources/UserResource/` (parcial)

### Controllers Admin
- `app/Http/Controllers/Admin/MindmapController.php`

### Middleware
- `app/Http/Middleware/AdminMiddleware.php`

### Models
- `app/Models/AdminAuditLog.php`
- `app/Models/ModerationAction.php`

### Policies (com verificações admin)
- `app/Policies/TagPolicy.php`
- `app/Policies/CampaignPolicy.php`
- `app/Policies/CharacterPolicy.php`
- `app/Policies/PostPolicy.php`

---

## 📅 Data da Análise

Análise realizada em: Janeiro 2025

**Versão da Aplicação:** Laravel 12.0 com Filament 4.0

---

## ⚠️ Observações Importantes

1. **Sistema de Roles:** O método `hasRole('admin')` é usado mas a implementação precisa ser verificada para garantir segurança adequada.

2. **UserResource Incompleto:** O Resource de usuários existe mas está incompleto, limitando o gerenciamento de usuários pelo admin.

3. **Falta de Resources:** Vários modelos importantes (Post, Comment, Tag) não têm Resources do Filament, dificultando o gerenciamento visual.

4. **Mindmap:** Gerenciamento via controller customizado, poderia ser migrado para Resource do Filament para melhor integração.

---

**Conclusão:** O módulo de administração está funcional para Campanhas e Personagens, mas precisa de melhorias para cobertura completa de todos os modelos da aplicação.
