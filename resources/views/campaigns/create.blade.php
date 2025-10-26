@extends('layouts.react')

@section('title', 'Nova Campanha - Salão da Guilda')

@section('content')
<!-- React App Container -->
<div id="campaign-create-app" data-tags="{{ json_encode($tags) }}"></div>
@endsection
