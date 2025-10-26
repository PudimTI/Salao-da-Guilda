# API de Mapas Mentais - Documentação

## Visão Geral

Esta documentação descreve a API completa para gerenciamento de mapas mentais dentro das campanhas. O sistema permite que mestres criem, editem e visualizem nós e conexões, associem arquivos e operem o mapa com funcionalidades de drag & drop.

## Autenticação

Todas as rotas requerem autenticação via Laravel Sanctum. Inclua o token de autenticação no header:

```
Authorization: Bearer {token}
```

## Endpoints da API

### Base URL
```
/api/campaigns/{campaign}/mindmap
```

### 1. Listar Mapa Mental

**GET** `/api/campaigns/{campaign}/mindmap`

Retorna todos os nós e conexões do mapa mental de uma campanha.

**Resposta:**
```json
{
    "success": true,
    "data": {
        "nodes": [
            {
                "id": 1,
                "campaign_id": 1,
                "title": "Cidade Principal",
                "notes": "Descrição da cidade...",
                "pos_x": 100.50,
                "pos_y": 200.75,
                "updated_at": "2024-01-15T10:30:00Z",
                "files": [],
                "outgoing_edges": [],
                "incoming_edges": []
            }
        ],
        "edges": [
            {
                "id": 1,
                "campaign_id": 1,
                "source_node_id": 1,
                "target_node_id": 2,
                "label": "conecta com",
                "source_node": {...},
                "target_node": {...}
            }
        ]
    }
}
```

### 2. Criar Nó

**POST** `/api/campaigns/{campaign}/mindmap/nodes`

Cria um novo nó no mapa mental.

**Body:**
```json
{
    "title": "Nome do Nó",
    "notes": "Notas opcionais",
    "pos_x": 100.50,
    "pos_y": 200.75,
    "file_ids": [1, 2, 3]
}
```

**Validação:**
- `title`: obrigatório, string, máximo 150 caracteres
- `notes`: opcional, string
- `pos_x`: opcional, numérico
- `pos_y`: opcional, numérico
- `file_ids`: opcional, array de IDs de arquivos existentes

**Resposta:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "campaign_id": 1,
        "title": "Nome do Nó",
        "notes": "Notas opcionais",
        "pos_x": 100.50,
        "pos_y": 200.75,
        "updated_at": "2024-01-15T10:30:00Z",
        "files": [...],
        "outgoing_edges": [],
        "incoming_edges": []
    },
    "message": "Nó criado com sucesso!"
}
```

### 3. Visualizar Nó

**GET** `/api/campaigns/{campaign}/mindmap/nodes/{node}`

Retorna detalhes de um nó específico.

**Resposta:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "campaign_id": 1,
        "title": "Nome do Nó",
        "notes": "Notas opcionais",
        "pos_x": 100.50,
        "pos_y": 200.75,
        "updated_at": "2024-01-15T10:30:00Z",
        "files": [...],
        "outgoing_edges": [...],
        "incoming_edges": [...]
    }
}
```

### 4. Atualizar Nó

**PUT** `/api/campaigns/{campaign}/mindmap/nodes/{node}`

Atualiza um nó existente.

**Body:**
```json
{
    "title": "Novo Nome",
    "notes": "Novas notas",
    "pos_x": 150.25,
    "pos_y": 250.50,
    "file_ids": [1, 3]
}
```

**Validação:**
- Todos os campos são opcionais
- Mesmas regras de validação do POST

### 5. Deletar Nó

**DELETE** `/api/campaigns/{campaign}/mindmap/nodes/{node}`

Remove um nó do mapa mental.

**Resposta:**
```json
{
    "success": true,
    "message": "Nó deletado com sucesso!"
}
```

### 6. Atualizar Posição do Nó (Drag & Drop)

**PATCH** `/api/campaigns/{campaign}/mindmap/nodes/{node}/position`

Atualiza apenas a posição de um nó (para funcionalidade de drag & drop).

**Body:**
```json
{
    "pos_x": 150.25,
    "pos_y": 250.50
}
```

**Validação:**
- `pos_x`: obrigatório, numérico
- `pos_y`: obrigatório, numérico

### 7. Criar Conexão

**POST** `/api/campaigns/{campaign}/mindmap/edges`

Cria uma conexão entre dois nós.

**Body:**
```json
{
    "source_node_id": 1,
    "target_node_id": 2,
    "label": "conecta com"
}
```

**Validação:**
- `source_node_id`: obrigatório, deve existir na campanha
- `target_node_id`: obrigatório, deve existir na campanha, diferente do source
- `label`: opcional, string, máximo 100 caracteres

**Resposta:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "campaign_id": 1,
        "source_node_id": 1,
        "target_node_id": 2,
        "label": "conecta com",
        "source_node": {...},
        "target_node": {...}
    },
    "message": "Conexão criada com sucesso!"
}
```

### 8. Atualizar Conexão

**PUT** `/api/campaigns/{campaign}/mindmap/edges/{edge}`

Atualiza uma conexão existente.

**Body:**
```json
{
    "label": "Nova descrição"
}
```

### 9. Deletar Conexão

**DELETE** `/api/campaigns/{campaign}/mindmap/edges/{edge}`

Remove uma conexão do mapa mental.

### 10. Listar Arquivos Disponíveis

**GET** `/api/campaigns/{campaign}/mindmap/files`

Retorna todos os arquivos da campanha que podem ser associados aos nós.

**Resposta:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "mapa_cidade.pdf",
            "uploader": {
                "id": 1,
                "name": "João Silva"
            }
        }
    ]
}
```

