@extends('layouts.app')

@section('title', 'Amigos - ' . config('app.name'))

@section('content')
<div id="friends-app"></div>
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
