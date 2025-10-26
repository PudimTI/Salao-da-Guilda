# Configuração do Laravel Scout

Este documento descreve a configuração do Laravel Scout para indexação dos modelos Campaign e Post.

## Configuração Realizada

### 1. Modelos Configurados

#### Campaign Model
- **Trait**: `Searchable`
- **Índice**: `campaigns_index`
- **Campos indexados**: name, description, system, type, city, rules, status, visibility, owner_name, tags
- **Condição de indexação**: Apenas campanhas com status 'active' e visibility 'public'

#### Post Model
- **Trait**: `Searchable`
- **Índice**: `posts_index`
- **Campos indexados**: content, visibility, author_name, author_username, likes_count, comments_count, reposts_count
- **Condição de indexação**: Apenas posts com visibility 'public'

### 2. Configuração do Meilisearch

O arquivo `config/scout.php` foi configurado com:
- **Driver**: Meilisearch
- **Host**: http://127.0.0.1:7700 (configurado no .env)
- **Índices configurados** com atributos filtráveis, pesquisáveis e ordenáveis

### 3. Comando Personalizado

Criado comando `scout:index-models` para indexação dos dados:

```bash
# Indexar todos os modelos
php artisan scout:index-models

# Indexar apenas campanhas
php artisan scout:index-models --model=campaign

# Indexar apenas posts
php artisan scout:index-models --model=post

# Indexar com chunk personalizado
php artisan scout:index-models --chunk=1000
```

## Como Usar

### 1. Iniciar o Meilisearch
```bash
# Instalar Meilisearch (se não estiver instalado)
curl -L https://install.meilisearch.com | sh

# Iniciar o servidor
./meilisearch
```

### 2. Indexar os Dados
```bash
# Indexar todos os modelos
php artisan scout:index-models

# Ou indexar modelos específicos
php artisan scout:index-models --model=campaign
php artisan scout:index-models --model=post
```

### 3. Usar a Busca nos Controllers

#### Exemplo para Campaign:
```php
use App\Models\Campaign;

// Busca simples
$campaigns = Campaign::search('D&D')->get();

// Busca com filtros
$campaigns = Campaign::search('D&D')
    ->where('system', 'D&D 5e')
    ->where('status', 'active')
    ->get();

// Busca com paginação
$campaigns = Campaign::search('D&D')->paginate(10);
```

#### Exemplo para Post:
```php
use App\Models\Post;

// Busca simples
$posts = Post::search('aventura')->get();

// Busca com filtros
$posts = Post::search('aventura')
    ->where('visibility', 'public')
    ->get();

// Busca com paginação
$posts = Post::search('aventura')->paginate(10);
```

### 4. Comandos Úteis

```bash
# Limpar todos os índices
php artisan scout:flush "App\Models\Campaign"
php artisan scout:flush "App\Models\Post"

# Reindexar um modelo específico
php artisan scout:import "App\Models\Campaign"
php artisan scout:import "App\Models\Post"

# Verificar status dos índices
php artisan scout:status
```

## Configurações Avançadas

### Atualização Automática
Os modelos são automaticamente indexados quando:
- Um novo registro é criado
- Um registro existente é atualizado
- Um registro é deletado (removido do índice)

### Configuração de Queue
Para melhor performance, configure o Scout para usar queue:

```env
SCOUT_QUEUE=true
```

### Configuração de Chunk
Ajuste o tamanho do chunk para otimizar a performance:

```env
SCOUT_CHUNK=500
```

## Monitoramento

### Verificar Status do Meilisearch
```bash
curl http://127.0.0.1:7700/health
```

### Verificar Índices
```bash
curl http://127.0.0.1:7700/indexes
```

### Verificar Estatísticas de um Índice
```bash
curl http://127.0.0.1:7700/indexes/campaigns_index/stats
curl http://127.0.0.1:7700/indexes/posts_index/stats
```

## Troubleshooting

### Erro de Conexão
- Verifique se o Meilisearch está rodando na porta 7700
- Confirme as configurações no arquivo `.env`

### Dados Não Aparecem na Busca
- Execute o comando de indexação: `php artisan scout:index-models`
- Verifique se os registros atendem às condições de `shouldBeSearchable()`

### Performance Lenta
- Ajuste o tamanho do chunk
- Configure o Scout para usar queue
- Considere usar indexação em background






