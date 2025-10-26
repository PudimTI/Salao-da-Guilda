# Backend do Perfil de Usuário - Salão da Guilda

## Visão Geral

Este documento descreve a implementação completa do backend para o módulo de perfil de usuário, integrando com o frontend React existente e substituindo os dados mockados por dados reais do sistema.

## Estrutura Implementada

### 1. Controller de Perfil (`app/Http/Controllers/ProfileController.php`)

**Endpoints disponíveis:**

- `GET /api/profile` - Obter dados completos do perfil
- `PUT /api/profile` - Atualizar perfil (nome, bio, avatar)
- `GET /api/profile/characters` - Obter personagens do usuário
- `GET /api/profile/posts` - Obter posts do usuário
- `GET /api/profile/campaigns` - Obter campanhas do usuário
- `PUT /api/profile/preferences` - Atualizar preferências
- `PUT /api/profile/filters` - Atualizar filtros

**Funcionalidades:**
- Carregamento de dados do perfil com estatísticas
- Upload de avatar com armazenamento em `storage/app/public/avatars`
- Gerenciamento de preferências (sistemas, estilos, dinâmicas)
- Gerenciamento de filtros (whitelist/blacklist de tags)
- Contagem de estatísticas (personagens, campanhas, posts, conexões)

### 2. Rotas (`routes/web.php`)

```php
Route::prefix('api/profile')->group(function () {
    Route::get('/', [ProfileController::class, 'show']);
    Route::put('/', [ProfileController::class, 'update']);
    Route::get('/characters', [ProfileController::class, 'characters']);
    Route::get('/posts', [ProfileController::class, 'posts']);
    Route::get('/campaigns', [ProfileController::class, 'campaigns']);
    Route::put('/preferences', [ProfileController::class, 'updatePreferences']);
    Route::put('/filters', [ProfileController::class, 'updateFilters']);
});
```

### 3. Serviço Frontend (`resources/js/services/profileService.js`)

**Classe ProfileService com métodos:**
- `getProfile(userId)` - Obter dados do perfil
- `updateProfile(profileData)` - Atualizar perfil
- `getCharacters(userId)` - Obter personagens
- `getPosts(userId, page)` - Obter posts com paginação
- `getCampaigns(userId)` - Obter campanhas
- `updatePreferences(preferences)` - Atualizar preferências
- `updateFilters(filters)` - Atualizar filtros

### 4. Componentes React Atualizados

#### `UserProfilePage.jsx`
- Substituição de dados mockados por chamadas à API
- Estados de loading e error
- Carregamento paralelo de dados (perfil, personagens, posts)
- Função de recarregamento de dados

#### `UserHeaderCard.jsx`
- Modo de edição inline
- Upload de avatar
- Atualização de nome e biografia
- Exibição de estatísticas reais

## Integração Frontend-Backend

### Dados do Perfil
```javascript
// Estrutura de resposta da API
{
  "user": {
    "id": 1,
    "handle": "usuario123",
    "display_name": "Nome do Usuário",
    "email": "user@example.com",
    "avatar_url": "/storage/avatars/avatar.jpg",
    "bio": "Biografia do usuário",
    "status": "active",
    "last_login_at": "2025-01-27T10:30:00Z"
  },
  "stats": {
    "characters_count": 3,
    "campaigns_created": 2,
    "campaigns_joined": 5,
    "posts_count": 12,
    "connections_count": 8,
    "total_campaigns": 7
  }
}
```

### Personagens
```javascript
// Estrutura de personagens
{
  "characters": [
    {
      "id": 1,
      "name": "Aragorn",
      "system": "D&D 5e",
      "level": 5,
      "class": "Ranger",
      "race": "Human",
      "available": true,
      "campaigns_count": 1
    }
  ]
}
```

### Posts
```javascript
// Estrutura de posts com paginação
{
  "posts": [
    {
      "id": 1,
      "content": "Conteúdo do post",
      "author": {
        "id": 1,
        "display_name": "Nome",
        "handle": "usuario",
        "avatar_url": "/storage/avatars/avatar.jpg"
      },
      "media": [],
      "likes_count": 5,
      "comments_count": 2,
      "created_at": "2025-01-27T10:30:00Z"
      }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 10,
    "total": 25
  }
}
```

## Funcionalidades Implementadas

### ✅ Backend Completo
- Controller com todos os endpoints necessários
- Validação de dados de entrada
- Upload de arquivos (avatar)
- Relacionamentos com modelos existentes
- Tratamento de erros

### ✅ Frontend Integrado
- Substituição de dados mockados
- Estados de loading e error
- Modo de edição inline
- Upload de avatar
- Carregamento assíncrono de dados

### ✅ Recursos Avançados
- Estatísticas em tempo real
- Paginação de posts
- Upload de arquivos
- Validação de formulários
- Tratamento de erros

## Como Usar

1. **Acessar perfil**: Navegue para `/perfil`
2. **Editar perfil**: Clique em "Editar" no cabeçalho do perfil
3. **Upload de avatar**: Selecione uma imagem no modo de edição
4. **Visualizar dados**: Todos os dados são carregados automaticamente da API

## Estrutura de Arquivos

```
app/Http/Controllers/
├── ProfileController.php

resources/js/
├── services/
│   └── profileService.js
└── components/
    ├── UserProfilePage.jsx (atualizado)
    └── UserHeaderCard.jsx (atualizado)

routes/
└── web.php (atualizado)
```

## Próximos Passos

1. **Testes**: Implementar testes unitários para o controller
2. **Cache**: Adicionar cache para estatísticas
3. **Notificações**: Integrar sistema de notificações
4. **Segurança**: Implementar rate limiting
5. **Otimização**: Otimizar queries com eager loading

## Dependências

- Laravel 10+
- React 18+
- Tailwind CSS
- Axios (para requisições HTTP)

O sistema está completamente funcional e integrado, substituindo todos os dados mockados por dados reais do banco de dados.