### 11. Associar Arquivo a Nó

**POST** `/api/campaigns/{campaign}/mindmap/nodes/{node}/files`

Associa um arquivo a um nó específico.

**Body:**
```json
{
    "file_id": 1
}
```

### 12. Desassociar Arquivo de Nó

**DELETE** `/api/campaigns/{campaign}/mindmap/nodes/{node}/files`

Remove a associação de um arquivo de um nó.

**Body:**
```json
{
    "file_id": 1
}
```

### 13. Exportar Mapa Mental

**GET** `/api/campaigns/{campaign}/mindmap/export`

Exporta a estrutura completa do mapa mental.

**Resposta:**
```json
{
    "success": true,
    "data": {
        "campaign": {
            "id": 1,
            "name": "Campanha Exemplo",
            "exported_at": "2024-01-15T10:30:00Z"
        },
        "nodes": [...],
        "edges": [...]
    }
}
```

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Recurso não encontrado
- `422` - Erro de validação
- `500` - Erro interno do servidor

## Autorização

### Permissões por Role

| Ação | Dono | Master | Co-Master | Player |
|------|------|--------|-----------|-------|
| Visualizar mapa | ✅ | ✅ | ✅ | ✅ |
| Criar nós | ✅ | ✅ | ✅ | ❌ |
| Editar nós | ✅ | ✅ | ✅ | ❌ |
| Deletar nós | ✅ | ❌ | ❌ | ❌ |
| Criar conexões | ✅ | ✅ | ✅ | ❌ |
| Editar conexões | ✅ | ✅ | ✅ | ❌ |
| Deletar conexões | ✅ | ❌ | ❌ | ❌ |

## Integração com Spatie Media Library

O sistema utiliza o Spatie Media Library para gerenciamento de arquivos. Os nós podem ter arquivos associados através da tabela pivot `mindmap_node_files`.

### Configuração de Mídia

```php
// No model MindmapNode
public function registerMediaCollections(): void
{
    $this->addMediaCollection('attachments')
        ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'])
        ->singleFile();
}
```

## Interface Admin

### Rotas Admin

- `GET /admin/mindmap` - Listar todos os mapas mentais
- `GET /admin/mindmap/{campaign}` - Visualizar mapa específico
- `GET /admin/mindmap/stats` - Estatísticas dos mapas mentais
- `GET /admin/mindmap/export` - Exportar todos os mapas
- `GET /admin/mindmap/{campaign}/export` - Exportar mapa específico

### Funcionalidades Admin

- Visualização de todos os mapas mentais do sistema
- Estatísticas de uso e adoção
- Exportação em massa
- Gerenciamento de nós e conexões
- Monitoramento de atividade

## Exemplos de Uso

### Criar um Mapa Mental Completo

```javascript
// 1. Criar nós
const node1 = await fetch('/api/campaigns/1/mindmap/nodes', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        title: 'Cidade Principal',
        notes: 'Capital do reino',
        pos_x: 100,
        pos_y: 100
    })
});

const node2 = await fetch('/api/campaigns/1/mindmap/nodes', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        title: 'Floresta Sombria',
        notes: 'Floresta perigosa ao norte',
        pos_x: 200,
        pos_y: 150
    })
});

// 2. Conectar os nós
await fetch('/api/campaigns/1/mindmap/edges', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        source_node_id: 1,
        target_node_id: 2,
        label: 'conecta com'
    })
});

// 3. Atualizar posição (drag & drop)
await fetch('/api/campaigns/1/mindmap/nodes/1/position', {
    method: 'PATCH',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        pos_x: 120,
        pos_y: 110
    })
});
```

### Associar Arquivo a Nó

```javascript
await fetch('/api/campaigns/1/mindmap/nodes/1/files', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        file_id: 5
    })
});
```

## Tratamento de Erros

### Erro de Validação (422)

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "title": ["O título do nó é obrigatório."],
        "pos_x": ["A posição X deve ser um número."]
    }
}
```

### Erro de Autorização (403)

```json
{
    "success": false,
    "message": "Você não tem permissão para realizar esta ação."
}
```

### Erro de Recurso Não Encontrado (404)

```json
{
    "success": false,
    "message": "Nó não encontrado."
}
```

## Rate Limiting

A API implementa rate limiting padrão do Laravel:
- 60 requests por minuto por usuário autenticado
- 10 requests por minuto para usuários não autenticados

## Logs e Monitoramento

Todas as operações são logadas para auditoria:
- Criação, edição e exclusão de nós
- Criação, edição e exclusão de conexões
- Associação/desassociação de arquivos
- Exportação de mapas mentais

## Backup e Recuperação

O sistema mantém:
- Backup automático dos mapas mentais
- Histórico de alterações (através do campo `updated_at`)
- Exportação para recuperação em caso de perda de dados
