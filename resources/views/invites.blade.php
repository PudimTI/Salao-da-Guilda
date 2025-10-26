<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meus Convites - Salão da Guilda</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
</head>
<body class="font-sans antialiased">
    <div id="invites-app"></div>

    <!-- Scripts -->
    @vite(['resources/js/app.js'])
    
    <script>
        // Inicializar aplicação React
        document.addEventListener('DOMContentLoaded', function() {
            if (window.initReactComponents) {
                window.initReactComponents();
            }
        });
    </script>
</body>
</html>
