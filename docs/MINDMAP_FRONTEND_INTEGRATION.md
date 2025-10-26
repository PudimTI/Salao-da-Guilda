# Integração Frontend - Mapa Mental

## Visão Geral

A integração frontend do mapa mental foi implementada para permitir que mestres e jogadores visualizem e editem mapas mentais diretamente do chat da campanha. O sistema oferece uma interface interativa com funcionalidades de drag & drop, criação de nós e conexões.

## Arquivos Criados/Modificados

### 1. View Blade
- **`resources/views/campaign-mindmap.blade.php`** - View principal do mapa mental
  - Layout responsivo com estilos CSS customizados
  - Container para React app
  - Fallback para usuários sem JavaScript

### 2. Componente React
- **`resources/js/components/MindmapPage.jsx`** - Componente principal do mapa mental
  - Interface interativa com drag & drop
  - CRUD completo para nós e conexões
  - Modais para criação e edição
  - Integração com API backend

### 3. Integração com Chat
- **`resources/js/components/CampaignControls.jsx`** - Atualizado para incluir botão do mapa mental
  - Botão funcional que redireciona para `/campaigns/{id}/mindmap`
  - Integração com campaignId

### 4. Rotas
- **`routes/web.php`** - Adicionada rota para mapa mental
  - `GET /campaigns/{campaign}/mindmap` → View do mapa mental

### 5. Configuração React
- **`resources/js/app.js`** - Atualizado para montar MindmapPage
- **`resources/js/components/index.js`** - Export do MindmapPage

## Funcionalidades Implementadas

### 🎯 Interface Principal
- **Canvas interativo** com fundo gradiente
- **Toolbar flutuante** com controles principais
- **Sidebar** para arquivos disponíveis
- **Nós arrastáveis** com posicionamento em tempo real

### 🧠 Gerenciamento de Nós
- **Criar nós** com título e notas
- **Editar nós** existentes
- **Deletar nós** com confirmação
- **Drag & drop** para reposicionamento
- **Seleção visual** de nós ativos

### 🔗 Gerenciamento de Conexões
- **Criar conexões** entre nós
- **Modo de criação** com feedback visual
- **Deletar conexões** existentes
- **Rótulos** para conexões
- **Renderização SVG** das conexões

### 📎 Integração com Arquivos
- **Lista de arquivos** disponíveis da campanha
- **Associação** de arquivos aos nós
- **Visualização** de arquivos associados

### 🎨 Interface Visual
- **Design responsivo** com Tailwind CSS
- **Animações suaves** para interações
- **Feedback visual** para ações
- **Modais** para criação/edição
- **Estados de loading** e erro

## Como Usar

### 1. Acessar o Mapa Mental
1. Entre no chat da campanha
2. Clique no botão **"🧠 Mapa mental"** na sidebar direita
3. Será redirecionado para `/campaigns/{id}/mindmap`

### 2. Criar um Nó
1. Clique em **"➕ Novo Nó"** na toolbar
2. Preencha o título (obrigatório) e notas (opcional)
3. Clique em **"Criar"**
4. O nó aparecerá no canvas

### 3. Mover um Nó (Drag & Drop)
1. Clique e arraste qualquer nó pelo canvas
2. A posição será atualizada automaticamente
3. A conexão com outros nós será mantida

### 4. Criar uma Conexão
1. Clique em **"🔗 Criar Conexão"** na toolbar
2. Clique no nó de origem
3. Clique no nó de destino
4. A conexão será criada automaticamente

### 5. Editar um Nó
1. Clique em qualquer nó para selecioná-lo
2. Um modal de edição aparecerá
3. Modifique título e notas
4. Clique em **"Salvar"**

### 6. Deletar um Nó
1. Selecione o nó desejado
2. No modal de edição, clique em **"Deletar"**
3. Confirme a ação
4. O nó e suas conexões serão removidos

## Estrutura Técnica

### Componente MindmapPage
```jsx
const MindmapPage = ({ campaignId }) => {
    // Estados principais
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [files, setFiles] = useState([]);
    
    // Funcionalidades
    - loadMindmapData()      // Carregar dados
    - createNode()           // Criar nó
    - updateNode()           // Atualizar nó
    - deleteNode()           // Deletar nó
    - createEdge()           // Criar conexão
    - updateNodePosition()   // Drag & drop
}
```

