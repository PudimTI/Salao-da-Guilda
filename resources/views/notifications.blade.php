@extends('layouts.app')

@section('title', 'Notificações - ' . config('app.name'))

@section('content')
<div id="notifications-app"></div>
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