# Sistema de Recomendações - Documentação Completa

## 📋 Visão Geral

Sistema de recomendações inteligente para Laravel que sugere campanhas e posts aos usuários baseado em:
- **Preferências do usuário** (sistemas, estilos, dinâmicas)
- **Tags e categorias** (similaridade de conteúdo)
- **Histórico de interações** (likes, visualizações, comentários)
- **Rede social** (recomendações de amigos)
- **Filtros personalizados** (whitelist/blacklist de tags)

## 🏗️ Arquitetura

### Componentes Principais

```
app/
├── Services/
│   └── RecommendationService.php          # Lógica principal do algoritmo
├── Http/Controllers/
│   └── RecommendationController.php      # Endpoints da API
├── Http/Resources/
│   ├── RecommendationResource.php        # Formatação de resposta
│   └── RecommendationCollection.php      # Coleção de recomendações
├── Jobs/
│   └── GenerateRecommendationsJob.php    # Job para processamento em lote
├── Console/Commands/
│   └── GenerateRecommendationsCommand.php # Comando CLI
└── Models/
    └── Recommendation.php                # Modelo de dados
```

## 🧮 Algoritmo de Score

### Fórmula Principal

```
Score = (Peso_Prefs × Score_Prefs) + (Peso_Tags × Score_Tags) + 
        (Peso_Interactions × Score_Interactions) + (Peso_Friends × Score_Friends)
```

### Pesos Configurados

- **Preferências**: 40% (sistemas, estilos, dinâmicas)
- **Tags**: 30% (similaridade de conteúdo)
- **Interações**: 20% (histórico de comportamento)
- **Amigos**: 10% (recomendações sociais)

### Cálculo de Scores

#### 1. Score de Preferências (0-1)
- **Sistemas**: +0.4 se sistema preferido
- **Estilos**: +0.3 × (tags_matching / total_preferences)
- **Dinâmicas**: +0.3 × (tags_matching / total_preferences)

#### 2. Score de Tags (0-1)
- Baseado na frequência de tags do usuário
- Similaridade = tags_comuns / tags_populares_do_usuario

#### 3. Score de Interações (0-1)
- Interações positivas: like, join, view, comment
- Interações negativas: dislike, leave, block
- Score = 0.3 + (ratio_positivo × 0.7)

#### 4. Score de Amigos (0-1)
- Baseado em interações de amigos com o mesmo conteúdo
- Score = 0.2 + (interações_amigos × 0.1)

## 🚀 Instalação e Configuração

### Pré-requisitos

```bash
# Redis (recomendado para cache)
sudo apt-get install redis-server

# Meilisearch (opcional, para busca avançada)
curl -L https://install.meilisearch.com | sh
```

### Configuração do Cache

```php
// config/cache.php
'default' => env('CACHE_DRIVER', 'redis'),

'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
    ],
],
```

### Configuração do Scout (Opcional)

```php
// config/scout.php
'meilisearch' => [
    'host' => env('SCOUT_MEILISEARCH_HOST', 'http://localhost:7700'),
    'key' => env('SCOUT_MEILISEARCH_KEY', null),
    'index-settings' => [
        'recommendations' => [
            'filterableAttributes' => ['target_type', 'score'],
            'sortableAttributes' => ['score', 'generated_at'],
        ],
    ],
],
```

### Variáveis de Ambiente

```env
# Cache
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Scout (opcional)
SCOUT_DRIVER=meilisearch
SCOUT_MEILISEARCH_HOST=http://localhost:7700
SCOUT_MEILISEARCH_KEY=your-key-here
SCOUT_QUEUE=false
```

## 📊 Estrutura do Banco de Dados

### Tabela `recommendations`

```sql
CREATE TABLE recommendations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    target_type VARCHAR(20) NULL,        -- 'campaign' ou 'post'
    target_id BIGINT NULL,
    score DECIMAL(5,2) NULL,             -- Score de 0.00 a 1.00
    reason TEXT NULL,                    -- Explicação da recomendação
    generated_at TIMESTAMP NULL,
    valid_until TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_score (user_id, score),
    INDEX idx_target (target_type, target_id),
    INDEX idx_validity (valid_until)
);
```

### Tabelas Relacionadas (Já Existentes)

- `users` - Usuários do sistema
- `user_preferences` - Preferências (sistemas, estilos, dinâmicas)
- `user_filters` - Filtros (whitelist/blacklist de tags)
- `interaction_events` - Histórico de interações
- `campaigns` - Campanhas
- `posts` - Posts
- `tags` - Tags e categorias
- `friendships` - Relacionamentos de amizade

