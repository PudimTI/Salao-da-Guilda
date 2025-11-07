# Análise do Sistema de Convites de Campanha

## 📋 Visão Geral

O sistema de convites de campanha permite que mestres/donos convidem usuários para suas campanhas e que usuários solicitem entrada em campanhas. O sistema é bidirecional: convites enviados e solicitações recebidas.

---

## 🏗️ Arquitetura

### **1. Modelo de Dados (`CampaignInvite`)**

#### Estrutura da Tabela:
```php
- id (bigint)
- campaign_id (bigint) → FK para campaigns
- inviter_id (bigint) → FK para users (quem envia)
- invitee_id (bigint) → FK para users (quem recebe)
- status (string, 20) → 'pending', 'accepted', 'rejected', 'cancelled'
- message (text, nullable) → Mensagem personalizada
- sent_at (timestamp, nullable) → Data/hora do envio
- responded_at (timestamp, nullable) → Data/hora da resposta
```

#### Relacionamentos:
- `campaign()` → BelongsTo Campaign
- `inviter()` → BelongsTo User (quem enviou)
- `invitee()` → BelongsTo User (quem recebeu)

#### Métodos Auxiliares:
- `isPending()`, `isAccepted()`, `isRejected()`, `isCancelled()`
- `isSelfInvite()` → Verifica se inviter_id === invitee_id (auto-solicitação)

---

## 🔄 Fluxos de Funcionamento

### **Fluxo 1: Convite Enviado (Mestre → Usuário)**

1. **Mestre abre modal** (`CampaignInviteModal`)
2. **Carrega lista de amigos** via `friendshipService.getFriends()`
3. **Pesquisa amigos** (busca local + servidor com debounce)
4. **Seleciona amigo** e clica em "Convidar"
5. **Opção de adicionar mensagem** (opcional)
6. **Frontend faz POST** → `/api/campaigns/{campaign}/invites/invite-user`
7. **Backend valida**:
   - Verifica permissão (`authorize('invite', $campaign)`)
   - Valida email (`InviteToCampaignRequest`)
   - Verifica se usuário existe
   - Verifica se já é membro
   - Verifica se já existe convite pendente
8. **Cria convite** com status `'pending'`
9. **Retorna sucesso** com dados do convite
10. **Frontend atualiza** lista via callback `onInviteSuccess`

### **Fluxo 2: Solicitação de Entrada (Usuário → Mestre)**

1. **Usuário solicita entrada** (removido do modal atual - apenas convites)
2. **POST** → `/api/campaigns/{campaign}/invites/request-with-character`
3. **Backend valida**:
   - Verifica se personagem pertence ao usuário
   - Verifica se personagem já está na campanha
   - Verifica se usuário já é membro
   - Verifica se já existe solicitação pendente
4. **Cria convite** com:
   - `inviter_id` = usuário que solicita
   - `invitee_id` = dono da campanha
   - `status` = 'pending'
5. **Mestre vê** na aba "Solicitações" do `CampaignInviteManager`

### **Fluxo 3: Aceitar/Rejeitar Convite**

#### Para o Usuário Recebedor:
- **GET** `/api/invites` → Lista convites pendentes do usuário
- **POST** `/api/invites/{invite}/accept` → Aceita convite
- **POST** `/api/invites/{invite}/reject` → Rejeita convite

#### Para o Mestre (Solicitações):
- **POST** `/api/campaigns/{campaign}/invites/{invite}/approve` → Aprova solicitação
- **POST** `/api/campaigns/{campaign}/invites/{invite}/reject-request` → Rejeita solicitação

**Ao aceitar/aprovar:**
- Status do convite → `'accepted'`
- `responded_at` → now()
- Usuário adicionado à tabela `campaign_members` com:
  - `role` = 'player'
  - `status` = 'active'
  - `joined_at` = now()

---

## 🎨 Componentes Frontend

### **1. CampaignInviteModal**
**Localização:** `resources/js/components/CampaignInviteModal.jsx`

**Funcionalidades:**
- ✅ Carrega lista de amigos do usuário
- ✅ Busca de amigos em tempo real (debounce 300ms)
- ✅ Exibe lista de amigos com avatar, nome, handle, email
- ✅ Botão "Convidar" por amigo
- ✅ Input de mensagem opcional (Enter para enviar, Escape para cancelar)
- ✅ Feedback visual durante envio
- ✅ Toast notifications para sucesso/erro

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: function,
  campaignId: number,
  campaignName: string,
  onInviteSuccess: function (callback após sucesso)
}
```

**Estado:**
- `friends`: Array de amigos
- `searchQuery`: Termo de pesquisa
- `loading`: Carregando amigos
- `invitingFriendId`: ID do amigo sendo convidado
- `inviteMessage`: Mensagem do convite
- `showMessageInput`: ID do amigo que está mostrando input

**Fluxo de Dados:**
```
friendshipService.getFriends() 
  → response.data.data (paginação) ou response.data (array)
  → Filtra localmente também
  → Renderiza lista de amigos
