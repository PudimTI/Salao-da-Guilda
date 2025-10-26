@extends('layouts.app')

@section('title', 'Encontrar Campanhas - Salão da Guilda')

@section('content')
<!-- React App Container -->
<div id="find-campaigns-app"></div>

<!-- Fallback para usuários sem JavaScript -->
<noscript>
    <div class="container mx-auto px-4 py-8">
        <div class="text-center py-12">
            <h1 class="text-2xl font-bold text-gray-900 mb-4">JavaScript Necessário</h1>
            <p class="text-gray-600 mb-6">Esta página requer JavaScript para funcionar corretamente.</p>
            <a href="{{ route('campaigns.create') }}" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Nova Campanha
            </a>
        </div>
    </div>
</noscript>

@push('scripts')
<script>
    // Inicializar React quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        if (window.initReactComponents) {
            window.initReactComponents();
        }
    });
</script>
@endpush
@endsection
