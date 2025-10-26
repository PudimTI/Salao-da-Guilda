@extends('layouts.app')

@section('title', 'Campanha - Salão da Guilda')

@section('content')
<!-- React App Container -->
<div id="campaign-app"></div>

<!-- Fallback para usuários sem JavaScript -->
<noscript>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center py-12">
                <h1 class="text-2xl font-bold text-gray-900 mb-4">JavaScript Necessário</h1>
                <p class="text-gray-600 mb-6">Esta página requer JavaScript para funcionar corretamente.</p>
                <a href="{{ route('campaigns.index') }}" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                    Voltar para Campanhas
                </a>
            </div>
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