## 🔧 Uso da API

### Endpoints Disponíveis

#### 1. Listar Recomendações
```http
GET /api/recommendations
```

**Parâmetros:**
- `limit` (int): Número de recomendações (1-50, padrão: 10)
- `type` (string): Tipo de conteúdo ('campaign', 'post', 'all')
- `min_score` (float): Score mínimo (0-1, padrão: 0.1)
- `refresh` (boolean): Forçar atualização do cache

**Resposta:**
```json
{
    "success": true,
    "data": {
        "data": [
            {
                "id": 1,
                "target_type": "campaign",
                "target_id": 123,
                "score": 0.85,
                "reason": "Sistema preferido: D&D 5e, Tags de interesse em comum",
                "generated_at": "2024-01-15T10:30:00Z",
                "valid_until": "2024-01-22T10:30:00Z",
                "is_valid": true,
                "target": {
                    "id": 123,
                    "name": "A Jornada dos Cinco Anéis",
                    "description": "Uma aventura épica...",
                    "system": "D&D 5e",
                    "owner": {...},
                    "tags": [...]
                },
                "score_percentage": 85.0,
                "days_until_expiry": 7
            }
        ],
        "meta": {
            "total": 1,
            "types": {"campaign": 1, "post": 0},
            "score_range": {"min": 0.85, "max": 0.85, "avg": 0.85}
        }
    },
    "message": "Recomendações recuperadas com sucesso"
}
```

#### 2. Gerar Novas Recomendações
```http
POST /api/recommendations/generate
```

**Parâmetros:**
- `limit` (int): Número de recomendações (1-50, padrão: 10)
- `force` (boolean): Forçar geração mesmo com recomendações recentes

#### 3. Marcar como Visualizada
```http
POST /api/recommendations/{id}/view
```

#### 4. Estatísticas
```http
GET /api/recommendations/stats
```

#### 5. Limpar Cache
```http
DELETE /api/recommendations/cache
```

## 🖥️ Comandos CLI

### Gerar Recomendações

```bash
# Para usuário específico
php artisan recommendations:generate --user=123 --limit=20

# Para todos os usuários ativos
php artisan recommendations:generate --batch

# Forçar geração (ignorar recomendações recentes)
php artisan recommendations:generate --force

# Limpar cache antes de gerar
php artisan recommendations:generate --clear-cache
```

### Agendamento Automático

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    // Gerar recomendações diariamente às 2h
    $schedule->command('recommendations:generate --batch')
             ->dailyAt('02:00')
             ->withoutOverlapping();
             
    // Limpar recomendações expiradas semanalmente
    $schedule->command('recommendations:cleanup')
             ->weekly()
             ->sundays()
             ->at('03:00');
}
```

## 🔄 Jobs e Filas

### Processamento em Lote

```php
// Despachar job para usuário específico
GenerateRecommendationsJob::dispatch($userId, $limit, $force);

// Processar em lotes
$users = User::active()->pluck('id');
foreach (array_chunk($users->toArray(), 50) as $batch) {
    foreach ($batch as $userId) {
        GenerateRecommendationsJob::dispatch($userId, 20, false);
    }
}
```

### Configuração de Filas

```php
// config/queue.php
'connections' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => env('REDIS_QUEUE', 'default'),
        'retry_after' => 90,
        'block_for' => null,
    ],
],
```

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
php artisan test tests/Unit/RecommendationServiceTest.php

# Testes de integração
php artisan test tests/Feature/RecommendationControllerTest.php

# Todos os testes
php artisan test
```

### Cobertura de Testes

- ✅ Geração de recomendações
- ✅ Cálculo de scores
- ✅ Filtros de usuário
- ✅ Cache e performance
- ✅ Endpoints da API
- ✅ Validação de parâmetros
- ✅ Autenticação e autorização

## 📈 Monitoramento e Métricas

### Logs Importantes

```php
// Logs de geração
Log::info('Recomendações geradas para usuário', [
    'user_id' => $userId,
    'count' => $recommendationCount,
    'avg_score' => $averageScore
]);

// Logs de erro
Log::error('Erro ao gerar recomendações', [
    'user_id' => $userId,
    'error' => $exception->getMessage()
]);
```

### Métricas Recomendadas

1. **Taxa de Geração**: % de usuários com recomendações
2. **Score Médio**: Qualidade das recomendações
3. **Taxa de Conversão**: % de recomendações que geram interação
4. **Performance**: Tempo de geração e cache hit rate
5. **Cobertura**: % de usuários com preferências preenchidas

## 🔧 Personalização

