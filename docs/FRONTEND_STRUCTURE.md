# Estrutura do Frontend - Salão da Guilda

## 🎯 Visão Geral

A aplicação frontend foi estruturada baseada no protótipo fornecido, utilizando React com componentização modular e uma paleta de cores clara com detalhes em roxo.

## 🏗️ Arquitetura de Componentes

### Componentes Principais

#### 1. **Header** (`resources/js/components/Header.jsx`)
- **Função**: Navegação principal da aplicação
- **Características**:
  - Logo clicável
  - Menu de navegação (Home, Campanhas, Encontrar)
  - Dropdown para Campanhas
  - Perfil do usuário com avatar
  - Design responsivo com menu mobile

#### 2. **Hero** (`resources/js/components/Hero.jsx`)
- **Função**: Seção principal de apresentação
- **Características**:
  - Título principal "Salão da Guilda"
  - Subtítulo explicativo
  - Placeholder para imagem/vídeo principal
  - Fundo com gradiente roxo-rosa claro

#### 3. **CampaignCard** (`resources/js/components/CampaignCard.jsx`)
- **Função**: Exibição de campanhas individuais
- **Props**:
  - `campaign`: Objeto com dados da campanha
- **Características**:
  - Imagem da campanha (placeholder)
  - Título e descrição
  - Estatísticas (rating, jogadores, status)
  - Botão "Entrar"
  - Design responsivo

#### 4. **NewAdventures** (`resources/js/components/NewAdventures.jsx`)
- **Função**: Seção de novas aventuras com abas
- **Características**:
  - Abas "Recomendações" e "Criar"
  - Cards de recomendações dinâmicos
  - Seção de criação de aventuras
  - Estado local para controle de abas

#### 5. **Footer** (`resources/js/components/Footer.jsx`)
- **Função**: Rodapé da aplicação
- **Características**:
  - Links de navegação
  - Informações de copyright
  - Design minimalista

#### 6. **Home** (`resources/js/components/Home.jsx`)
- **Função**: Componente principal que integra todos os outros
- **Características**:
  - Layout completo da página
  - Integração de todos os componentes
  - Seção de campanhas em destaque
  - Botão "Ver todas as campanhas"

## 📊 Dados Mockados

### Arquivo: `resources/js/data/mockData.js`

#### Campanhas (`mockCampaigns`)
```javascript
{
  id: number,
  name: string,
  description: string,
  rating: number,
  players: number,
  status: string,
  image: string,
  master: string,
  system: string,
  level: string,
  schedule: string
}
```

#### Usuário (`mockUser`)
```javascript
{
  id: number,
  name: string,
  email: string,
  avatar: string,
  level: string,
  favoriteSystems: array,
  campaignsJoined: number,
  campaignsCreated: number
}
```

#### Recomendações (`mockRecommendations`)
```javascript
{
  id: number,
  title: string,
  description: string,
  system: string,
  level: string,
  players: string,
  duration: string
}
```

## 🎨 Paleta de Cores

### Cores Principais
- **Fundo**: Branco (`bg-white`)
- **Cinza Claro**: `bg-gray-100`, `bg-gray-200`
- **Cinza Médio**: `text-gray-600`, `text-gray-700`
- **Cinza Escuro**: `text-gray-800`

### Cores de Destaque (Roxo)
- **Roxo Principal**: `bg-purple-600`, `text-purple-600`
- **Roxo Hover**: `bg-purple-700`, `text-purple-700`
- **Roxo Claro**: `bg-purple-100`, `text-purple-400`
- **Rosa Claro**: `bg-pink-50`, `from-purple-50 to-pink-50`

## 🔧 Integração com Laravel

### Renderização
- **Elemento Principal**: `#home-app` na view Blade
- **Compatibilidade**: Mantém componentes antigos para compatibilidade
- **Inicialização**: Automática via `DOMContentLoaded`

### Estrutura de Arquivos
```
resources/js/
├── components/
│   ├── Header.jsx
│   ├── Hero.jsx
│   ├── CampaignCard.jsx
│   ├── NewAdventures.jsx
│   ├── Footer.jsx
│   ├── Home.jsx
│   └── index.js
├── data/
│   └── mockData.js
└── app.js
```

## 🚀 Como Usar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
```

### Adicionar Novos Componentes
1. Criar arquivo `.jsx` em `resources/js/components/`
2. Exportar no `index.js`
3. Importar no componente pai
4. Adicionar lógica de renderização se necessário

## 📱 Responsividade

- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: Utiliza classes Tailwind para diferentes tamanhos
- **Menu Mobile**: Header com botão de menu hambúrguer
- **Grid Responsivo**: Cards se adaptam ao tamanho da tela

## 🎯 Funcionalidades Implementadas

### ✅ Completas
- [x] Header com navegação
- [x] Hero section com placeholder
- [x] Cards de campanhas com dados mockados
- [x] Seção de novas aventuras com abas
- [x] Footer com links
- [x] Layout responsivo
- [x] Paleta de cores roxa
- [x] Integração com Laravel

### 🔄 Próximas Implementações
- [ ] Funcionalidade de busca
- [ ] Filtros de campanhas
- [ ] Sistema de autenticação
- [ ] Perfil do usuário
- [ ] Criação de campanhas
- [ ] Chat em tempo real
- [ ] Sistema de notificações

## 📝 Notas Técnicas

- **React 19+**: Utiliza `createRoot` para renderização moderna
- **Tailwind CSS 4.0**: Framework de estilização utilitário
- **Vite**: Bundler para desenvolvimento e build
- **Componentização**: Arquitetura modular e reutilizável
- **Props**: Comunicação entre componentes via props
- **Estado Local**: `useState` para controle de abas
- **Ícones**: SVG inline para melhor performance










