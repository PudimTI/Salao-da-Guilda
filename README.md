# 🎲 Salão da Guilda - Redes Social para Jogadores de RPG

<p align="center">
  <img src="public/src/Logo.png" alt="Salão da Guilda" width="200">
</p>

<p align="center">
  Plataforma completa para criação, gerenciamento e participação em campanhas de RPG.
</p>

## Sobre o Projeto

Este é um Trabalho de Graduação para o curso de ADS, criado atraves de um longo processo de pesquisa e levantamento de dados para atingir a resulução satisfatoria de um problema que foi identificado e documentado no documento escrito do Trabalho de Graduação com tematica: Criação de uma Aplicação Web para jogadores de RPG: Salão da Guilda.

**Salão da Guilda** é uma rede social dedicada a jogadores de RPG (Role Playing Games). A plataforma oferece ferramentas para criar campanhas, gerenciar personagens, interagir socialmente, participar de chats em tempo real e muito mais.

- **Equipe Salão da Guilda**

- Gabriel Janotto Pereira
- Júlia Emmanuella Frutuoso
- João Pedro Vaz dos Santos Silva
- Kelvyn Cortez Lovato

### Características Principais

- **Sistema de Campanhas**: Crie e gerencie campanhas de RPG com suporte a múltiplos sistemas
- **Rede Social**: Sistema completo de amizades e interações sociais
- **Chat em Tempo Real**: Chat de campanha e mensagens diretas com WebSockets
- **Gerenciamento de Personagens**: Sistema completo de CRUD para personagens
- **Feed Social**: Postagens com sistema de likes, comentários e reposts
- **Sistema de Tags**: Categorização e filtragem inteligente de conteúdo
- **Mapas Mentais**: Editor visual colaborativo para campanhas
- **Rolagem de Dados**: Sistema integrado de rolagem de dados
- **Busca Avançada**: Full-text search com Meilisearch
- **Sistema de Recomendações**: Algoritmo inteligente de sugestões personalizadas

## Tecnologias Utilizadas

### Backend
- **Laravel 12** - Framework PHP moderno
- **PostgreSQL/MySQL** - Banco de dados relacional
- **Pusher** - WebSockets para comunicação em tempo real
- **Meilisearch** - Motor de busca full-text
- **Redis** - Cache e filas de processamento
- **Laravel Sanctum** - Autenticação API
- **Filament PHP** - Painel administrativo

### Frontend
- **React 19** - Biblioteca JavaScript
- **Vite** - Build tool moderna
- **Tailwind CSS 4.0** - Framework CSS utilitário
- **Axios** - Cliente HTTP
- **Laravel Echo** - Integração WebSockets
- **Pusher JS** - Comunicação em tempo real

## Instalação

### Pré-requisitos

- PHP 8.2 ou superior
- Composer
- Node.js 18+ e npm
- PostgreSQL/MySQL
- Redis (opcional)
- Meilisearch (opcional)

### Configuração Rápida

1. **Clone o repositório**
```bash
git clone <repository-url>
cd laravel-project
```

2. **Instale as dependências**
```bash
# Backend
composer install

# Frontend
npm install
```

3. **Configure o ambiente**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Configure o banco de dados no `.env`**
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=salao_guilda
DB_USERNAME=postgres
DB_PASSWORD=
```

5. **Execute as migrações**
```bash
php artisan migrate
```

6. **Compile os assets**
```bash
npm run build
# ou para desenvolvimento
npm run dev
```

7. **Inicie os servidores**
```bash
# Terminal 1: Laravel
php artisan serve

