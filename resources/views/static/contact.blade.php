@extends('layouts.app')

@section('title', 'Contato - ' . config('app.name'))

@section('content')
<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Entre em Contato</h1>
            
            <div class="prose prose-lg max-w-none">
                <p class="text-gray-600 mb-6">
                    Tem dúvidas, sugestões ou precisa de ajuda? Entre em contato conosco através dos canais abaixo.
                </p>
                
                <div class="grid md:grid-cols-2 gap-6 mt-8">
                    <div>
                        <h2 class="text-xl font-semibold text-gray-800 mb-4">Email</h2>
                        <p class="text-gray-600">
                            <a href="mailto:contato@salaodaguilda.com" class="text-purple-600 hover:text-purple-700">
                                contato@salaodaguilda.com
                            </a>
                        </p>
                    </div>
                    
                    <div>
                        <h2 class="text-xl font-semibold text-gray-800 mb-4">Suporte</h2>
                        <p class="text-gray-600">
                            Para questões técnicas, use o sistema de suporte dentro da plataforma.
                        </p>
                    </div>
                </div>
                
                <div class="mt-8 p-4 bg-purple-50 rounded-lg">
                    <p class="text-gray-700">
                        <strong>Nota:</strong> Estamos sempre melhorando a plataforma baseado no feedback dos usuários. 
                        Sua opinião é muito importante para nós!
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection





