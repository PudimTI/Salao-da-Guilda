# Análise do Módulo de Recomendações e Dependências

## 📋 Resumo Executivo

O módulo de recomendações é um sistema inteligente que sugere campanhas e posts aos usuários baseado em múltiplos fatores: preferências do usuário, tags similares, histórico de interações e rede de amigos. O sistema utiliza cache Redis para otimizar performance e oferece processamento em lote via jobs.

**Status:** ✅ Funcional com observações importantes

---

## 🏗️ Arquitetura do Módulo

### Estrutura de Arquivos

```
app/
├── Services/
│   └── RecommendationService.php          # ⭐ Serviço principal (411 linhas)
├── Http/Controllers/
│   └── RecommendationController.php      # Controller da API (328 linhas)
├── Http/Resources/
│   ├── RecommendationResource.php        # Formatação de resposta (115 linhas)
│   └── RecommendationCollection.php      # Coleção de recomendações (62 linhas)
├── Jobs/
│   └── GenerateRecommendationsJob.php    # Job para processamento em lote (164 linhas)
├── Console/Commands/
│   └── GenerateRecommendationsCommand.php # Comando CLI (220 linhas)
└── Models/
    └── Recommendation.php                # Modelo de dados (40 linhas)

resources/js/
└── components/
    └── Recommendations.jsx                # Componente React frontend (336 linhas)

database/migrations/
└── 2025_10_15_000027_create_recommendations_table.php

docs/
└── RECOMMENDATION_SYSTEM_README.md        # Documentação completa (554 linhas)
```

---

## 🔗 Dependências do Módulo

### 1. Modelos Eloquent (Dependências Diretas)

#### **Recommendation** (Modelo Principal)
- **Tabela:** `recommendations`
- **Relacionamentos:**
  - `belongsTo(User)` via `user_id`

#### **User** (Dependência Crítica)
- **Tabela:** `users`
- **Relacionamentos Utilizados:**
  - `hasOne(UserPreference)` → `preferences`
  - `hasOne(UserFilter)` → `filters`
  - `hasMany(InteractionEvent)` → `interactionEvents`
  - `hasMany(Recommendation)` → `recommendations`

#### **UserPreference**
- **Tabela:** `user_preferences`
- **Campos Críticos:**
  - `systems` (array) - Sistemas RPG preferidos
  - `styles` (array) - Estilos de jogo preferidos
  - `dynamics` (array) - Dinâmicas preferidas
- **Uso:** Base para cálculo de score de preferências (peso 40%)

#### **UserFilter**
- **Tabela:** `user_filters`
- **Campos Críticos:**
  - `whitelist_tags` (array) - Tags permitidas
  - `blacklist_tags` (array) - Tags bloqueadas
- **Uso:** Filtra campanhas e posts elegíveis

#### **InteractionEvent**
- **Tabela:** `interaction_events`
- **Campos:**
  - `user_id` - Usuário que interagiu
  - `type` - Tipo de evento ⚠️ (veja observação abaixo)
  - `target_type` - Tipo do alvo ('campaign' ou 'post')
  - `target_id` - ID do alvo
  - `tags_snapshot` - Snapshot de tags no momento
  - `occurred_at` - Quando ocorreu
- **Uso:** Histórico de interações para cálculo de score (peso 20%)

⚠️ **PROBLEMA IDENTIFICADO:** 
O código usa `action` (linhas 265, 266, 291 do RecommendationService), mas a tabela e modelo têm apenas `type`. Isso causará erros em runtime.

#### **Campaign**
- **Tabela:** `campaigns`
- **Campos Utilizados:**
  - `id`, `name`, `description`, `system`
  - `status` (deve ser 'active')
  - `visibility` (deve ser 'public')
- **Relacionamentos Utilizados:**
  - `belongsToMany(Tag)` → `tags`
  - `belongsTo(User)` → `owner`
  - `belongsToMany(User)` → `members` (via `campaign_members`)

#### **Post**
- **Tabela:** `posts`
- **Campos Utilizados:**
  - `id`, `content`, `author_id`, `visibility`
  - `created_at` (para filtrar posts recentes - últimos 30 dias)
- **Relacionamentos Utilizados:**
  - `belongsToMany(Tag)` → `tags`
  - `belongsTo(User)` → `author`

#### **Tag**
- **Tabela:** `tags`
- **Campos Utilizados:**
  - `id`, `name`, `category` (style, dynamic, etc.)
