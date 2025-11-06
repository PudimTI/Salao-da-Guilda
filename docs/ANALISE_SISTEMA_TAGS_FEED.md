# Análise do Sistema de Tags no Feed

## 📋 Visão Geral

O sistema de tags do Salão da Guilda foi implementado para permitir categorização flexível de posts e campanhas, facilitando a busca, descoberta e organização do conteúdo. Esta análise detalha toda a arquitetura e funcionalidades do sistema.

---

## 🏗️ Arquitetura

### Banco de Dados

#### 1. Tabela `tags`
```sql
CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(30),                    -- 'post', 'campaign', 'general'
    description TEXT,
    synonyms JSONB,                      -- Array de sinônimos
    usage_count INTEGER DEFAULT 0,       -- Contador de uso
    is_moderated BOOLEAN DEFAULT FALSE,  -- Flag de moderação
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Características principais:**
- `name` único para evitar duplicatas
- `type` categoriza a tag por contexto
- `synonyms` permite buscas por termos alternativos
- `usage_count` rastreia popularidade
- `is_moderated` permite controle administrativo

#### 2. Tabela `post_tags` (Pivot)
```sql
CREATE TABLE post_tags (
    post_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

#### 3. Tabela `campaign_tags` (Pivot)
```sql
CREATE TABLE campaign_tags (
    campaign_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    PRIMARY KEY (campaign_id, tag_id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

---

## 🎨 Frontend

### Componentes Principais

#### 1. **TagList** (`resources/js/components/TagList.jsx`)
**Função:** Exibe uma lista de tags com formatação visual

**Props:**
- `tags` (array): Array de objetos tag
- `onTagClick` (function): Callback opcional ao clicar na tag
- `showCount` (boolean): Exibir contador de uso
- `showType` (boolean): Exibir ícone do tipo
- `className` (string): Classes CSS adicionais
- `tagClassName` (string): Classes CSS das tags individuais

**Características:**
- Cores diferenciadas por tipo:
  - **Post:** Azul (`bg-blue-100 text-blue-800 border-blue-200`)
  - **Campaign:** Verde (`bg-green-100 text-green-800 border-green-200`)
  - **General:** Cinza (`bg-gray-100 text-gray-800 border-gray-200`)
- Ícones por tipo:
  - **Post:** 📝
  - **Campaign:** 🎲
  - **General:** 🏷️
- Layout responsivo com flex-wrap

**Uso no Feed:**
```jsx
{post.tags && post.tags.length > 0 && (
    <div className="mt-3">
        <TagList 
            tags={post.tags} 
            showType={true}
            className="gap-1"
            tagClassName="text-xs"
        />
    </div>
)}
```

#### 2. **TagSelector** (`resources/js/components/TagSelector.jsx`)
**Função:** Componente de seleção com autocomplete e criação dinâmica

**Funcionalidades:**
- Autocomplete em tempo real (debounce 300ms)
- Busca em nome e sinônimos
- Criação instantânea de novas tags
- Limite configurável (padrão: 5 tags)
- Filtragem de tags já selecionadas
- Exibição de contador de usos
- Feedback visual de carregamento

**Fluxo de Uso:**
1. Usuário digita no input
2. Sistema busca tags via `/api/tags/autocomplete?q={query}&type={type}`
3. Mostra sugestões com contador de usos
4. Usuário seleciona ou cria nova tag
5. Tag é adicionada à lista selecionada
6. Tag pode ser removida clicando no ×

**Uso no Modal de Criação:**
```jsx
<TagSelector
    selectedTags={tags}
    onTagsChange={setTags}
    type="post"
    placeholder="Adicione tags para categorizar seu post..."
    maxTags={5}
/>
```

#### 3. **TagFilter** (`resources/js/components/TagFilter.jsx`)
**Função:** Filtro de posts por tags populares

**Funcionalidades:**
- Carrega 20 tags mais populares
- Seleção múltipla de tags
- Exibição de tags selecionadas
- Botão "Limpar todos"
- Feedback visual de seleção
- Loading spinner

**Uso no Feed:**
```jsx
<TagFilter
    onFilterChange={setSelectedTags}
    selectedTags={selectedTags}
    type="post"
    className="mb-4"
/>
```

**Integração:**
- Ao mudar tags selecionadas, recarrega posts automaticamente
- Passa `tags[]` via URL params para API
- Filtra por AND (posts devem ter todas as tags)

---

## 🔌 Backend

### Model Tag (`app/Models/Tag.php`)

**Relacionamentos:**
```php
public function campaigns(): BelongsToMany
public function posts(): BelongsToMany
```

**Scopes:**
- `scopeSearchByName(Builder $query, string $search)`: Busca por nome (ilike)
- `scopeByType(Builder $query, string $type)`: Filtra por tipo
- `scopeModerated(Builder $query)`: Apenas tags moderadas
- `scopeSearchBySynonyms(Builder $query, string $search)`: Busca em sinônimos

**Métodos:**
- `incrementUsageCount()`: Incrementa contador
- `decrementUsageCount()`: Decrementa contador

**Searchable (Laravel Scout):**
- Integração com busca full-text
- Indexa: id, name, type, description, synonyms, usage_count

### TagService (`app/Services/TagService.php`)

**Métodos principais:**

#### `autocomplete(string $query, ?string $type, int $limit): Collection`
- Busca em nome e sinônimos (ilike, JSONB contains)
- Filtra por tipo se especificado
- Ordena por popularidade (usage_count DESC) e nome
- Retorna até 10 tags

#### `createOrFind(string $name, ?string $type, array $synonyms): Tag`
- Busca tag existente por nome
- Cria nova se não existir
- Retorna tag (existente ou criada)

#### `attachToPost(Post $post, array $tagIds): void`
- Compara tags atuais vs novas
- Adiciona novas tags ao post
- Incrementa contador de novas tags
- Remove tags desassociadas
- Decrementa contador de tags removidas

#### `attachToCampaign(Campaign $campaign, array $tagIds): void`
- Mesma lógica de `attachToPost` para campanhas

#### `getPopularTags(int $limit, ?string $type): Collection`
- Retorna tags mais usadas
- Filtra por tipo se especificado
- Ordena por usage_count DESC

#### `mergeTags(array $sourceTagIds, int $targetTagId): Tag`
- Funde múltiplas tags em uma
- Move relacionamentos de posts
- Move relacionamentos de campanhas
- Combina sinônimos
- Atualiza contador
- Deleta tags origem
- Transação atômica

### TagController (`app/Http/Controllers/TagController.php`)

**Endpoints públicos (auth:sanctum):**

#### `GET /api/tags`
Lista tags com filtros e paginação
```json
Query params:
- type: 'post' | 'campaign' | 'general'
- moderated: boolean
- search: string
- sort_by: 'name' | 'type' | 'usage_count' | 'created_at'
- sort_order: 'asc' | 'desc'
- per_page: int

Response:
{
  "data": [...tags],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 73
  }
}
```

#### `GET /api/tags/popular`
Tags mais populares
```json
Query params:
- type: 'post' | 'campaign' | 'general'
- limit: int (max 50, default 20)

