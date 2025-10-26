# 💬 Sistema de Chat DM - Componentes React

Sistema completo de chat direto (DM) integrado à API Laravel, desenvolvido com React e Pusher para comunicação em tempo real.

## 🚀 **Funcionalidades**

- ✅ **Chat em tempo real** com Pusher
- ✅ **Mensagens de texto e mídia** (imagens, vídeos, documentos)
- ✅ **Indicadores de digitação** em tempo real
- ✅ **Busca de usuários** para iniciar conversas
- ✅ **Lista de conversas** com preview das mensagens
- ✅ **Upload de arquivos** com preview
- ✅ **Interface responsiva** e moderna
- ✅ **Paginação de mensagens** com scroll infinito
- ✅ **Notificações** e contadores de não lidas
- ✅ **Navegação por teclado** completa

## 📁 **Estrutura de Arquivos**

```
resources/js/
├── hooks/
│   └── useChatDM.js              # Hook principal para gerenciamento do chat
├── components/
│   ├── ChatInterface.jsx         # Interface principal do chat
│   ├── ChatSidebar.jsx           # Sidebar com lista de conversas
│   ├── MessageList.jsx           # Lista de mensagens com paginação
│   ├── MessageBubble.jsx         # Componente individual de mensagem
│   ├── MessageInput.jsx          # Input para envio de mensagens
│   ├── UserSearch.jsx            # Busca de usuários
│   └── TypingIndicator.jsx       # Indicador de digitação
├── pages/
│   └── ChatDMPage.jsx           # Página de exemplo
└── config/
    └── chatConfig.js             # Configurações e utilitários
```

## 🛠️ **Instalação e Configuração**

### **1. Dependências**

```bash
npm install pusher-js laravel-echo @laravel/echo-react
```

### **2. Variáveis de Ambiente**

```env
# .env
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=mt1

# Frontend
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

### **3. Configuração do Laravel Echo**

```javascript
// resources/js/bootstrap.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authEndpoint: '/api/broadcasting/auth',
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
    },
});
```

## 🎯 **Como Usar**

### **1. Uso Básico**

```jsx
import React from 'react';
import ChatInterface from './components/ChatInterface';

const App = () => {
    return (
        <div className="h-screen">
            <ChatInterface />
        </div>
    );
};

export default App;
```

### **2. Uso com Hook Personalizado**

```jsx
import React from 'react';
import { useChatDM } from './hooks/useChatDM';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';

const CustomChat = () => {
    const {
        conversations,
        currentConversation,
        messages,
        sendMessage,
        setCurrentConversation
    } = useChatDM();

    return (
        <div className="flex h-screen">
            {/* Sua interface personalizada */}
            <div className="flex-1 flex flex-col">
                <MessageList messages={messages} />
                <MessageInput onSendMessage={sendMessage} />
            </div>
        </div>
    );
};
```

### **3. Integração com Rotas**

```jsx
// resources/js/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatDMPage from './pages/ChatDMPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/chat" element={<ChatDMPage />} />
                {/* outras rotas */}
            </Routes>
        </Router>
    );
}
```

## 🔧 **Configurações Avançadas**

### **Personalizar Configurações**

```javascript
// resources/js/config/chatConfig.js
export const chatConfig = {
    ui: {
        messagesPerPage: 50,        // Mensagens por página
        maxMessageLength: 5000,    // Máximo de caracteres
        maxFileSize: 10 * 1024 * 1024, // 10MB
        typingTimeout: 3000,       // Timeout para digitação
    },
    
    allowedFileTypes: [
        'image/jpeg',
        'image/png',
        'video/mp4',
        'application/pdf'
    ]
};
```

### **Estilização Personalizada**

Os componentes usam classes Tailwind CSS. Você pode personalizar os estilos:

```jsx
// Exemplo de personalização
<ChatInterface 
    className="custom-chat-interface"
    sidebarClassName="custom-sidebar"
    messageClassName="custom-message"
/>
```

## 📡 **API Endpoints Necessários**

O sistema espera os seguintes endpoints na API Laravel:

```php
// Conversas
GET    /api/chat/conversations              # Listar conversas DM
POST   /api/chat/conversations              # Criar conversa DM
GET    /api/chat/conversations/{id}         # Detalhes da conversa

