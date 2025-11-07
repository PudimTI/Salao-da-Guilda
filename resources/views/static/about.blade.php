@extends('layouts.app')

@section('title', 'Sobre - ' . config('app.name'))

@section('content')
<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Sobre o Salão da Guilda</h1>
            
            <div class="prose prose-lg max-w-none">
                <p class="text-gray-600 mb-4">
                    O Salão da Guilda é uma plataforma completa para jogadores de RPG de mesa se conectarem, 
                    criarem personagens, organizarem campanhas e compartilharem suas aventuras.
                </p>
                
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">Nossa Missão</h2>
                <p class="text-gray-600 mb-4">
                    Facilitar a organização de campanhas de RPG, permitindo que mestres e jogadores 
                    encontrem uns aos outros e construam histórias épicas juntos.
                </p>
                
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">Funcionalidades</h2>
                <ul class="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>Criação e gerenciamento de personagens</li>
                    <li>Sistema completo de campanhas</li>
                    <li>Feed social para compartilhar aventuras</li>
                    <li>Sistema de amizades e convites</li>
                    <li>Chat integrado para campanhas</li>
                </ul>
            </div>
        </div>
    </div>
</div>
@endsection