# Terminal 2: Vite (desenvolvimento)
npm run dev
```

8. **Acesse a aplicação**
```
http://localhost:8000
```

## Funcionalidades Detalhadas

### Sistema de Campanhas

- CRUD completo de campanhas
- Suporte a múltiplos sistemas RPG (D&D, Pathfinder, Call of Cthulhu, etc.)
- Sistema de convites (por email e por solicitação)
- Gerenciamento de membros com roles (Dono, Mestre, Co-Mestre, Jogador)
- Chat integrado por campanha
- Mapas mentais colaborativos
- Sistema de tags para categorização
- Upload de arquivos e documentos
- Controle de visibilidade (pública/privada)
- Estados de campanha (aberta, fechada, ativa, pausada)

**Documentação**: [`ANALISE_MODULO_CAMPANHAS.md`](ANALISE_MODULO_CAMPANHAS.md) | [`SISTEMA_CONVITES_IMPLEMENTADO.md`](SISTEMA_CONVITES_IMPLEMENTADO.md)

### Sistema de Amizades

- Envio e recebimento de solicitações
- Aceitar/rejeitar amizades
- Bloqueio/desbloqueio de usuários
- Notificações em tempo real
- Sistema de status de relacionamento
- Listagem de amigos com busca e filtros
- Perfis de amigos com estatísticas

**Documentação**: [`FRIENDSHIP_API_DOCUMENTATION.md`](FRIENDSHIP_API_DOCUMENTATION.md) | [`FRIENDSHIP_FRONTEND_INTEGRATION_COMPLETE.md`](FRIENDSHIP_FRONTEND_INTEGRATION_COMPLETE.md)

### Sistema de Chat

- Chat em tempo real com Pusher
- Mensagens diretas (DM) entre usuários
- Chat de campanha
- Indicadores de digitação
- Upload de mídia (imagens, vídeos, documentos)
- Histórico de mensagens com paginação
- Busca de usuários para iniciar conversas
- Notificações de mensagens

**Documentação**: [`CHAT_IMPLEMENTATION_README.md`](CHAT_IMPLEMENTATION_README.md) | [`CHAT_DM_REACT_COMPONENTS_README.md`](CHAT_DM_REACT_COMPONENTS_README.md)

### Gerenciamento de Personagens

- CRUD completo de personagens
- Fichas personalizadas por sistema de RPG
- Vinculação a múltiplas campanhas
- Controle de disponibilidade
- Níveis, raças, classes
- Histórico de participações
- Sistema de roles nas campanhas

**Documentação**: [`CHARACTER_CRUD_README.md`](CHARACTER_CRUD_README.md)

### Sistema de Feed Social

- Criação de posts com texto e mídia
- Sistema de likes, comentários e reposts
- Mencionar usuários em posts
- Controle de visibilidade
- Filtragem por tags
- Timeline personalizada
- Interações em tempo real

### Sistema de Tags

- Autocomplete inteligente
- Categorização por tipo (post, campaign, general)
- Busca avançada com filtros
- Moderação administrativa
- Merge de tags
- Importação em lote
- Tags populares e trending

**Documentação**: [`TAGS_SYSTEM_README.md`](TAGS_SYSTEM_README.md) | [`TAGS_USAGE_EXAMPLES.md`](TAGS_USAGE_EXAMPLES.md)

### Mapas Mentais

- Editor visual de mapas mentais
- Criação de nós com título e notas
- Conexões entre nós com rótulos
- Drag & drop para reposicionamento
- Associação de arquivos aos nós
- Colaboração em tempo real (planejado)
- Exportação de mapas

**Documentação**: [`MINDMAP_API_DOCUMENTATION.md`](MINDMAP_API_DOCUMENTATION.md) | [`MINDMAP_FRONTEND_INTEGRATION.md`](MINDMAP_FRONTEND_INTEGRATION.md)

### Sistema de Recomendações

- Algoritmo de recomendação baseado em:
  - Preferências do usuário (40%)
  - Tags e similaridade (30%)
  - Histórico de interações (20%)
  - Rede de amigos (10%)
- Cache para performance
- Jobs para processamento em lote
- Comandos CLI para geração

**Documentação**: [`RECOMMENDATION_SYSTEM_README.md`](RECOMMENDATION_SYSTEM_README.md)

### Perfil de Usuário

- Visualização e edição de perfil
- Upload de avatar
- Estatísticas (personagens, campanhas, posts, conexões)
- Histórico de atividades
- Configurações de preferências
- Filtros personalizados (whitelist/blacklist de tags)

**Documentação**: [`PROFILE_BACKEND_README.md`](PROFILE_BACKEND_README.md) | [`PROFILE_LAYOUT_README.md`](PROFILE_LAYOUT_README.md)

## Configuração Avançada

### Pusher (WebSockets)

```env
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=mt1
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

### Meilisearch (Busca)

```env
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=your-master-key
```

### Redis (Cache e Filas)

