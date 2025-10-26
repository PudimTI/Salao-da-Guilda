# Exemplos de Uso do Sistema de Tags

## 1. Criando Tags

### Via API

```bash
# Criar uma tag simples
curl -X POST http://localhost:8000/api/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "D&D",
    "type": "campaign",
    "description": "Dungeons & Dragons",
    "synonyms": ["dnd", "dungeons and dragons", "5e"]
  }'

# Criar uma tag para posts
curl -X POST http://localhost:8000/api/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Fantasy",
    "type": "post",
    "description": "Posts sobre fantasia",
    "synonyms": ["fantasia", "medieval"]
  }'
```

### Via Código PHP

```php
use App\Models\Tag;

// Criar tag simples
$tag = Tag::create([
    'name' => 'D&D',
    'type' => 'campaign',
    'description' => 'Dungeons & Dragons',
    'synonyms' => ['dnd', 'dungeons and dragons', '5e']
]);

// Criar tag com sinônimos
$tag = Tag::create([
    'name' => 'Sci-Fi',
    'type' => 'campaign',
    'description' => 'Science Fiction campaigns',
    'synonyms' => ['futurista', 'espacial', 'cyberpunk']
]);
```

## 2. Buscando Tags

### Autocomplete

```bash
# Buscar tags que contenham "dnd"
curl "http://localhost:8000/api/tags/autocomplete?q=dnd&type=campaign&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Listar Tags com Filtros

```bash
# Listar todas as tags
curl "http://localhost:8000/api/tags" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Listar tags por tipo
curl "http://localhost:8000/api/tags?type=campaign" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Listar tags moderadas
curl "http://localhost:8000/api/tags?moderated=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Buscar tags por nome
curl "http://localhost:8000/api/tags?search=fantasy" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Tags Populares

```bash
# Buscar tags populares
curl "http://localhost:8000/api/tags/popular?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Buscar tags populares por tipo
curl "http://localhost:8000/api/tags/popular?type=campaign&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 3. Criando Posts com Tags

### Via API

```bash
# Criar post com tags
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Nova campanha de D&D iniciando! Procuramos jogadores interessados em uma aventura épica.",
    "visibility": "public",
    "tags": [1, 2, 3]
  }'
```

### Via Código PHP

```php
use App\Models\Post;
use App\Services\TagService;

// Criar post
$post = Post::create([
    'author_id' => Auth::id(),
    'content' => 'Nova campanha de D&D iniciando!',
    'visibility' => 'public'
]);

// Associar tags
$tagService = new TagService();
$tagService->attachToPost($post, [1, 2, 3]);
```

## 4. Filtrando Posts por Tags

### Via API

```bash
# Buscar posts que tenham as tags com IDs 1 e 2
curl "http://localhost:8000/api/posts?tags[]=1&tags[]=2" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Buscar posts com busca por conteúdo e tags
curl "http://localhost:8000/api/posts?search=dnd&tags[]=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Via Código PHP

```php
use App\Models\Post;

// Buscar posts por tags
$posts = Post::whereHas('tags', function ($query) {
    $query->whereIn('tags.id', [1, 2, 3]);
})->get();

// Buscar posts com tags específicas
$posts = Post::with(['tags', 'author'])
    ->whereHas('tags', function ($query) {
        $query->where('tags.name', 'D&D');
    })
    ->get();
```

## 5. Funcionalidades Administrativas

### Merge de Tags

```bash
# Fazer merge de tags (apenas admin)
curl -X POST http://localhost:8000/api/tags/merge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "source_tag_ids": [1, 2, 3],
    "target_tag_id": 4
  }'
```

### Importação em Lote

```bash
# Importar múltiplas tags (apenas admin)
curl -X POST http://localhost:8000/api/tags/bulk-import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
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
      },
      {
        "name": "Horror",
        "type": "campaign",
        "description": "Horror campaigns",
        "synonyms": ["terror", "medo"]
      }
    ]
  }'
```

### Moderação de Tags

```bash
# Moderar uma tag (apenas admin)
curl -X POST http://localhost:8000/api/tags/1/moderate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "is_moderated": true
  }'
```

