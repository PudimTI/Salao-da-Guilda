# Configuração do Meilisearch

## Instalação

### Windows

1. **Baixar o Meilisearch:**
   ```bash
   # Usando Chocolatey
   choco install meilisearch
   
   # Ou baixar manualmente do GitHub
   # https://github.com/meilisearch/meilisearch/releases
   ```

2. **Executar o Meilisearch:**
   ```bash
   # Com chave mestra (recomendado para produção)
   meilisearch --master-key="your-master-key"
   
   # Sem chave mestra (apenas para desenvolvimento)
   meilisearch
   ```

### Linux/macOS

1. **Instalar via curl:**
   ```bash
   curl -L https://install.meilisearch.com | sh
   ```

2. **Executar:**
   ```bash
   ./meilisearch --master-key="your-master-key"
   ```

### Docker

```bash
docker run -it --rm \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY="your-master-key" \
  getmeili/meilisearch:latest
```

## Configuração no Laravel

### 1. Atualizar o arquivo .env

```env
# Scout Configuration
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=your-master-key
SCOUT_QUEUE=false
```

### 2. Indexar os modelos

```bash
# Indexar tags
php artisan scout:import "App\Models\Tag"

# Indexar posts (já inclui tags)
php artisan scout:import "App\Models\Post"

# Indexar campanhas (já inclui tags)
php artisan scout:import "App\Models\Campaign"
```

### 3. Verificar se está funcionando

```bash
# Testar conexão
php artisan tinker
>>> App\Models\Tag::search('dnd')->get()
```

## Configurações de Índice

As configurações de índice estão definidas em `config/scout.php`:

### Tags Index
- **Filtros:** id, type, is_moderated, usage_count
- **Busca:** name, description, synonyms
- **Ordenação:** name, usage_count, created_at

### Posts Index
- **Filtros:** id, visibility, author_name, author_username, tags
- **Busca:** content, author_name, author_username, tags
- **Ordenação:** created_at, likes_count, comments_count, reposts_count

### Campaigns Index
- **Filtros:** id, system, type, status, visibility, city
- **Busca:** name, description, system, type, city, rules, owner_name, tags
- **Ordenação:** created_at, updated_at, name

## Comandos Úteis

```bash
# Recriar todos os índices
php artisan scout:flush "App\Models\Tag"
php artisan scout:flush "App\Models\Post"
php artisan scout:flush "App\Models\Campaign"

# Reimportar dados
php artisan scout:import "App\Models\Tag"
php artisan scout:import "App\Models\Post"
php artisan scout:import "App\Models\Campaign"

# Verificar status
php artisan scout:status
```

## Troubleshooting

### Erro de Conexão

1. **Verificar se o Meilisearch está rodando:**
   ```bash
   curl http://127.0.0.1:7700/health
   ```

2. **Verificar logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

### Erro de Permissão

1. **Verificar se a chave mestra está correta**
2. **Verificar se o host está acessível**

### Performance

1. **Usar filas para indexação:**
   ```env
   SCOUT_QUEUE=true
   ```

2. **Configurar chunk size:**
   ```php
   // Em config/scout.php
   'chunk' => [
       'searchable' => 100,
       'unsearchable' => 100,
   ],
   ```

## Exemplos de Uso

### Busca Simples

```php
// Buscar tags
$tags = Tag::search('dnd')->get();

// Buscar posts
$posts = Post::search('aventura')->get();

// Buscar campanhas
$campaigns = Campaign::search('fantasy')->get();
```

### Busca com Filtros

```php
// Buscar tags por tipo
$tags = Tag::search('dnd')
    ->where('type', 'campaign')
    ->get();

// Buscar posts por visibilidade
$posts = Post::search('aventura')
    ->where('visibility', 'public')
    ->get();
```

### Busca com Ordenação

```php
// Ordenar por popularidade
$tags = Tag::search('dnd')
    ->orderBy('usage_count', 'desc')
    ->get();
```

## Monitoramento

### Dashboard do Meilisearch

Acesse: http://127.0.0.1:7700

### Métricas

```bash
# Estatísticas dos índices
curl http://127.0.0.1:7700/stats

# Informações de um índice específico
curl http://127.0.0.1:7700/indexes/tags_index/stats
```

## Segurança

### Produção

1. **Sempre usar chave mestra**
2. **Configurar firewall**
3. **Usar HTTPS**
4. **Configurar autenticação**

### Desenvolvimento

1. **Pode usar sem chave mestra**
2. **Acesso local apenas**
3. **Logs detalhados**

## Backup e Restauração

### Backup

```bash
# Exportar dados
curl -X GET http://127.0.0.1:7700/dumps \
  -H "Authorization: Bearer your-master-key"
```

### Restauração

```bash
# Importar dados
curl -X POST http://127.0.0.1:7700/dumps \
  -H "Authorization: Bearer your-master-key" \
  -H "Content-Type: application/json" \
  -d '{"dumpUid": "your-dump-uid"}'
```