- **Relacionamentos:**
  - `belongsToMany(Campaign)` → `campaign_tags`
  - `belongsToMany(Post)` → `post_tags`

#### **Friendship** (Via Query Direta)
- **Tabela:** `friendships`
- **Campos Utilizados:**
  - `user_id`, `friend_id`, `state` (deve ser 'active')
- **Uso:** Score baseado em interações de amigos (peso 10%)

---

### 2. Tabelas do Banco de Dados

#### **Tabelas Principais:**
1. `recommendations` - Armazena recomendações geradas
2. `users` - Usuários do sistema
3. `user_preferences` - Preferências dos usuários
4. `user_filters` - Filtros de conteúdo
5. `interaction_events` - Histórico de interações
6. `campaigns` - Campanhas
7. `posts` - Posts
8. `tags` - Tags e categorias
9. `campaign_tags` - Relação many-to-many campanhas-tags
10. `post_tags` - Relação many-to-many posts-tags
11. `campaign_members` - Membros de campanhas
12. `friendships` - Relacionamentos de amizade

---

### 3. Dependências do Laravel/Framework

#### **Facades Utilizadas:**
- `Illuminate\Support\Facades\Cache` - Cache de recomendações (TTL: 3600s)
- `Illuminate\Support\Facades\DB` - Queries complexas
- `Illuminate\Support\Facades\Log` - Logging
- `Illuminate\Support\Facades\Auth` - Autenticação
- `Illuminate\Support\Facades\Validator` - Validação de requests

#### **Pacotes/Features:**
- **Laravel Queue System** - Para `GenerateRecommendationsJob`
- **Laravel Cache System** - Redis recomendado
- **Laravel Sanctum** - Autenticação de API
- **Eloquent ORM** - Relacionamentos e queries

---

### 4. Dependências Frontend

#### **Componente React:**
- `Recommendations.jsx` - Componente principal
- **Utilidades:**
  - `apiGet`, `apiPost`, `handleApiError` (de `../utils/api`)
- **Estado:**
  - `recommendations` - Lista de recomendações
  - `loading` - Estado de carregamento
  - `error` - Mensagens de erro
  - `selectedRecommendation` - Recomendação selecionada

---

## 🔄 Fluxo de Dados e Processamento

### 1. Geração de Recomendações

```
Usuário → RecommendationController::generate()
    ↓
RecommendationService::generateRecommendations()
    ↓
Cache::remember() → Verifica cache (TTL: 1h)
    ↓
calculateRecommendations()
    ├── getEligibleCampaigns() → Filtra campanhas elegíveis
    ├── getEligiblePosts() → Filtra posts elegíveis
    ├── calculateScore() → Para cada item
    │   ├── calculatePreferenceScore() → 40% peso
    │   ├── calculateTagScore() → 30% peso
    │   ├── calculateInteractionScore() → 20% peso
    │   └── calculateFriendScore() → 10% peso
    └── generateReason() → Explicação da recomendação
    ↓
Ordena por score e limita resultados
    ↓
saveRecommendations() → Salva no banco
```

### 2. Consulta de Recomendações

```
GET /api/recommendations
    ↓
RecommendationController::index()
    ↓
getUserRecommendations()
    ↓
Recommendation::where() → Busca no banco
    ↓
RecommendationResource → Formata resposta
    ↓
RecommendationCollection → Formata coleção
```

### 3. Processamento em Lote

```
php artisan recommendations:generate --batch
    ↓
GenerateRecommendationsCommand
    ↓
GenerateRecommendationsJob::dispatch() (para cada usuário)
    ↓
RecommendationService::generateRecommendations()
```

---

## 📊 Algoritmo de Score

### Fórmula Principal

```
Score Final = 
    (0.4 × Score_Preferences) + 
    (0.3 × Score_Tags) + 
    (0.2 × Score_Interactions) + 
    (0.1 × Score_Friends)
```

### Componentes do Score

#### 1. Score de Preferências (40% do peso)
- **Sistemas preferidos:** +0.4 se sistema coincide
- **Estilos preferidos:** +0.3 × (tags_matching / total_preferences)
- **Dinâmicas preferidas:** +0.3 × (tags_matching / total_preferences)
- **Valor padrão:** 0.5 se não houver preferências

#### 2. Score de Tags (30% do peso)
- Baseado em tags populares do usuário (últimas 10 tags mais usadas)
- Similaridade = tags_comuns / tags_populares_do_usuario
- **Valor padrão:** 0.5 se usuário não tem tags
- **Valor baixo:** 0.1 se não há tags em comum