// Mensagens  
GET    /api/chat/conversations/{id}/messages # Listar mensagens
POST   /api/chat/conversations/{id}/messages # Enviar mensagem
POST   /api/chat/conversations/{id}/typing   # Indicar digitação
POST   /api/chat/conversations/{id}/mark-read # Marcar como lida

// Usuários
GET    /api/users/search                     # Buscar usuários
```

## 🎨 **Componentes Disponíveis**

### **ChatInterface**
Interface principal que combina todos os componentes.

**Props:**
- `className` - Classes CSS adicionais
- `onError` - Callback para erros

### **ChatSidebar**
Sidebar com lista de conversas e busca.

**Props:**
- `conversations` - Array de conversas
- `currentConversation` - Conversa ativa
- `onConversationSelect` - Callback de seleção
- `onNewChat` - Callback para nova conversa
- `loading` - Estado de carregamento

### **MessageList**
Lista de mensagens com paginação e scroll infinito.

**Props:**
- `messages` - Array de mensagens
- `onLoadMore` - Callback para carregar mais
- `hasMore` - Se há mais mensagens
- `loading` - Estado de carregamento

### **MessageBubble**
Componente individual de mensagem.

**Props:**
- `message` - Objeto da mensagem
- `showAvatar` - Se deve mostrar avatar

### **MessageInput**
Input para envio de mensagens com upload.

**Props:**
- `onSendMessage` - Callback de envio
- `disabled` - Se está desabilitado

### **UserSearch**
Busca de usuários para nova conversa.

**Props:**
- `onUserSelect` - Callback de seleção
- `onClose` - Callback de fechamento

### **TypingIndicator**
Indicador de usuários digitando.

**Props:**
- `users` - Array de usuários digitando

## 🔒 **Autenticação**

O sistema usa tokens JWT armazenados no localStorage:

```javascript
// Armazenar token após login
localStorage.setItem('auth_token', token);

// O token é automaticamente incluído nas requisições
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

## 📱 **Responsividade**

Os componentes são totalmente responsivos e funcionam em:
- ✅ Desktop
- ✅ Tablet  
- ✅ Mobile

## 🎯 **Recursos Avançados**

### **Upload de Arquivos**
- Suporte a imagens, vídeos e documentos
- Preview de imagens
- Validação de tipo e tamanho
- Progress indicator

### **Indicadores de Digitação**
- Detecção automática de digitação
- Timeout configurável
- Múltiplos usuários simultâneos

### **Notificações**
- Notificações desktop
- Sons de notificação
- Contadores de não lidas

### **Navegação por Teclado**
- Setas para navegar
- Enter para selecionar
- Esc para fechar

## 🐛 **Troubleshooting**

### **Problemas Comuns**

1. **Pusher não conecta**
   - Verificar credenciais no .env
   - Verificar se o cluster está correto
   - Verificar token de autenticação

2. **Mensagens não aparecem**
   - Verificar se o Echo está inicializado
   - Verificar console para erros
   - Verificar se o usuário tem permissão

3. **Upload não funciona**
   - Verificar configuração do CORS
   - Verificar limites de upload do servidor
   - Verificar tipos de arquivo permitidos

### **Debug**

```javascript
// Habilitar logs do Pusher
window.Echo.connector.pusher.config.logToConsole = true;

// Verificar conexão
console.log('Echo connected:', window.Echo.connector.pusher.connection.state);
```

## 📈 **Performance**

### **Otimizações Implementadas**
- Paginação de mensagens
- Lazy loading de imagens
- Debounce na busca
- Memoização de componentes
- Scroll virtual para listas grandes

### **Métricas Recomendadas**
- < 100ms para envio de mensagem
- < 500ms para carregamento inicial
- < 50ms para indicadores de digitação

## 🔄 **Atualizações Futuras**

- [ ] Mensagens temporárias
- [ ] Reações em mensagens
- [ ] Criptografia end-to-end
- [ ] Mensagens offline
- [ ] Integração com sistema de notificações push
- [ ] Modo escuro
- [ ] Temas personalizáveis

## 📚 **Documentação Adicional**

- [Laravel Broadcasting](https://laravel.com/docs/broadcasting)
- [Pusher Documentation](https://pusher.com/docs)
- [Laravel Echo](https://laravel.com/docs/echo)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)

---

**Status**: ✅ **Implementação Completa**  
**Versão**: 1.0.0  
**Última Atualização**: Dezembro 2024