Response:
{
  "data": [
    {
      "id": 1,
      "name": "D&D",
      "type": "campaign",
      "usage_count": 42
    }
  ]
}
```

#### `GET /api/tags/autocomplete`
Autocomplete para busca
```json
Query params:
- q: string (required, min 1)
- type: 'post' | 'campaign' | 'general'
- limit: int (max 20, default 10)

Response:
{
  "data": [
    {
      "id": 1,
      "name": "D&D",
      "type": "campaign",
      "usage_count": 42
    }
  ]
}
```

#### `POST /api/tags`
Criar nova tag
```json
Request:
{
  "name": "Fantasia Medieval",
  "type": "campaign",
  "description": "Campanhas de fantasia medieval",
  "synonyms": ["medieval", "fantasy", "rpg"]
}

Response:
{
  "message": "Tag criada com sucesso",
  "data": {
    "id": 1,
    "name": "Fantasia Medieval",
    ...
  }
}
```

#### `GET /api/tags/{tag}`
Detalhes de uma tag
```json
Response:
{
  "data": {
    "id": 1,
    "name": "D&D",
    "type": "campaign",
    "description": "Dungeons & Dragons",
    "synonyms": ["dnd", "5e"],
    "usage_count": 42,
    "campaigns": [...],
    "posts": [...]
  }
}
```

**Endpoints administrativos (admin middleware):**

#### `POST /api/tags/merge`
Fundir múltiplas tags
```json
Request:
{
  "source_tag_ids": [2, 3, 4],
  "target_tag_id": 1
}

