# Integração de Tags no Frontend

## Componentes Criados

### 1. TagSelector

Componente para seleção de tags com autocomplete e criação de novas tags.

**Props:**
- `selectedTags` (array): Tags já selecionadas
- `onTagsChange` (function): Callback quando tags mudam
- `type` (string): Tipo de tag ('post', 'campaign', 'general')
- `placeholder` (string): Placeholder do input
- `maxTags` (number): Número máximo de tags
- `className` (string): Classes CSS adicionais

**Exemplo de uso:**
```jsx
import TagSelector from './components/TagSelector';

const [tags, setTags] = useState([]);

<TagSelector
    selectedTags={tags}
    onTagsChange={setTags}
    type="post"
    placeholder="Adicione tags..."
    maxTags={5}
/>
```

### 2. TagList

Componente para exibir uma lista de tags.

**Props:**
- `tags` (array): Array de tags para exibir
- `onTagClick` (function): Callback quando tag é clicada
- `showCount` (boolean): Mostrar contador de uso
- `showType` (boolean): Mostrar tipo da tag
- `className` (string): Classes CSS do container
- `tagClassName` (string): Classes CSS das tags

**Exemplo de uso:**
```jsx
import TagList from './components/TagList';

<TagList
    tags={post.tags}
    showType={true}
    showCount={true}
    onTagClick={(tag) => console.log('Tag clicada:', tag)}
/>
```

### 3. TagFilter

Componente para filtrar posts por tags.

**Props:**
- `onFilterChange` (function): Callback quando filtros mudam
- `selectedTags` (array): Tags selecionadas para filtro
- `type` (string): Tipo de tag para filtrar
- `className` (string): Classes CSS adicionais

**Exemplo de uso:**
```jsx
import TagFilter from './components/TagFilter';

const [selectedTags, setSelectedTags] = useState([]);

<TagFilter
    onFilterChange={setSelectedTags}
    selectedTags={selectedTags}
    type="post"
/>
```

## Integrações Realizadas

### 1. CreatePostModal

Adicionado TagSelector para permitir associar tags aos posts.

**Funcionalidades:**
- Seleção de tags existentes
- Criação de novas tags
- Limite de 5 tags por post
- Tipo de tag: 'post'

### 2. FeedPost

Adicionado TagList para exibir tags dos posts.

**Funcionalidades:**
- Exibição de tags com cores por tipo
- Ícones para cada tipo de tag
- Layout responsivo

### 3. Feed

Adicionado TagFilter para filtrar posts por tags.

**Funcionalidades:**
- Filtro por tags populares
- Seleção múltipla de tags
- Recarregamento automático dos posts
- Limpeza de filtros

### 4. NewAdventures

Adicionado TagSelector para criação de campanhas.

**Funcionalidades:**
- Seleção de tags para campanhas
- Tipo de tag: 'campaign'
- Integração com formulário de criação

## APIs Utilizadas

### 1. Autocomplete de Tags