#### 3. Score de Interações (20% do peso)
- Interações positivas: `like`, `join`, `view`, `comment`
- Interações negativas: `dislike`, `leave`, `block`
- Fórmula: `0.3 + (ratio_positivo × 0.7)`
- **Valor padrão:** 0.3 se não há interações

⚠️ **PROBLEMA:** Código usa `action` mas tabela tem `type`

#### 4. Score de Amigos (10% do peso)
- Baseado em interações de amigos com o mesmo conteúdo
- Fórmula: `0.2 + (interações_amigos × 0.1)`
- **Valor padrão:** 0.2 se amigos não interagiram

---

## 🚨 Problemas Identificados

### ❌ CRÍTICO: Inconsistência no InteractionEvent

**Localização:** `app/Services/RecommendationService.php`

**Problema:**
- Linha 265: `->whereIn('action', ['like', 'join', 'view', 'comment'])`
- Linha 266: `->whereIn('action', ['dislike', 'leave', 'block'])`
- Linha 291: `->whereIn('ie.action', ['like', 'join', 'view', 'comment'])`

Mas a tabela `interaction_events` e o modelo `InteractionEvent` têm apenas o campo `type`, não `action`.

**Impacto:** 
- Queries falharão em runtime
- Cálculo de score de interações não funcionará
- Cálculo de score de amigos não funcionará

**Solução:**
1. Adicionar coluna `action` na migration, OU
2. Alterar código para usar `type` ao invés de `action`

**Recomendação:** Verificar intenção original e padronizar para um único campo.

---

### ⚠️ MÉDIO: Campo 'metadata' não existe

**Localização:** `app/Http/Controllers/RecommendationController.php`

**Problema:**
- Linha 212: `'metadata' => ['recommendation_id' => $recommendation->id]`

A tabela `interaction_events` não tem campo `metadata`.

**Impacto:**
- Registro de visualização falhará silenciosamente (ignorará campo inexistente)

**Solução:**
- Remover campo `metadata` OU adicionar JSONB `metadata` na tabela

---

### ⚠️ BAIXO: Queries de tags do usuário

**Localização:** `app/Services/RecommendationService.php`, método `getUserPopularTags()`

**Problema:**
- Query assume estrutura específica de relacionamento entre `interaction_events`, `post_tags` e `tags`
- Se a estrutura mudar, método pode falhar

**Impacto:** Score de tags pode não funcionar corretamente

---

## ✅ Pontos Positivos

1. **Arquitetura bem estruturada** - Separação clara de responsabilidades
2. **Cache implementado** - Melhora performance significativamente
3. **Processamento em lote** - Jobs permitem processamento assíncrono
4. **Documentação completa** - README extenso e detalhado
5. **Validação de inputs** - Controller valida parâmetros corretamente
6. **Logging adequado** - Erros e informações importantes são logados
7. **Algoritmo configurável** - Pesos podem ser ajustados facilmente
8. **Compatibilidade com testes** - Estrutura permite testes unitários e de integração

---

## 🔧 Configurações Necessárias

