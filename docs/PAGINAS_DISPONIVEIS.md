# Páginas Disponíveis - Salão da Guilda

## 🚀 Como testar

### Pré-requisitos
1. **Laravel rodando**: `php artisan serve` (porta 8000)
2. **Build feito**: `npm run build` (já executado)

### Páginas disponíveis

#### 1. **Home** - Página principal
- **URL**: `http://localhost:8000/`
- **Componentes**: Header, Hero, CampaignCard, NewAdventures, Footer
- **Dados**: mockCampaigns

#### 2. **Feed** - Página de feed
- **URL**: `http://localhost:8000/feed`
- **Componentes**: Header, Recommendations, FeedPost, Footer
- **Dados**: mockFeedPosts

#### 3. **Campanhas** - Listagem de campanhas
- **URL**: `http://localhost:8000/campanhas`
- **Componentes**: Header, CampaignFilters, CampaignListItem, Footer
- **Dados**: mockCampaignsList

#### 4. **Perfil** - Página de perfil do usuário
- **URL**: `http://localhost:8000/perfil`
- **Componentes**: Header, UserHeaderCard, CharacterCard, UserPosts, Footer
- **Dados**: mockUser, mockCharacters, mockUserPosts

#### 5. **Teste** - Página de teste
- **URL**: `http://localhost:8000/test`
- **Componentes**: Teste JavaScript + Teste React
- **Debug**: Console logs para verificar funcionamento

## 🔧 Navegação

O **Header** de todas as páginas contém links para:
- **Logo** → Home (`/`)
- **Home** → Home (`/`)
- **Feed** → Feed (`/feed`)
- **Campanhas** → Campanhas (`/campanhas`)
- **Perfil** → Perfil (`/perfil`)

## 📝 Dados Mockados

### Campanhas (Home)
- A Jornada dos Cinco Anéis
- Dungeons & Dragons: A Coroa Perdida
- Call of Cthulhu: O Culto das Profundezas

### Feed Posts
- Posts de usuários com imagens placeholder

### Campanhas (Listagem)
- Mesa teste de D&D
- Mesa teste de OP
- Mesa teste de T20
- Mesa teste de CoC

### Perfil do Usuário
- Apelido de usuário
- 2 personagens
- Posts do usuário

## 🎨 Estilização

- **Tailwind CSS** configurado
- **Responsivo** para mobile e desktop
- **Paleta de cores** roxa/rosa
- **Componentes** reutilizáveis

## 🐛 Debug

Se alguma página estiver em branco:
1. Abra o console do navegador (F12)
2. Verifique se há erros JavaScript
3. Pressione Ctrl+F5 para recarregar o cache
4. Teste a página `/test` primeiro

## ✅ Status

- ✅ **Build de produção** funcionando
- ✅ **Laravel** rodando na porta 8000
- ✅ **Todas as rotas** configuradas
- ✅ **Componentes React** criados
- ✅ **Dados mockados** configurados
- ✅ **Navegação** entre páginas funcionando