### API Integration
```javascript
// Endpoints utilizados
GET    /api/campaigns/{id}/mindmap              // Carregar mapa
POST   /api/campaigns/{id}/mindmap/nodes        // Criar nó
PUT    /api/campaigns/{id}/mindmap/nodes/{id}   // Atualizar nó
DELETE /api/campaigns/{id}/mindmap/nodes/{id}   // Deletar nó
POST   /api/campaigns/{id}/mindmap/edges       // Criar conexão
DELETE /api/campaigns/{id}/mindmap/edges/{id}  // Deletar conexão
```

### Estilos CSS
```css
.mindmap-container     // Container principal
.mindmap-node         // Estilo dos nós
.mindmap-edge         // Estilo das conexões
.mindmap-toolbar      // Toolbar flutuante
.mindmap-sidebar      // Sidebar de arquivos
```

## Responsividade

### Desktop
- **Toolbar** no canto superior esquerdo
- **Sidebar** no canto superior direito
- **Canvas** ocupa toda a tela
- **Drag & drop** com mouse

### Mobile
- **Interface adaptada** para touch
- **Modais** em tela cheia
- **Controles otimizados** para dedos
- **Scroll** para navegação

## Estados da Aplicação

### Loading
```jsx
if (loading) {
    return <LoadingSpinner />;
}
```

### Error
```jsx
if (error) {
    return <ErrorMessage onRetry={loadMindmapData} />;
}
```

### Empty State
```jsx
if (nodes.length === 0) {
    return <EmptyState onCreateNode={createNode} />;
}
```

## Integração com Backend

### Autenticação
- Utiliza **Laravel Sanctum** para autenticação
- Token incluído automaticamente nas requisições
- Verificação de permissões por role

### Autorização
- **Dono/Master**: Pode criar, editar e deletar
- **Co-Master**: Pode criar e editar
- **Player**: Apenas visualização

### Validação
- **Frontend**: Validação em tempo real
- **Backend**: Validação robusta com Request classes
- **Feedback**: Mensagens de erro claras

## Performance

### Otimizações
- **Debounce** para atualizações de posição
- **Memoização** de componentes pesados
- **Lazy loading** de arquivos
- **Virtual scrolling** para listas grandes

### Caching
- **Local storage** para preferências
- **Session storage** para estado temporário
- **API caching** para dados estáticos

## Troubleshooting

### Problemas Comuns

1. **Botão não funciona**
   - Verificar se `campaignId` está sendo passado
   - Verificar se a rota está registrada

2. **Nós não carregam**
   - Verificar autenticação
   - Verificar permissões da campanha
   - Verificar console para erros

3. **Drag & drop não funciona**
   - Verificar se o mouse está sendo capturado
   - Verificar se não há conflitos de CSS
   - Verificar se os event listeners estão ativos

4. **Conexões não aparecem**
   - Verificar se o SVG está sendo renderizado
   - Verificar se as posições dos nós estão corretas
   - Verificar se as conexões existem no backend

### Debug
```javascript
// Ativar logs detalhados
localStorage.setItem('debug', 'mindmap:*');

// Verificar estado
console.log('Nodes:', nodes);
console.log('Edges:', edges);
console.log('Files:', files);
```

## Próximos Passos

### Funcionalidades Futuras
- **Zoom e pan** no canvas
- **Grupos** de nós
- **Temas** visuais
- **Exportação** para imagem
- **Colaboração** em tempo real
- **Histórico** de alterações
- **Templates** de mapas

### Melhorias Técnicas
- **WebSockets** para colaboração
- **Service Worker** para offline
- **PWA** para mobile
- **Acessibilidade** melhorada
- **Testes** automatizados

## Conclusão

A integração frontend do mapa mental está **completa e funcional**, oferecendo uma experiência rica e interativa para gerenciamento de mapas mentais dentro das campanhas. O sistema é **responsivo**, **performático** e **fácil de usar**, proporcionando uma ferramenta poderosa para mestres organizarem suas campanhas de forma visual e intuitiva.
