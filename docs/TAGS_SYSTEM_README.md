# Sistema de Tags - Documentação Completa

## Visão Geral

O sistema de tags foi implementado para permitir categorização flexível de posts, campanhas e preferências de usuários. Inclui funcionalidades avançadas como busca, autocomplete, moderação, merge de tags e importação em lote.

## Estrutura do Banco de Dados

### Tabelas Principais

#### `tags`
```sql
CREATE TABLE tags (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    type VARCHAR(30), -- 'post', 'campaign', 'general'
    description TEXT,
    synonyms JSONB,
    usage_count INTEGER DEFAULT 0,
    is_moderated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### `post_tags` (Tabela Pivot)
```sql
CREATE TABLE post_tags (
    post_id BIGINT,
    tag_id BIGINT,
    created_at TIMESTAMP,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

#### `campaign_tags` (Tabela Pivot)
```sql
CREATE TABLE campaign_tags (
    campaign_id BIGINT,
    tag_id BIGINT,
    created_at TIMESTAMP,
    PRIMARY KEY (campaign_id, tag_id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

## Funcionalidades Implementadas

### 1. CRUD de Tags

#### Endpoints Disponíveis

- `GET /api/tags` - Listar tags com filtros e paginação
- `GET /api/tags/{tag}` - Exibir tag específica
- `POST /api/tags` - Criar nova tag
- `PUT /api/tags/{tag}` - Atualizar tag
- `DELETE /api/tags/{tag}` - Deletar tag

#### Exemplo de Criação de Tag

```json
POST /api/tags
{
    "name": "D&D",
    "type": "campaign",
    "description": "Dungeons & Dragons",
    "synonyms": ["dnd", "dungeons and dragons", "5e"],
    "is_moderated": false
}
```

### 2. Busca e Autocomplete

#### Endpoint de Autocomplete
```
GET /api/tags/autocomplete?q=dnd&type=campaign&limit=10
```

**Parâmetros:**
- `q` (obrigatório): Termo de busca
- `type` (opcional): Tipo da tag ('post', 'campaign', 'general')
- `limit` (opcional): Limite de resultados (1-20, padrão: 10)

**Resposta:**
```json
{
    "data": [
        {
            "id": 1,
            "name": "D&D",
            "type": "campaign",
            "usage_count": 25
        }
    ]
}
```

### 3. Funcionalidades Administrativas

#### Merge de Tags
```
POST /api/tags/merge
{
    "source_tag_ids": [1, 2, 3],
    "target_tag_id": 4
}
```

#### Importação em Lote
```
POST /api/tags/bulk-import
{
    "tags": [
        {
            "name": "Fantasy",
            "type": "campaign",
            "description": "Fantasy campaigns",
            "synonyms": ["fantasia", "medieval"]
        },
        {
            "name": "Sci-Fi",
            "type": "campaign",
            "description": "Science Fiction campaigns",
            "synonyms": ["futurista", "espacial"]
        }
    ]
}
```

#### Moderação de Tags
```
POST /api/tags/{tag}/moderate
{
    "is_moderated": true
}
```

### 4. Integração com Posts

#### Criar Post com Tags
```json
POST /api/posts
{
    "content": "Nova campanha de D&D!",
    "visibility": "public",
    "tags": [1, 2, 3]
}
```

#### Filtrar Posts por Tags
```
GET /api/posts?tags[]=1&tags[]=2
```

### 5. Integração com Campanhas

O sistema já estava integrado com campanhas. As tags podem ser associadas durante a criação/edição de campanhas.

## Configuração do Scout/Meilisearch

### 1. Instalação

Se você ainda não tem o Scout configurado:

```bash
composer require laravel/scout
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

### 2. Configuração do Meilisearch

No arquivo `.env`:
```env
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=your-master-key
```

### 3. Indexação

```bash
# Indexar tags
php artisan scout:import "App\Models\Tag"

# Indexar posts (já inclui tags)
php artisan scout:import "App\Models\Post"

# Indexar campanhas (já inclui tags)
php artisan scout:import "App\Models\Campaign"
```

### 4. Busca com Scout

O modelo Tag já está configurado para ser indexado pelo Scout. A busca inclui:
- Nome da tag
- Tipo
- Descrição
- Sinônimos
- Contador de uso

## Políticas de Autorização

### TagPolicy

- **viewAny/view**: Todos podem ver tags
- **create**: Todos podem criar tags
- **update**: Apenas administradores podem editar tags
- **delete**: Apenas administradores podem deletar tags
- **moderate**: Apenas administradores podem moderar tags
- **merge**: Apenas administradores podem fazer merge de tags
- **bulkImport**: Apenas administradores podem importar tags em lote

## Middleware

### AdminMiddleware

Verifica se o usuário autenticado tem permissão de administrador antes de permitir acesso a funcionalidades administrativas.

## Serviços

### TagService

Centraliza toda a lógica de negócio relacionada a tags:

- `autocomplete()`: Busca tags para autocomplete
- `createOrFind()`: Cria ou encontra tag
- `attachToPost()`: Associa tags a posts
- `attachToCampaign()`: Associa tags a campanhas
- `mergeTags()`: Faz merge de tags (transacional)
- `bulkImport()`: Importa tags em lote
- `getPopularTags()`: Busca tags populares
- `getTagsForUser()`: Busca tags baseadas nos filtros do usuário

## Validações

### StoreTagRequest
- Nome obrigatório, único, 2-100 caracteres
- Tipo opcional, valores: 'post', 'campaign', 'general'
- Descrição opcional, máximo 500 caracteres
- Sinônimos opcional, máximo 10, cada um com 100 caracteres

### UpdateTagRequest
- Mesmas validações do StoreTagRequest, mas ignora o próprio registro na validação de unicidade

### MergeTagsRequest
- IDs das tags fonte obrigatórios, máximo 10
- ID da tag alvo obrigatório e diferente das tags fonte

### BulkImportTagsRequest
- Array de tags obrigatório, máximo 100
- Cada tag deve seguir as validações do StoreTagRequest

## Logs e Auditoria

### Logs de Ação

Todas as operações administrativas são logadas:
- Criação de tags
- Atualização de tags
- Deleção de tags
- Merge de tags
- Importação em lote
- Moderação de tags

### Audit Log (se disponível)

Se o modelo `AdminAuditLog` estiver disponível, as ações administrativas serão registradas automaticamente.

## Exemplos de Uso

### 1. Buscar Tags por Nome

```javascript
// Buscar tags que contenham "dnd"
fetch('/api/tags/autocomplete?q=dnd')
    .then(response => response.json())
    .then(data => console.log(data.data));
```

### 2. Criar Post com Tags

```javascript
const postData = {
    content: "Nova campanha de D&D iniciando!",
    visibility: "public",
    tags: [1, 2, 3] // IDs das tags
};

fetch('/api/posts', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(postData)
});
```

### 3. Filtrar Posts por Tags

```javascript
// Buscar posts que tenham as tags com IDs 1 e 2
fetch('/api/posts?tags[]=1&tags[]=2')
    .then(response => response.json())
    .then(data => console.log(data.posts));
```

### 4. Fazer Merge de Tags (Admin)

```javascript
const mergeData = {
    source_tag_ids: [1, 2, 3],
    target_tag_id: 4
};

fetch('/api/tags/merge', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + adminToken
    },
    body: JSON.stringify(mergeData)
});
```

## Migrações

Execute as migrações para criar as tabelas necessárias:

```bash
php artisan migrate
```

## Testes

Para testar o sistema de tags:

1. **Criar tags**: Use o endpoint POST /api/tags
2. **Buscar tags**: Use o endpoint GET /api/tags/autocomplete
3. **Associar tags a posts**: Use o campo 'tags' no POST /api/posts
4. **Filtrar posts por tags**: Use o parâmetro 'tags[]' no GET /api/posts
5. **Funcionalidades administrativas**: Use os endpoints específicos com token de admin

## Considerações de Performance

- Tags são indexadas pelo Scout para busca rápida
- Contador de uso é mantido automaticamente
- Relacionamentos são otimizados com índices apropriados
- Busca por sinônimos usa JSONB para eficiência

## Extensibilidade

O sistema foi projetado para ser facilmente extensível:

- Novos tipos de tags podem ser adicionados
- Novos relacionamentos podem ser criados
- Funcionalidades de moderação podem ser expandidas
- Sistema de sinônimos pode ser aprimorado
