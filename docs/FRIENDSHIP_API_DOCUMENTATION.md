# Documentação da API de Amizades

## Visão Geral

Esta API permite gerenciar conexões entre usuários através de solicitações de amizade, com controle total do usuário sobre suas conexões.

## Autenticação

Todas as rotas requerem autenticação via Sanctum. Inclua o token no header:
```
Authorization: Bearer {token}
```

## Endpoints

### 1. Listar Amigos
**GET** `/api/friendships/`

**Parâmetros de Query:**
- `per_page` (int, opcional): Número de itens por página (padrão: 15)
- `search` (string, opcional): Buscar por nome ou handle
- `status` (string, opcional): Status da amizade (padrão: 'active')

**Resposta:**
```json
{
    "success": true,
    "data": {
        "data": [
            {
                "id": 1,
                "user_id": 1,
                "friend_id": 2,
                "state": "active",
                "since": "2024-01-01T00:00:00.000000Z",
                "friend": {
                    "id": 2,
                    "handle": "usuario2",
                    "display_name": "Usuário 2",
                    "avatar_url": "https://example.com/avatar.jpg",
                    "status": "online"
                }
            }
        ],
        "current_page": 1,
        "per_page": 15,
        "total": 1
    },
    "message": "Lista de amigos recuperada com sucesso"
}
```

### 2. Enviar Solicitação de Amizade
**POST** `/api/friendships/send-request`

**Body:**
```json
{
    "user_id": 2,
    "message": "Olá! Gostaria de ser seu amigo."
}
```

**Resposta:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "from_user_id": 1,
        "to_user_id": 2,
        "status": "pending",
        "message": "Olá! Gostaria de ser seu amigo.",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "from_user": {
            "id": 1,
            "handle": "usuario1",
            "display_name": "Usuário 1"
        },
        "to_user": {
            "id": 2,
            "handle": "usuario2",
            "display_name": "Usuário 2"
        }
    },
    "message": "Solicitação de amizade enviada com sucesso"
}
```

### 3. Responder Solicitação de Amizade
**POST** `/api/friendships/respond-request`

**Body:**
```json
{
    "request_id": 1,
    "action": "accept" // ou "reject"
}
```

**Resposta:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "from_user_id": 1,
        "to_user_id": 2,
        "status": "accepted",
        "message": "Olá! Gostaria de ser seu amigo.",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "responded_at": "2024-01-01T01:00:00.000000Z"
    },
    "message": "Solicitação de amizade aceita com sucesso"
}
```

### 4. Cancelar Solicitação Enviada
**POST** `/api/friendships/cancel-request`

**Body:**
```json
{
    "request_id": 1
}
```

**Resposta:**
```json
{
    "success": true,
    "message": "Solicitação cancelada com sucesso"
}
```

### 5. Remover Amizade
**DELETE** `/api/friendships/remove`

**Body:**
```json
{
    "friend_id": 2
}
```

**Resposta:**
```json
{
    "success": true,
    "message": "Amizade removida com sucesso"
}
```

### 6. Bloquear Usuário
**POST** `/api/friendships/block`

**Body:**
```json
{
    "user_id": 2
}
```

**Resposta:**
```json
{
    "success": true,
    "message": "Usuário bloqueado com sucesso"
}
```

### 7. Desbloquear Usuário
**POST** `/api/friendships/unblock`

**Body:**
```json
{
    "user_id": 2
}
```

**Resposta:**
```json
{
    "success": true,
    "message": "Usuário desbloqueado com sucesso"
}
```

### 8. Listar Solicitações Recebidas
**GET** `/api/friendships/requests/received`

**Parâmetros de Query:**
- `per_page` (int, opcional): Número de itens por página (padrão: 15)

