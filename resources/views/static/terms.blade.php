@extends('layouts.app')

@section('title', 'Termos de Uso - ' . config('app.name'))

@section('content')
<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Termos de Uso</h1>
            
            <div class="prose prose-lg max-w-none">
                <p class="text-gray-600 mb-6">
                    Última atualização: {{ date('d/m/Y') }}
                </p>
                
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Aceitação dos Termos</h2>
                <p class="text-gray-600 mb-4">
                    Ao acessar e usar o Salão da Guilda, você concorda em cumprir e estar vinculado a estes Termos de Uso.
                </p>
                
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. Uso da Plataforma</h2>
                <p class="text-gray-600 mb-4">
                    A plataforma é destinada a fins recreativos e educacionais relacionados a RPG de mesa. 
                    É proibido usar a plataforma para:
                </p>
                <ul class="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>Atividades ilegais</li>
                    <li>Spam ou conteúdo ofensivo</li>
                    <li>Violar direitos de propriedade intelectual</li>
                    <li>Hackear ou tentar comprometer a segurança</li>
                </ul>
                
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. Conta de Usuário</h2>
                <p class="text-gray-600 mb-4">
                    Você é responsável por manter a confidencialidade de sua conta e senha. 
                    Todas as atividades que ocorrem sob sua conta são de sua responsabilidade.
                </p>
                
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Conteúdo do Usuário</h2>
                <p class="text-gray-600 mb-4">
                    Você mantém os direitos sobre o conteúdo que cria na plataforma. 
                    Ao publicar conteúdo, você concede à plataforma uma licença para exibir e distribuir esse conteúdo.
                </p>
                
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Modificações</h2>
                <p class="text-gray-600 mb-4">
                    Reservamos o direito de modificar estes termos a qualquer momento. 
                    As alterações entrarão em vigor após a publicação na plataforma.
                </p>
            </div>
        </div>
    </div>
</div>
@endsection





