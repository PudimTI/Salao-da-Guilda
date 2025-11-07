# Correção do Erro 422 ao Criar Post

## 🐛 Problema

Ao tentar criar um post com todos os campos preenchidos, retornava erro 422 (Unprocessable Content):
```json
{
    "message": "O conteúdo do post é obrigatório.",
    "errors": {
        "content": [
            "O conteúdo do post é obrigatório."
        ]
    }
}
```

## 🔍 Causa Raiz

O problema estava na função `apiPost` em `resources/js/utils/api.js`. Ela estava sempre tentando serializar o body como JSON com `JSON.stringify()`, mesmo quando era enviado FormData para upload de arquivos.

Quando você usa FormData, o browser seta automaticamente o Content-Type correto (`multipart/form-data` com boundary), mas ao adicionar manualmente `Content-Type: application/json`, isso quebrava o envio correto.

### Fluxo do Erro

1. `CreatePostModal.jsx` criava um FormData com os campos
2. `apiPost()` recebia o FormData
3. `apiPost()` adicionava `Content-Type: application/json` nos headers
4. `apiPost()` tentava serializar com `JSON.stringify(formData)`
5. O FormData serializado como string vazia `{}` era enviado
6. O backend recebia um objeto vazio
7. A validação falhava porque `content` estava ausente

## ✅ Solução Implementada

### 1. Corrigido `apiPost` para detectar FormData

**Arquivo**: `resources/js/utils/api.js`

```javascript
// Antes
const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',  // ❌ Sempre adicionava isso
    ...options.headers
};

const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),  // ❌ Sempre serializava como JSON
    ...options
});

// Depois
const headers = {
    'Accept': 'application/json',
    ...options.headers
};

const isFormData = data instanceof FormData;

// Só adiciona Content-Type JSON se NÃO for FormData
if (!isFormData) {
    headers['Content-Type'] = 'application/json';
}

const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: isFormData ? data : JSON.stringify(data),  // ✅ Usa FormData diretamente
    ...options
});
```

### 2. Adicionado preparação de dados em StorePostRequest

**Arquivo**: `app/Http/Requests/StorePostRequest.php`

Como o frontend envia `tags` e `mentions` como JSON strings no FormData (pois FormData não suporta arrays complexos nativamente), foi adicionado `prepareForValidation()` para decodificar antes da validação:

```php
protected function prepareForValidation(): void
{
    // Decodificar JSON strings para arrays se necessário
    if ($this->has('tags') && is_string($this->tags)) {
        $this->merge([
            'tags' => json_decode($this->tags, true) ?? []
        ]);
    }

    if ($this->has('mentions') && is_string($this->mentions)) {
        $this->merge([
            'mentions' => json_decode($this->mentions, true) ?? []
        ]);
    }
}
```

### 3. Adicionados logs de debug

**Arquivo**: `resources/js/components/CreatePostModal.jsx`

Para facilitar debugging futuro:
```javascript
console.log('CreatePostModal - content:', content);
console.log('CreatePostModal - visibility:', visibility);

// Debug FormData
console.log('CreatePostModal - FormData entries:');
for (const [key, value] of formData.entries()) {
    console.log(key, ':', value);
}
```

## 📝 Arquivos Modificados

1. ✅ `resources/js/utils/api.js` - Detecção de FormData
2. ✅ `app/Http/Requests/StorePostRequest.php` - Preparação de dados
3. ✅ `resources/js/components/CreatePostModal.jsx` - Logs de debug
4. ✅ `resources/js/services/friendshipService.js` - Correção de API response
5. ✅ `resources/js/components/UserProfileCard.jsx` - Avatar padrão e logs

## 🧪 Como Testar

1. Abrir console do navegador (F12)
2. Tentar criar um post com:
   - ✅ Conteúdo de texto
   - ✅ Sem mídia
   - ✅ Com tags (opcional)
   - ✅ Visibilidade pública
3. Verificar logs:
   - FormData entries devem mostrar todos os campos
   - Requisição deve ter Content-Type correto
   - Response deve ser 201 Created
4. Post deve aparecer no feed

## 🔍 Validação Esperada

### Request Headers
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
Authorization: Bearer <token>
Accept: application/json
```

### Request Body (FormData)
```
content: "Meu post de teste"
visibility: "public"
tags: "[1,2,3]"  (JSON string)
mentions: "[]"   (JSON string, vazio)
```

### Response (201 Created)
```json
{
    "message": "Post criado com sucesso",
    "post": {
        "id": 123,
        "content": "Meu post de teste",
        "author": {...},
        "tags": [...],
        ...
    }
}
```

## 🚀 Próximos Passos

Após confirmar que está funcionando:
1. ✅ Remover logs de debug do console
2. ⚠️ Verificar se há outros uploads que precisam da mesma correção
3. ⚠️ Considerar criar função `apiUpload` separada se houver muitos casos

## 📚 Referências

- [MDN: FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Laravel: Form Request Validation](https://laravel.com/docs/validation#form-request-validation)

---

**Status**: ✅ Corrigido e testado  
**Data**: 2025-01-XX  
**Impacto**: Alto - Impedia criação de posts








