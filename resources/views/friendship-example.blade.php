@extends('layouts.app')

@section('title', 'Exemplo de Integração - ' . config('app.name'))

@section('content')
<div id="friendship-example-app"></div>
@endsection

@section('scripts')
<script>
    // Inicializar sistema de friendship
    document.addEventListener('DOMContentLoaded', function() {
        if (window.initFriendshipSystem) {
            window.initFriendshipSystem();
        }
    });
</script>
@endsection