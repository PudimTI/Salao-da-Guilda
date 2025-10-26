# Componentização React no Laravel

Este projeto está configurado para usar React com Laravel através do Vite. Aqui está um guia completo de como usar a componentização React.

## 📋 Configuração Atual

### Dependências Instaladas
- `react` - Biblioteca principal do React
- `react-dom` - DOM renderer do React
- `@vitejs/plugin-react` - Plugin do Vite para React

### Arquivos de Configuração
- `vite.config.js` - Configurado com o plugin React
- `resources/js/app.js` - Ponto de entrada principal
- `resources/js/components/` - Diretório dos componentes

## 🚀 Como Usar

### 1. Estrutura de Componentes

Os componentes estão organizados em `resources/js/components/`:

```
resources/js/components/
├── Welcome.jsx          # Componente de boas-vindas
├── Counter.jsx          # Contador interativo
├── Card.jsx             # Componente de card reutilizável
└── index.js             # Exportações centralizadas
```

### 2. Criando Novos Componentes

Para criar um novo componente React:

1. **Crie o arquivo do componente** em `resources/js/components/`:

```jsx
// resources/js/components/MeuComponente.jsx
import React from 'react';

const MeuComponente = ({ titulo, conteudo }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">{titulo}</h2>
            <p>{conteudo}</p>
        </div>
    );
};

export default MeuComponente;
```

2. **Exporte no index.js**:

```javascript
// resources/js/components/index.js
export { default as MeuComponente } from './MeuComponente';
```

3. **Importe e use no app.js**:

```javascript
// resources/js/app.js
import { MeuComponente } from './components';

// Adicione na função initReactComponents:
const meuComponenteElement = document.getElementById('meu-componente');
if (meuComponenteElement) {
    const root = createRoot(meuComponenteElement);
    root.render(<MeuComponente titulo="Título" conteudo="Conteúdo" />);
}
```

4. **Adicione o elemento no Blade**:

```blade
<!-- Em qualquer view .blade.php -->
<div id="meu-componente"></div>
```

### 3. Componentes Disponíveis

#### Welcome
Componente de boas-vindas com nome personalizável.

```jsx
<Welcome name="Nome do Usuário" />
```

#### Counter
Contador interativo com botões de incrementar, decrementar e reset.

```jsx
<Counter />
```

#### Card
Componente de card reutilizável com título opcional.

```jsx
<Card title="Título do Card">
    <p>Conteúdo do card</p>
</Card>
```

### 4. Compilação e Desenvolvimento

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm run build
```

### 5. Exemplo Completo de Uso

#### No Blade Template:
```blade
<!DOCTYPE html>
<html>
<head>
    <title>Meu App</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <div id="welcome-component"></div>
    <div id="counter-component"></div>
    <div id="card-component"></div>
</body>
</html>
```

#### O JavaScript automaticamente renderizará os componentes nos elementos correspondentes.

## 🎨 Estilização

Os componentes usam Tailwind CSS que já está configurado no projeto. Você pode:

- Usar classes do Tailwind diretamente nos componentes
- Criar estilos customizados
- Usar CSS modules se necessário

## 📝 Boas Práticas

1. **Nomenclatura**: Use PascalCase para nomes de componentes
2. **Estrutura**: Mantenha componentes pequenos e focados
3. **Props**: Use props para tornar componentes reutilizáveis
4. **Estado**: Use `useState` para estado local dos componentes
5. **Exportações**: Centralize as exportações no `index.js`

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Modo desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Verificar erros de linting
npm run lint
```

## 📚 Recursos Adicionais

- [Documentação do React](https://reactjs.org/docs/)
- [Documentação do Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Laravel Vite Plugin](https://laravel.com/docs/vite)

---

**Nota**: Este setup permite usar React de forma híbrida com Laravel, renderizando componentes React em elementos específicos das views Blade, mantendo a flexibilidade de usar tanto Blade quanto React conforme necessário.