```javascript
// Buscar tags para autocomplete
const searchTags = async (query, type = null) => {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    
    const response = await fetch(`/api/tags/autocomplete?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return await response.json();
};
```

### 2. Tags Populares

```javascript
// Buscar tags populares
const getPopularTags = async (type = null, limit = 20) => {
    const params = new URLSearchParams({ limit });
    if (type) params.append('type', type);
    
    const response = await fetch(`/api/tags/popular?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return await response.json();
};
```

### 3. Criar Tag

```javascript
// Criar nova tag
const createTag = async (tagData) => {
    const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tagData)
    });
    
    return await response.json();
};
```

## Estilos e Cores

### Cores por Tipo de Tag

- **Post:** Azul (`bg-blue-100 text-blue-800 border-blue-200`)
- **Campaign:** Verde (`bg-green-100 text-green-800 border-green-200`)
- **General:** Cinza (`bg-gray-100 text-gray-800 border-gray-200`)

### Ícones por Tipo

- **Post:** 📝
- **Campaign:** 🎲
- **General:** 🏷️

## Funcionalidades Implementadas

### 1. Autocomplete Inteligente

- Busca em tempo real
- Debounce de 300ms
- Filtragem de tags já selecionadas
- Sugestão de criação de nova tag

### 2. Criação Dinâmica de Tags

- Criação de tags durante a seleção
- Validação de nomes únicos
- Associação automática ao tipo correto

### 3. Filtragem Avançada

- Filtro por tags populares
- Seleção múltipla
- Limpeza de filtros
- Recarregamento automático

### 4. Interface Responsiva

- Layout adaptável
- Componentes móveis
- Feedback visual
- Estados de carregamento

## Exemplos de Uso

### 1. Seleção de Tags em Formulário

```jsx
const CreatePostForm = () => {
    const [tags, setTags] = useState([]);
    
    return (
        <form>
            <TagSelector
                selectedTags={tags}
                onTagsChange={setTags}
                type="post"
                placeholder="Adicione tags ao seu post..."
                maxTags={5}
            />
        </form>
    );
};
```

### 2. Exibição de Tags em Post

```jsx
const PostCard = ({ post }) => {
    return (
        <div className="post-card">
            <p>{post.content}</p>
            {post.tags && post.tags.length > 0 && (
                <TagList
                    tags={post.tags}
                    showType={true}
                    className="mt-2"
                />
            )}
        </div>
    );
};
```

### 3. Filtro de Posts por Tags

```jsx
const PostFeed = () => {
    const [selectedTags, setSelectedTags] = useState([]);
    const [posts, setPosts] = useState([]);
    
    useEffect(() => {
        // Recarregar posts quando tags mudarem
        fetchPosts(selectedTags);
    }, [selectedTags]);
    
    return (
        <div>
            <TagFilter
                onFilterChange={setSelectedTags}
                selectedTags={selectedTags}
                type="post"
            />
            {posts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
};
```

## Tratamento de Erros

### 1. Erro de Rede

```javascript
const handleTagSearch = async (query) => {
    try {
        const tags = await searchTags(query);
        setSuggestions(tags.data);
    } catch (error) {
        console.error('Erro ao buscar tags:', error);
        setError('Erro ao carregar tags');
    }
};
```

### 2. Validação de Tags

```javascript
const validateTags = (tags) => {
    if (tags.length > maxTags) {
        return `Máximo de ${maxTags} tags permitidas`;
    }
    
    const duplicateNames = tags.filter((tag, index) => 
        tags.findIndex(t => t.name === tag.name) !== index
    );
    
    if (duplicateNames.length > 0) {
        return 'Tags duplicadas não são permitidas';
    }
    
    return null;
};
```

## Performance

### 1. Debounce na Busca

```javascript
useEffect(() => {
    const timeoutId = setTimeout(() => {
        searchTags(inputValue);
    }, 300);

    return () => clearTimeout(timeoutId);
}, [inputValue]);
```

### 2. Memoização de Componentes

```javascript
const TagList = React.memo(({ tags, onTagClick }) => {
    return (
        <div className="tag-list">
            {tags.map(tag => (
                <TagItem key={tag.id} tag={tag} onClick={onTagClick} />
            ))}
        </div>
    );
});
```

### 3. Lazy Loading

```javascript
const TagSelector = React.lazy(() => import('./TagSelector'));

// Uso com Suspense
<Suspense fallback={<div>Carregando...</div>}>
    <TagSelector {...props} />
</Suspense>
```

## Testes

### 1. Teste de Componente

```javascript
import { render, fireEvent, waitFor } from '@testing-library/react';
import TagSelector from './TagSelector';

test('deve permitir seleção de tags', async () => {
    const onTagsChange = jest.fn();
    const { getByPlaceholderText } = render(
        <TagSelector onTagsChange={onTagsChange} />
    );
    
    const input = getByPlaceholderText('Digite para buscar tags...');
    fireEvent.change(input, { target: { value: 'dnd' } });
    
    await waitFor(() => {
        expect(onTagsChange).toHaveBeenCalled();
    });
});
```

### 2. Teste de Integração

```javascript
test('deve filtrar posts por tags', async () => {
    const { getByText } = render(<PostFeed />);
    
    // Selecionar tag
    fireEvent.click(getByText('D&D'));
    
    // Verificar se posts foram filtrados
    await waitFor(() => {
        expect(getByText('Posts filtrados por D&D')).toBeInTheDocument();
    });
});
```

## Próximos Passos

1. **Implementar cache de tags**
2. **Adicionar sugestões baseadas em histórico**
3. **Implementar tags trending**
4. **Adicionar analytics de uso de tags**
5. **Implementar sistema de moderação de tags**