```

### **2. CampaignInviteManager**
**Localização:** `resources/js/components/CampaignInviteManager.jsx`

**Funcionalidades:**
- ✅ Aba "Convites Enviados" → Lista convites enviados pela campanha
- ✅ Aba "Solicitações" → Lista solicitações recebidas
- ✅ Cancelar convites pendentes
- ✅ Aprovar/Rejeitar solicitações
- ✅ Status visual por cor (pending, accepted, rejected, cancelled)

**Props:**
```javascript
{
  campaignId: number
}
```

**Estado:**
- `invites`: Array de convites
- `activeTab`: 'sent' ou 'requests'
- `loading`: Carregando convites

**Lógica de Separação:**
- **Convites Enviados:** `invites.filter(invite => !invite.is_self_invite)`
- **Solicitações:** `invites.filter(invite => invite.is_self_invite)`

**Nota:** `is_self_invite` é determinado por `inviter_id !== invitee_id` no backend.

---

## 🔌 APIs e Rotas

### **Rotas de Convites da Campanha:**
```php
GET    /api/campaigns/{campaign}/invites
POST   /api/campaigns/{campaign}/invites/invite-user
POST   /api/campaigns/{campaign}/invites/request-with-character
POST   /api/campaigns/{campaign}/invites/{invite}/approve
POST   /api/campaigns/{campaign}/invites/{invite}/reject-request
```

### **Rotas de Convites do Usuário:**
```php
GET    /api/invites
POST   /api/invites/{invite}/accept
POST   /api/invites/{invite}/reject
DELETE /api/invites/{invite}/cancel
```

---

## 🔒 Autorização e Validações

### **Validações do Backend:**

#### **inviteUser():**
1. ✅ Autorização: `authorize('invite', $campaign)`
2. ✅ Email válido e existe no banco
3. ✅ Usuário não é membro da campanha
4. ✅ Não existe convite pendente para o usuário

#### **approveRequest():**
1. ✅ Autorização: `authorize('invite', $campaign)`
2. ✅ É uma solicitação (inviter_id !== invitee_id)
3. ✅ Status é 'pending'
4. ✅ Usuário não é membro da campanha

#### **cancel():**
1. ✅ Usuário pode cancelar (inviter_id === Auth::id() OU owner_id === Auth::id())
2. ✅ Status é 'pending'

---

## 📊 Estrutura de Dados

### **Resposta da API - Listar Convites:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "invitee": {
        "id": 2,
        "name": "João",
        "display_name": "João Silva",
        "email": "joao@example.com"
      },
      "inviter": {
        "id": 1,
        "name": "Maria",
        "display_name": "Maria Santos"
      },
      "status": "pending",
      "message": "Venha jogar com a gente!",
      "sent_at": "2024-01-15T10:00:00Z",
      "responded_at": null,
      "is_self_invite": false
    }
  ]
}
```

### **Resposta - Enviar Convite:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "invitee": {
      "id": 2,
      "name": "João",
      "email": "joao@example.com"
    },
    "message": "Venha jogar!",
    "sent_at": "2024-01-15T10:00:00Z"
  },
  "message": "Convite enviado com sucesso!"
}
```

---

## 🐛 Problemas Identificados

### **1. Inconsistência na Estrutura de Dados de Amigos**
- O `CampaignInviteModal` aceita tanto `friend.friend` quanto `friend.user`
- A API pode retornar estruturas diferentes dependendo do endpoint
- **Solução atual:** Fallback para ambas estruturas

### **2. Falta de Notificações**
- TODO no código: "Enviar notificação/email para o usuário"
- Não há sistema de notificações integrado

### **3. Endpoint de Cancelar Incorreto**
- No `CampaignInviteManager`, linha 62:
  ```javascript
  await apiDelete(`/api/invites/${inviteId}/cancel`);
  ```
- Deveria ser `/api/invites/${inviteId}/cancel` mas está correto
- Problema: o endpoint está correto mas pode não estar funcionando

### **4. Falta Feedback Visual**
- Algumas ações não têm toast notifications
- O `CampaignInviteManager` tem TODOs para notificações

---

## ✅ Pontos Fortes

1. ✅ Sistema completo e funcional
2. ✅ Validações robustas no backend
3. ✅ Autorização adequada com Policies
4. ✅ UI intuitiva com feedback visual
5. ✅ Busca eficiente com debounce
6. ✅ Separação clara entre convites enviados e solicitações
7. ✅ Mensagens opcionais personalizadas
8. ✅ Suporte a múltiplas estruturas de dados (fallback)

---

## 🔧 Melhorias Sugeridas

### **1. Adicionar Notificações**
- Integrar com sistema de notificações existente
- Enviar email quando convite é recebido
- Notificar mestre quando há nova solicitação

### **2. Melhorar Feedback Visual**
- Adicionar toast notifications em todas as ações
- Loading states mais claros
- Mensagens de erro mais descritivas

### **3. Paginação**
- Implementar paginação na lista de amigos
- Implementar paginação na lista de convites

### **4. Busca Avançada**
- Filtros por status
- Ordenação por data
- Busca por nome/email

### **5. Histórico**
- Mostrar histórico de convites aceitos/rejeitados
- Estatísticas de convites por campanha

---

## 📝 Conclusão

O sistema de convites de campanha está bem implementado e funcional. As principais funcionalidades estão presentes e funcionando corretamente. As melhorias sugeridas são incrementais e não bloqueiam o uso do sistema.

**Pontos de Atenção:**
- Verificar se notificações serão implementadas
- Padronizar estrutura de dados de amigos
- Adicionar mais feedback visual nas ações

---

**Última Atualização:** 2024-01-15
**Versão:** 1.0