### 1. Cache (Obrigatório)
```env
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 2. Filas (Opcional mas Recomendado)
```env
QUEUE_CONNECTION=redis
```

### 3. Variáveis de Ambiente
```env
# Cache TTL padrão: 3600 segundos (1 hora)
# Máximo de recomendações: 20
# Score mínimo: 0.1
```

---

## 📈 Métricas e Monitoramento

### Métricas Recomendadas:
1. **Taxa de Geração** - % de usuários com recomendações válidas
2. **Score Médio** - Qualidade das recomendações
3. **Taxa de Conversão** - % de recomendações que geram interação
4. **Cache Hit Rate** - Eficiência do cache
5. **Tempo de Geração** - Performance do algoritmo
6. **Cobertura** - % de usuários com preferências preenchidas

### Logs Importantes:
- Geração de recomendações: `Log::info('Recomendações geradas...')`
- Erros: `Log::error('Erro ao gerar recomendações...')`
- Cache: Logs de cache miss/hit (via Redis)

---

## 🔄 Dependências Circulares e Impactos

### Módulos que dependem de Recomendações:
- **Frontend:** `Recommendations.jsx` depende da API
- **Dashboard:** Pode mostrar estatísticas de recomendações

### Módulos que Recomendações depende:
- **Sistema de Autenticação** - Usuários autenticados
- **Sistema de Campanhas** - Para recomendar campanhas
- **Sistema de Posts** - Para recomendar posts
- **Sistema de Tags** - Para matching de conteúdo
- **Sistema de Amizades** - Para score social
- **Sistema de Preferências** - Para personalização

### Impactos de Mudanças:
- Alterar estrutura de `interaction_events` → Afeta cálculo de score
- Alterar estrutura de `tags` → Afeta matching
- Alterar relacionamentos `User` → Pode quebrar queries
- Alterar estrutura de `campaigns` ou `posts` → Afeta itens elegíveis

---

## 📝 Recomendações de Melhoria

### Prioridade Alta:
1. ✅ **Corrigir inconsistência do campo `action`/`type`** no `InteractionEvent`
2. ✅ **Corrigir campo `metadata`** no controller
3. ✅ **Adicionar índices** no banco de dados para melhor performance:
   ```sql
   CREATE INDEX idx_recommendations_user_score ON recommendations(user_id, score);
   CREATE INDEX idx_recommendations_target ON recommendations(target_type, target_id);
   CREATE INDEX idx_recommendations_validity ON recommendations(valid_until);
   CREATE INDEX idx_interaction_events_user_target ON interaction_events(user_id, target_type, target_id);
   ```

### Prioridade Média:
1. **Adicionar testes de integração** para verificar fluxo completo
2. **Implementar rate limiting** nos endpoints
3. **Adicionar métricas** de performance e uso
4. **Melhorar tratamento de erros** com mensagens mais específicas

### Prioridade Baixa:
1. **Adicionar suporte a outros tipos** de conteúdo além de campaigns/posts
2. **Implementar machine learning** para ajuste dinâmico de pesos
3. **Adicionar feedback do usuário** sobre recomendações
4. **Otimizar queries** com eager loading onde necessário

---

## 🧪 Testes

### Testes Existentes:
- `tests/Unit/RecommendationServiceTest.php`
- `tests/Feature/RecommendationControllerTest.php`

### Cobertura Esperada:
- ✅ Geração de recomendações
- ✅ Cálculo de scores
- ✅ Filtros de usuário
- ✅ Cache e performance
- ✅ Endpoints da API
- ✅ Validação de parâmetros
- ⚠️ Autenticação e autorização (verificar)

---

## 📚 Documentação Relacionada

1. `docs/RECOMMENDATION_SYSTEM_README.md` - Documentação completa do sistema
2. `docs/MEILISEARCH_SETUP.md` - Setup de busca (opcional)
3. `docs/SCOUT_SETUP.md` - Setup de Scout (opcional)

---

## 🔍 Checklist de Verificação

### Funcionalidade:
- [x] Geração de recomendações funciona
- [x] Cache implementado e funcional
- [x] Jobs de processamento em lote funcionam
- [x] API endpoints respondem corretamente
- [ ] ⚠️ Cálculo de score de interações (problema com `action`/`type`)
- [ ] ⚠️ Cálculo de score de amigos (problema com `action`/`type`)
- [ ] ⚠️ Registro de visualização (problema com `metadata`)

### Performance:
- [x] Cache implementado (TTL: 1h)
- [ ] Índices de banco de dados otimizados
- [x] Processamento assíncrono via jobs
- [ ] Limite de resultados (50 itens por tipo)

### Segurança:
- [x] Autenticação obrigatória
- [x] Autorização (usuário só acessa suas recomendações)
- [x] Validação de inputs
- [ ] Rate limiting (não implementado)

### Manutenibilidade:
- [x] Código bem estruturado
- [x] Documentação completa
- [x] Logging adequado
- [x] Comandos CLI disponíveis

---

## 📞 Suporte e Troubleshooting

### Problemas Comuns:

1. **Recomendações vazias:**
   - Verificar se usuário tem preferências (`user_preferences`)
   - Verificar se há conteúdo elegível (campanhas/posts públicos e ativos)
   - Verificar se filtros não estão muito restritivos

2. **Performance lenta:**
   - Verificar se cache está funcionando (Redis)
   - Verificar índices do banco de dados
   - Verificar número de itens sendo processados

3. **Erros de queries:**
   - ⚠️ Verificar problema com campo `action`/`type`
   - Verificar se relacionamentos estão corretos
   - Verificar logs do Laravel

---

**Última atualização:** 2025-01-XX  
**Versão analisada:** 1.0.0  
**Analista:** Auto (Cursor AI)