Response:
{
  "message": "Tags merged com sucesso",
  "data": { /* tag destino atualizada */ }
}
```

#### `POST /api/tags/bulk-import`
Importar tags em lote
```json
Request:
{
  "tags": [
    {
      "name": "Fantasia",
      "type": "campaign",
      "synonyms": ["fantasy"]
    },
    {
      "name": "Sci-Fi",
      "type": "campaign"
    }
  ]
}
```

#### `POST /api/tags/{tag}/moderate`
Moderar/desmoderar tag
```json
Request:
{
  "is_moderated": true
}
```

---

## 🔄 Fluxo Completo no Feed

### 1. Exibição de Posts com Tags

```
Feed.jsx
  ↓
fetchPosts() → GET /api/posts?page=1&tags[]=5&tags[]=12
  ↓
PostController::index()
  ↓
Post::with('tags')->whereHas('tags', ...)
  ↓
Response: posts com array de tags
  ↓
FeedPost.jsx renderiza TagList
  ↓
TagList exibe tags com cores/ícones
```

### 2. Criação de Post com Tags

```
CreatePostModal
  ↓
Usuário digita → TagSelector::searchTags()
  ↓
GET /api/tags/autocomplete?q=dnd&type=post
  ↓
TagService::autocomplete()
  ↓
Retorna sugestões
  ↓
Usuário seleciona/cria tags
  ↓
submit() → POST /api/posts
  ↓
FormData com tags: JSON.stringify([1, 2, 3])
  ↓
PostController::store()
  ↓
TagService::attachToPost($post, [1, 2, 3])
  ↓
DB::table('post_tags')->insert(...)
  ↓
Tag::increment('usage_count')
  ↓
Post criado com tags!
```

### 3. Filtro de Posts por Tags

```
Feed.jsx
  ↓
selectedTags muda
  ↓
useEffect() detecta mudança
  ↓
fetchPosts(1) com novos tags[]
  ↓
PostController::index()
  ↓
Post::whereHas('tags', whereIn('tags.id', [5, 12]))
  ↓
Retorna apenas posts com TODAS as tags
  ↓