**Resposta:**
```json
{
    "success": true,
    "data": {
        "data": [
            {
                "id": 1,
                "from_user_id": 2,
                "to_user_id": 1,
                "status": "pending",
                "message": "Olá! Gostaria de ser seu amigo.",
                "created_at": "2024-01-01T00:00:00.000000Z",
                "from_user": {
                    "id": 2,
                    "handle": "usuario2",
                    "display_name": "Usuário 2",
                    "avatar_url": "https://example.com/avatar.jpg"
                }
            }
        ]
    },
    "message": "Solicitações recebidas recuperadas com sucesso"
}
```

### 9. Listar Solicitações Enviadas
**GET** `/api/friendships/requests/sent`

**Parâmetros de Query:**
- `per_page` (int, opcional): Número de itens por página (padrão: 15)

**Resposta:**
```json
{
    "success": true,
    "data": {
        "data": [
            {
                "id": 1,
                "from_user_id": 1,
                "to_user_id": 2,
                "status": "pending",
                "message": "Olá! Gostaria de ser seu amigo.",
                "created_at": "2024-01-01T00:00:00.000000Z",
                "to_user": {
                    "id": 2,
                    "handle": "usuario2",
                    "display_name": "Usuário 2",
                    "avatar_url": "https://example.com/avatar.jpg"
                }
            }
        ]
    },
    "message": "Solicitações enviadas recuperadas com sucesso"
}
```

### 10. Verificar Status de Relacionamento
**GET** `/api/friendships/relationship-status?user_id=2`

**Resposta:**
```json
{
    "success": true,
    "data": {
        "status": "no_relationship",
        "type": "none"
    },
    "message": "Status do relacionamento recuperado com sucesso"
}
```

**Possíveis Status:**
- `no_relationship`: Sem relacionamento
- `request_sent`: Solicitação enviada
- `request_received`: Solicitação recebida
- `active`: Amigos ativos
- `blocked_by_user`: Bloqueado pelo usuário

## Endpoints de Notificações

### 1. Listar Notificações
**GET** `/api/notifications/`

**Parâmetros de Query:**
- `per_page` (int, opcional): Número de itens por página (padrão: 15)
- `type` (string, opcional): Tipo de notificação
- `unread_only` (boolean, opcional): Apenas não lidas

### 2. Marcar como Lidas
**POST** `/api/notifications/mark-read`

**Body:**
```json
{
    "notification_ids": [1, 2, 3] // opcional, se não enviado marca todas como lidas
}
```

### 3. Contagem de Não Lidas
**GET** `/api/notifications/unread-count`

**Resposta:**
```json
{
    "success": true,
    "data": {
        "unread_count": 5
    },
    "message": "Contagem de notificações não lidas recuperada"
}
```

## Códigos de Erro

- `400`: Dados inválidos
- `401`: Não autenticado
- `403`: Sem permissão
- `404`: Recurso não encontrado
- `409`: Conflito (ex: já são amigos)
- `422`: Erro de validação
- `500`: Erro interno do servidor

## Exemplos de Uso

### Fluxo Completo de Amizade

1. **Enviar solicitação:**
```bash
curl -X POST http://localhost:8000/api/friendships/send-request \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 2, "message": "Olá! Gostaria de ser seu amigo."}'
```

2. **Aceitar solicitação:**
```bash
curl -X POST http://localhost:8000/api/friendships/respond-request \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"request_id": 1, "action": "accept"}'
```

3. **Listar amigos:**
```bash
curl -X GET "http://localhost:8000/api/friendships/?search=usuario" \
  -H "Authorization: Bearer {token}"
```

## Comandos Artisan

### Limpeza de Dados Antigos
```bash
php artisan friendships:cleanup --days=30
```

Este comando remove:
- Solicitações de amizade rejeitadas com mais de 30 dias
- Notificações lidas com mais de 30 dias

## Recursos Adicionais

- **Políticas de Acesso**: Controle granular de permissões
- **Notificações Automáticas**: Sistema completo de notificações
- **Validação Robusta**: Form Requests com validação detalhada
- **Services**: Lógica de negócio separada e reutilizável
- **Resources**: Respostas padronizadas da API
- **Limpeza Automática**: Comando para manutenção dos dados
