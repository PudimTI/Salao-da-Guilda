@extends('layouts.app')

@section('title', 'Política de Privacidade - ' . config('app.name'))

@section('content')
<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Política de Privacidade</h1>
            
            <div class="prose prose-lg max-w-none">
                <p class="text-gray-600 mb-6">
                    Última atualização: {{ date('d/m/Y') }}
                </p>
                
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Informações Coletadas</h2>
                <p class="text-gray-600 mb-4">
                    Coletamos informações que você nos fornece diretamente, como:
                </p>
                <ul class="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>Nome de usuário e email</li>
                    <li>Informações do perfil</li>
                    <li>Conteúdo que você cria e publica</li>
                    <li>Dados de uso da plataforma</li>
                </ul>
                
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. Como Usamos Suas Informações</h2>
                <p class="text-gray-600 mb-4">
                    Usamos suas informações para:
                </p>
                <ul class="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>Fornecer e melhorar nossos serviços</li>
                    <li>Personalizar sua experiência</li>
                    <li>Comunicar-nos com você</li>
                    <li>Garantir a segurança da plataforma</li>
                </ul>
                
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. Compartilhamento de Informações</h2>
                <p class="text-gray-600 mb-4">
                    Não vendemos suas informações pessoais. Podemos compartilhar informações apenas:
                </p>
                <ul class="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>Com seu consentimento explícito</li>
                    <li>Para cumprir obrigações legais</li>
                    <li>Para proteger nossos direitos e segurança</li>
                </ul>
                
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Segurança</h2>
                <p class="text-gray-600 mb-4">
                    Implementamos medidas de segurança adequadas para proteger suas informações pessoais 
                    contra acesso não autorizado, alteração, divulgação ou destruição.
                </p>
                
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Seus Direitos</h2>
                <p class="text-gray-600 mb-4">
                    Você tem o direito de:
                </p>
                <ul class="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>Acessar suas informações pessoais</li>
                    <li>Corrigir informações imprecisas</li>
                    <li>Solicitar a exclusão de seus dados</li>
                    <li>Optar por não receber comunicações</li>
                </ul>
                
                <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">6. Contato</h2>
                <p class="text-gray-600 mb-4">
                    Para questões sobre privacidade, entre em contato através da página de <a href="/contato" class="text-purple-600 hover:text-purple-700">Contato</a>.
                </p>
            </div>
        </div>
    </div>
</div>
@endsection





