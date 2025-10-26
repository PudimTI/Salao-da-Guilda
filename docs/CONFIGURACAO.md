# 🚀 Configuração do Projeto - Salão da Guilda

## ⚡ Configuração Rápida (Windows)

### Opção 1: Script Automático
```bash
# Execute o arquivo de configuração
setup.bat
```

### Opção 2: Configuração Manual

#### 1. Configurar Variáveis de Ambiente
```bash
# Copie o arquivo de exemplo
copy .env.example .env

# Gere a chave da aplicação
php artisan key:generate
```

#### 2. Configurar Banco de Dados
```bash
# Execute as migrações
php artisan migrate
```

#### 3. Instalar Dependências
```bash
# Instalar dependências do PHP (já instaladas)
composer install

# Instalar dependências do Node.js
npm install
```

#### 4. Compilar Assets
```bash
# Compilar para produção
npm run build

# OU executar em modo desenvolvimento
npm run dev
```

## 🎯 Executar a Aplicação

### Terminal 1: Servidor Laravel
```bash
php artisan serve
```

### Terminal 2: Vite (Desenvolvimento)
```bash
npm run dev
```

### Acessar a Aplicação
- **URL Principal**: http://localhost:8000
- **URL Welcome (Laravel)**: http://localhost:8000/welcome

## 🔧 Solução de Problemas

### Erro de Banco de Dados PostgreSQL
Se aparecer erro sobre PostgreSQL não configurado:

1. **Verifique o arquivo .env**:
   ```
   DB_CONNECTION=sqlite
   SESSION_DRIVER=file
   ```

2. **Limpe o cache**:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

### React não carrega
1. **Verifique se o Vite está rodando**:
   ```bash
   npm run dev
   ```

2. **Verifique o console do navegador** (F12) para erros

3. **Recompile os assets**:
   ```bash
   npm run build
   ```

### Porta 8000 ocupada
```bash
php artisan serve --port=8001
```

## 📁 Estrutura da Aplicação

```
resources/
├── js/
│   ├── components/          # Componentes React
│   │   ├── Header.jsx      # Cabeçalho
│   │   ├── Hero.jsx        # Seção principal
│   │   ├── CampaignCard.jsx # Cards de campanhas
│   │   ├── NewAdventures.jsx # Novas aventuras
│   │   ├── Footer.jsx      # Rodapé
│   │   └── Home.jsx        # Componente principal
│   ├── data/
│   │   └── mockData.js     # Dados mockados
│   └── app.js              # Ponto de entrada
├── views/
│   ├── home.blade.php      # View principal (React)
│   └── welcome.blade.php   # View padrão Laravel
└── css/
    └── app.css             # Estilos Tailwind
```

## 🎨 Funcionalidades Implementadas

- ✅ **Header** com navegação responsiva
- ✅ **Hero Section** com título e placeholder
- ✅ **Cards de Campanhas** com dados mockados
- ✅ **Seção de Novas Aventuras** com abas
- ✅ **Footer** com links
- ✅ **Design Responsivo** mobile-first
- ✅ **Paleta de Cores** roxa e clara
- ✅ **Integração Laravel + React**

## 🚀 Próximos Passos

1. **Autenticação**: Sistema de login/registro
2. **API**: Endpoints para campanhas e usuários
3. **Chat**: Sistema de mensagens em tempo real
4. **Upload**: Sistema de imagens para campanhas
5. **Notificações**: Sistema de notificações push

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs em `storage/logs/laravel.log`
2. Verifique o console do navegador (F12)
3. Execute `php artisan config:clear` para limpar cache
4. Execute `npm run build` para recompilar assets










