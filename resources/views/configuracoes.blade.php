@extends('layouts.app')

@section('title', 'Configurações - ' . config('app.name'))

@section('content')
<div id="configuracoes-app"></div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        if (window.initConfiguracoesComponents) {
            window.initConfiguracoesComponents();
        }
    });
</script>
@endsection


