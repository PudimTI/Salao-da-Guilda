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
    
    <!-- Favicons -->
    <link rel="icon" type="image/x-icon" href="{{ asset('src/favicon_io/favicon.ico') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('src/favicon_io/favicon-16x16.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('src/favicon_io/favicon-32x32.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('src/favicon_io/apple-touch-icon.png') }}">
    <link rel="manifest" href="{{ asset('src/favicon_io/site.webmanifest') }}">
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