## 6. Usando o TagService

### Busca com Autocomplete

```php
use App\Services\TagService;

$tagService = new TagService();

// Buscar tags para autocomplete
$tags = $tagService->autocomplete('dnd', 'campaign', 10);

// Buscar tags populares
$popularTags = $tagService->getPopularTags(20, 'campaign');

// Buscar tags para usuário (baseado nos filtros)
$userTags = $tagService->getTagsForUser(Auth::id(), 'campaign');
```

### Criação e Associação

```php
use App\Services\TagService;

$tagService = new TagService();

// Criar ou encontrar tag
$tag = $tagService->createOrFind('D&D', 'campaign', ['dnd', '5e']);

// Associar tags a post
$tagService->attachToPost($post, [1, 2, 3]);

// Associar tags a campanha
$tagService->attachToCampaign($campaign, [1, 2, 3]);
```

### Merge de Tags

```php
use App\Services\TagService;

$tagService = new TagService();

// Fazer merge de tags
$targetTag = $tagService->mergeTags([1, 2, 3], 4);
```

## 7. Integração com Scout/Meilisearch

### Configuração

```bash
# Indexar tags
php artisan scout:import "App\Models\Tag"

# Indexar posts (já inclui tags)
php artisan scout:import "App\Models\Post"

# Indexar campanhas (já inclui tags)
php artisan scout:import "App\Models\Campaign"
```

### Busca com Scout

```php
use App\Models\Tag;

// Buscar tags usando Scout
$tags = Tag::search('dnd')->get();

// Buscar tags com filtros
$tags = Tag::search('fantasy')
    ->where('type', 'campaign')
    ->get();
```

## 8. Exemplos de Frontend (JavaScript)

### Autocomplete de Tags

```javascript
// Função para buscar tags para autocomplete
async function searchTags(query, type = null) {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    
    const response = await fetch(`/api/tags/autocomplete?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    return await response.json();
}

// Exemplo de uso
searchTags('dnd', 'campaign').then(data => {
    console.log('Tags encontradas:', data.data);
});
```

### Criar Post com Tags

```javascript
// Função para criar post com tags
async function createPostWithTags(content, tagIds) {
    const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            content: content,
            visibility: 'public',
            tags: tagIds
        })
    });
    
    return await response.json();
}

// Exemplo de uso
createPostWithTags('Nova campanha de D&D!', [1, 2, 3])
    .then(data => console.log('Post criado:', data));
```

### Filtrar Posts por Tags

```javascript
// Função para filtrar posts por tags
async function getPostsByTags(tagIds) {
    const params = new URLSearchParams();
    tagIds.forEach(id => params.append('tags[]', id));
    
    const response = await fetch(`/api/posts?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    return await response.json();
}

// Exemplo de uso
getPostsByTags([1, 2]).then(data => {
    console.log('Posts encontrados:', data.posts);
});
```

## 9. Exemplos de Validação

### Validar Tags antes de Criar

```javascript
// Validar se as tags existem antes de criar post
async function validateTags(tagIds) {
    const response = await fetch('/api/tags', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    const existingTagIds = data.data.map(tag => tag.id);
    
    return tagIds.every(id => existingTagIds.includes(id));
}

// Exemplo de uso
validateTags([1, 2, 3]).then(isValid => {
    if (isValid) {
        console.log('Todas as tags são válidas');
    } else {
        console.log('Algumas tags não existem');
    }
});
```

## 10. Exemplos de Tratamento de Erros

### Tratamento de Erros na API

```javascript
// Função com tratamento de erros
async function createTagWithErrorHandling(tagData) {
    try {
        const response = await fetch('/api/tags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(tagData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar tag');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro:', error.message);
        throw error;
    }
}

// Exemplo de uso
createTagWithErrorHandling({
    name: 'D&D',
    type: 'campaign'
}).then(data => {
    console.log('Tag criada com sucesso:', data);
}).catch(error => {
    console.error('Falha ao criar tag:', error.message);
});
```

Estes exemplos mostram como usar o sistema de tags de forma completa, desde a criação até a busca e filtragem, incluindo funcionalidades administrativas e integração com frontend.
