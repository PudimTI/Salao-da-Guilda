<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Teste - Salão da Guilda</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
    
    <!-- Styles / Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <div id="debug-app"></div>
    <div id="test-react"></div>
    <div id="home-app"></div>
    
    <script>
        console.log('Teste inline: Página carregada');
        console.log('Elemento debug-app existe:', !!document.getElementById('debug-app'));
        console.log('Elemento home-app existe:', !!document.getElementById('home-app'));
    </script>
</body>
</html>