### Ajustar Pesos do Algoritmo

```php
// app/Services/RecommendationService.php
private const WEIGHT_PREFERENCES = 0.4;  // Aumentar para dar mais peso às preferências
private const WEIGHT_TAGS = 0.3;         // Aumentar para dar mais peso às tags
private const WEIGHT_INTERACTIONS = 0.2; // Aumentar para dar mais peso ao histórico
private const WEIGHT_FRIENDS = 0.1;      // Aumentar para dar mais peso às redes sociais
```

### Adicionar Novos Fatores

```php
// Exemplo: Score baseado em localização
private function calculateLocationScore(User $user, $target): float
{
    // Implementar lógica de proximidade geográfica
    return 0.5; // Score neutro por padrão
}
```

### Configurar Cache

```php
// Ajustar TTL do cache
private const CACHE_TTL = 3600; // 1 hora (ajustar conforme necessário)

// Cache por padrão de usuário
Cache::tags(['recommendations', "user:{$userId}"])->remember(...);
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Recomendações Vazias
```bash
# Verificar se usuário tem preferências
SELECT * FROM user_preferences WHERE user_id = ?;

# Verificar se há conteúdo elegível
SELECT COUNT(*) FROM campaigns WHERE status = 'active' AND visibility = 'public';
```

#### 2. Performance Lenta
```bash
# Verificar índices do banco
SHOW INDEX FROM recommendations;

# Verificar cache Redis
redis-cli KEYS "recommendations:*"
```

#### 3. Jobs Falhando
```bash
# Verificar logs da fila
tail -f storage/logs/laravel.log | grep "GenerateRecommendationsJob"

# Verificar status da fila
php artisan queue:work --verbose
```

### Comandos de Diagnóstico

```bash
# Verificar recomendações de um usuário
php artisan tinker
>>> App\Models\Recommendation::where('user_id', 1)->get();

# Limpar cache manualmente
php artisan cache:clear
php artisan config:clear

# Verificar configuração do Redis
redis-cli ping
```

## 📚 Exemplos de Uso

### Frontend (JavaScript)

```javascript
// Buscar recomendações
async function getRecommendations(limit = 10, type = 'all') {
    const response = await fetch(`/api/recommendations?limit=${limit}&type=${type}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return await response.json();
}

// Gerar novas recomendações
async function generateRecommendations(force = false) {
    const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ force })
    });
    
    return await response.json();
}

// Marcar como visualizada
async function markAsViewed(recommendationId) {
    const response = await fetch(`/api/recommendations/${recommendationId}/view`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return await response.json();
}
```

### Backend (PHP)

```php
// Usar o service diretamente
$recommendationService = app(RecommendationService::class);

// Gerar recomendações
$recommendations = $recommendationService->generateRecommendations($userId, 10);

// Salvar no banco
$recommendationService->saveRecommendations($userId, $recommendations);

// Limpar cache
$recommendationService->clearUserCache($userId);
```

## 🔒 Segurança

### Validações Implementadas

- ✅ Autenticação obrigatória em todos os endpoints
- ✅ Autorização: usuários só acessam suas próprias recomendações
- ✅ Validação de parâmetros de entrada
- ✅ Rate limiting (implementar se necessário)
- ✅ Sanitização de dados de entrada

### Recomendações de Segurança

1. **Rate Limiting**: Implementar limite de requisições por usuário
2. **Auditoria**: Log de todas as ações de recomendação
3. **Validação**: Sanitizar todos os inputs do usuário
4. **Cache**: Não armazenar dados sensíveis no cache

## 📝 Changelog

### v1.0.0 (2024-01-15)
- ✅ Sistema básico de recomendações
- ✅ Algoritmo de score configurável
- ✅ API REST completa
- ✅ Jobs para processamento em lote
- ✅ Comandos CLI
- ✅ Testes unitários e de integração
- ✅ Documentação completa

## 🤝 Contribuição

### Como Contribuir

1. Fork do repositório
2. Criar branch para feature (`git checkout -b feature/nova-funcionalidade`)
3. Implementar com testes
4. Commit das mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
5. Push para branch (`git push origin feature/nova-funcionalidade`)
6. Criar Pull Request

### Padrões de Código

- PSR-12 para PHP
- Testes obrigatórios para novas funcionalidades
- Documentação atualizada
- Commits em português brasileiro

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar esta documentação
2. Consultar logs do sistema
3. Executar testes para diagnóstico
4. Abrir issue no repositório

---

**Sistema de Recomendações v1.0.0** - Desenvolvido para Laravel 10/11 com PostgreSQL