Feed exibe posts filtrados
```

---

## 🎯 Funcionalidades Avançadas

### 1. Busca por Sinônimos
- Tags podem ter sinônimos em JSONB
- Autocomplete busca em sinônimos também
- Exemplo: tag "D&D" tem sinônimos ["dnd", "5e", "dungeons and dragons"]

### 2. Contador de Uso
- `usage_count` atualiza automaticamente
- Ordena resultados por popularidade
- Permite identificar tendências

### 3. Moderação
- Flag `is_moderated` para controle de qualidade
- Admins podem moderar tags
- Filtros podem excluir tags não moderadas

### 4. Merge de Tags
- Admins podem fundir tags duplicadas
- Move todos os relacionamentos
- Combina sinônimos
- Atômico via transação

### 5. Importação em Lote
- Admins podem importar tags em massa
- Útil para inicialização
- Evita duplicatas

---

## 📊 Performance

### Otimizações

1. **Debounce no Autocomplete:**
   - 300ms entre buscas
   - Evita sobrecarga de requisições

2. **Índices no Banco:**
   - `tags(name)` único
   - `tags(usage_count)` para ordenação
   - Índices em `post_tags(post_id, tag_id)`
   - GIN index em `tags(synonyms)` para JSONB

3. **Laravel Scout:**
   - Busca full-text indexada
   - Muito mais rápido que LIKE

4. **Eager Loading:**
   - Posts carregam tags em uma query
   - Evita N+1

5. **Paginação:**
   - Limite de 10/15/20 itens
   - Reduz carga no frontend

---

## 🧪 Casos de Uso

### 1. Usuário cria post sobre D&D
```
1. Abre modal de criação
2. Digita "dnd" no TagSelector
3. Sistema sugere: "D&D" (42 usos)
4. Usuário seleciona "D&D"
5. Tag é adicionada ao post
6. Ao salvar, TagService incrementa usage_count de D&D
```

### 2. Usuário filtra feed por tags
```
1. Ve tag "D&D" no TagFilter (42 usos)
2. Clica na tag
3. Tag é adicionada a selectedTags
4. Feed recarrega: GET /api/posts?tags[]=5
5. Apenas posts com tag D&D aparecem
```

### 3. Admin funde tags duplicadas
```
1. Identifica: "D&D" (42), "dnd" (8), "Dungeons" (3)
2. Decide fundir tudo em "D&D"
3. POST /api/tags/merge
4. Sistema move 11 relacionamentos
5. "D&D" agora tem 53 usos
6. Tags antigas são deletadas
```

---

## 🐛 Pontos de Atenção

### Limitações Atuais

1. **Máximo de tags por post:** 5 (hardcoded no frontend)
2. **Filtro AND apenas:** Não há suporte para OR
3. **Sem busca por descrição:** Apenas nome e sinônimos
4. **Sem autocomplete para criação:** Precisa digitar nome completo
5. **Sem histórico:** Não salva tags pesquisadas

### Possíveis Melhorias

1. ✅ Cache de tags populares (Redis)
2. ✅ Trending tags (popularidade temporal)
3. ✅ Sugestões baseadas em histórico
4. ✅ Analytics de uso por usuário
5. ✅ Exportar/importar tags de campanhas
6. ✅ Tags hierárquicas (categorias/subcategorias)
7. ✅ Autocomplete multi-língua
8. ✅ Preview de conteúdo ao passar mouse na tag

---

## 📝 Exemplos de Uso

### Frontend: Criar post com tags
```jsx
const [tags, setTags] = useState([]);

<TagSelector
    selectedTags={tags}
    onTagsChange={setTags}
    type="post"
    maxTags={5}
/>

// Ao enviar:
const formData = new FormData();
formData.append('tags', JSON.stringify(tags.map(t => t.id)));
```

### Backend: Buscar posts por tags
```php
// Controllers
$tags = $request->tags; // [5, 12]

$posts = Post::whereHas('tags', function ($q) use ($tags) {
    $q->whereIn('tags.id', $tags);
})->get();

// Service
$tags = TagService::getPopularTags(20, 'campaign');
```

---

## 🐛 Problemas Identificados e Corrigidos

### Issue: Erro de Autenticação nos Componentes de Tags

**Erro:** `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Causa:** Os componentes `TagFilter` e `TagSelector` estavam usando `localStorage.getItem('token')` ao invés de `localStorage.getItem('auth_token')`, causando falha de autenticação e retorno de HTML da página de login.

**Solução:** Corrigida a chave do token em:
- `TagFilter.jsx` - linha 25
- `TagSelector.jsx` - linhas 32 e 85

**Status:** ✅ Corrigido

---

## 🎓 Conclusão

O sistema de tags do Salão da Guilda é robusto e bem arquitetado, oferecendo:

✅ Categorização flexível de conteúdo
✅ Busca e descoberta facilitadas
✅ Moderação administrativa
✅ Performance otimizada
✅ Expansibilidade futura
✅ Autenticação corrigida e consistente

O sistema está pronto para escalar e atender as necessidades de organização e descoberta de conteúdo da plataforma.

