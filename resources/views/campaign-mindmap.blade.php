<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Mapa Mental - {{ $campaign->name }} - Salão da Guilda</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    
    <!-- Vite CSS -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <style>
        /* Estilos específicos para o mapa mental */
        .mindmap-container {
            width: 100%;
            height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            position: relative;
            overflow: hidden;
        }
        
        .mindmap-node {
            position: absolute;
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px 16px;
            min-width: 120px;
            max-width: 200px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            cursor: move;
            transition: all 0.2s ease;
            user-select: none;
        }
        
        .mindmap-node:hover {
            border-color: #3b82f6;
            box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }
        
        .mindmap-node.selected {
            border-color: #3b82f6;
            background: #eff6ff;
        }
        
        .mindmap-node-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
            font-size: 14px;
        }
        
        .mindmap-node-notes {
            color: #6b7280;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .mindmap-edge {
            position: absolute;
            pointer-events: none;
            z-index: 1;
        }
        
        .mindmap-edge-line {
            stroke: #94a3b8;
            stroke-width: 2;
            fill: none;
        }
        
        .mindmap-edge-label {
            position: absolute;
            background: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            color: #6b7280;
            border: 1px solid #e2e8f0;
        }
        
        .mindmap-toolbar {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        
        .mindmap-toolbar button {
            margin: 0 4px;
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            background: white;
            color: #374151;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .mindmap-toolbar button:hover {
            background: #f3f4f6;
            border-color: #d1d5db;
        }
        
        .mindmap-toolbar button.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
        
        .mindmap-sidebar {
            position: fixed;
            right: 20px;
            top: 20px;
            width: 300px;
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            max-height: calc(100vh - 40px);
            overflow-y: auto;
        }
        
        .mindmap-sidebar h3 {
            margin: 0 0 16px 0;
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
        }
        
        .mindmap-file-item {
            display: flex;
            align-items: center;
            padding: 8px;
            border-radius: 6px;
            margin-bottom: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .mindmap-file-item:hover {
            background: #f3f4f6;
        }
        
        .mindmap-file-item.selected {
            background: #eff6ff;
            border: 1px solid #3b82f6;
        }
    </style>
</head>
<body>
    <!-- React App Container -->
    <div id="mindmap-app" data-campaign-id="{{ $campaign->id }}"></div>

    <!-- Fallback para usuários sem JavaScript -->
    <noscript>
        <div class="min-h-screen bg-gray-50 py-8">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center py-12">
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">JavaScript Necessário</h1>
                    <p class="text-gray-600 mb-6">Esta página requer JavaScript para funcionar corretamente.</p>
                    <a href="{{ route('campaigns.show', $campaign) }}" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                        Voltar para Campanha
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
