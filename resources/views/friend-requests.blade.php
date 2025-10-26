@extends('layouts.app')

@section('title', 'Solicitações de Amizade - ' . config('app.name'))

@section('content')
<div id="requests-app"></div>
@endsection

@section('scripts')
<script>
    // Inicializar sistema de friendship
    document.addEventListener('DOMContentLoaded', function() {
        if (window.initFriendshipComponents) {
            window.initFriendshipComponents();
        }
    });
</script>
@endsection