```env
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

**Documentação**: [`CONFIGURACAO.md`](CONFIGURACAO.md) | [`MEILISEARCH_SETUP.md`](MEILISEARCH_SETUP.md) | [`SCOUT_SETUP.md`](SCOUT_SETUP.md)

## 📱 Estrutura do Frontend

### Componentes Principais

- **Header.jsx** - Navegação principal com dropdowns
- **Hero.jsx** - Seção hero da homepage
- **CampaignCard.jsx** - Cards de campanhas
- **ChatInterface.jsx** - Interface de chat
- **ProfilePage.jsx** - Página de perfil do usuário
- **FeedPage.jsx** - Feed social
- **TagSelector.jsx** - Seletor de tags com autocomplete

**Documentação**: [`FRONTEND_STRUCTURE.md`](FRONTEND_STRUCTURE.md) | [`REACT_COMPONENTS.md`](REACT_COMPONENTS.md) | [`PAGINAS_DISPONIVEIS.md`](PAGINAS_DISPONIVEIS.md)

## Design System

- **Paleta**: Tema roxo/pink como cor principal
- **Framework**: Tailwind CSS 4.0
- **Layout**: Responsivo mobile-first
- **Componentes**: Reutilizáveis e modulares
- **Estados**: Loading, error, success, empty

**Documentação**: [`PURPLE_THEME_README.md`](PURPLE_THEME_README.md) | [`FRONTEND_TAGS_INTEGRATION.md`](FRONTEND_TAGS_INTEGRATION.md) | [`HEADER_FOOTER_INTEGRATION.md`](HEADER_FOOTER_INTEGRATION.md)

## Estrutura de Dados

### Tabelas Principais

- **users** - Usuários do sistema
- **campaigns** - Campanhas de RPG
- **characters** - Personagens dos jogadores
- **posts** - Posts do feed social
- **friendships** - Amizades entre usuários
- **conversations** - Conversas de chat
- **messages** - Mensagens
- **tags** - Sistema de tags
- **notifications** - Notificações
- **campaign_members** - Membros de campanhas
- **campaign_invites** - Convites para campanhas

### Relacionamentos

- **Users ↔ Campaigns** (many-to-many via campaign_members)
- **Users ↔ Characters** (one-to-many)
- **Campaigns ↔ Characters** (many-to-many)
- **Posts ↔ Tags** (many-to-many via post_tags)
- **Campaigns ↔ Tags** (many-to-many via campaign_tags)
- **Users ↔ Messages** (one-to-many)
- **Users ↔ Friendships** (self-referencing)

**Diagrama**: [`user_connections_diagram.md`](user_connections_diagram.md)

## Principais Rotas

```
/                    - Homepage
/feed                - Feed social
/campanhas           - Lista de campanhas
/campanhas/create    - Criar campanha
/campanhas/{id}      - Detalhes da campanha
/encontrar           - Buscar campanhas
/perfil              - Perfil do usuário
/amigos              - Gerenciar amizades
/notificacoes        - Notificações
```

## Segurança

- Autenticação com Laravel Sanctum
- Autorização com Policies
- Validação de dados com Form Requests
- Proteção CSRF
- Sanitização de inputs
- SQL injection protection (Eloquent ORM)
- XSS protection
- Rate limiting

## 🚀 Deploy

### Produção

```bash
# Compilar assets
npm run build

# Otimizar aplicação
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Setup de migrações
php artisan migrate --force

# Iniciar workers de fila
php artisan queue:work
```

### Variáveis de Ambiente Importantes

```env
APP_ENV=production
APP_DEBUG=false
LOG_LEVEL=error
```

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Documentação Adicional

- [Configuração](CONFIGURACAO.md)
- [Estrutura Frontend](FRONTEND_STRUCTURE.md)
- [Componentes React](REACT_COMPONENTS.md)
- [Sistema de Chat](CHAT_IMPLEMENTATION_README.md)
- [Sistema de Amizades](FRIENDSHIP_API_DOCUMENTATION.md)
- [Sistema de Tags](TAGS_SYSTEM_README.md)
- [Sistema de Recomendações](RECOMMENDATION_SYSTEM_README.md)
- [Mapas Mentais](MINDMAP_API_DOCUMENTATION.md)
- [CRUD de Personagens](CHARACTER_CRUD_README.md)


## Autores

- **Equipe Salão da Guilda**

Gabriel Janotto Pereira
Júlia Emmanuella Frutuoso
João Pedro Vaz dos Santos Silva
Kelvyn Cortez Lovato

---
