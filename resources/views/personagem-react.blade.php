<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Personagem - Salão da Guilda</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    
    <!-- Vite CSS -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <!-- React App Container -->
    <div id="character-app"></div>

    <!-- Fallback para usuários sem JavaScript -->
    <noscript>
        <div class="min-h-screen bg-gray-50 py-8">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center py-12">
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">JavaScript Necessário</h1>
                    <p class="text-gray-600 mb-6">Esta página requer JavaScript para funcionar corretamente.</p>
                    <a href="{{ route('characters.index') }}" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                        Voltar para Personagens
                    </a>
                </div>
            </div>
        </div>
    </noscript>

    <script>
        // Inicializar React quando o DOM estiver pronto
        document.addEventListener('DOMContentLoaded', function() {
            if (window.initReactComponents) {
                window.initReactComponents();
            }
        });
    </script>
</body>
</html>
