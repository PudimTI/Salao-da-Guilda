@extends('layouts.app')

@section('title', 'Cadastro - Salão da Guilda')

@section('content')
<div class="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center py-8">
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
                <i class="fas fa-dice-d20 text-white text-2xl"></i>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Salão da Guilda</h1>
            <p class="text-white/70">Crie sua conta</p>
        </div>

        @if ($errors->any())
            <div class="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-red-400 mr-3"></i>
                    <div>
                        @foreach ($errors->all() as $error)
                            <p class="text-red-200 text-sm">{{ $error }}</p>
                        @endforeach
                    </div>
                </div>
            </div>
        @endif

        <form method="POST" action="{{ route('register') }}" class="space-y-6">
            @csrf
            
            <div>
                <label for="handle" class="block text-sm font-medium text-white/90 mb-2">
                    <i class="fas fa-user mr-2"></i>Nome de usuário
                </label>
                <input type="text" 
                       id="handle" 
                       name="handle" 
                       value="{{ old('handle') }}"
                       class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                       placeholder="@seunome"
                       required>
                <p class="text-xs text-white/60 mt-1">Usado para identificação única</p>
            </div>

            <div>
                <label for="email" class="block text-sm font-medium text-white/90 mb-2">
                    <i class="fas fa-envelope mr-2"></i>Email
                </label>
                <input type="email" 
                       id="email" 
                       name="email" 
                       value="{{ old('email') }}"
                       class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                       placeholder="seu@email.com"
                       required>
            </div>

            <div>
                <label for="display_name" class="block text-sm font-medium text-white/90 mb-2">
                    <i class="fas fa-id-card mr-2"></i>Nome de exibição
                </label>
                <input type="text" 
                       id="display_name" 
                       name="display_name" 
                       value="{{ old('display_name') }}"
                       class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                       placeholder="Seu Nome"
                       required>
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-white/90 mb-2">
                    <i class="fas fa-lock mr-2"></i>Senha
                </label>
                <input type="password" 
                       id="password" 
                       name="password"
                       class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                       placeholder="••••••••"
                       required>
            </div>

            <div>
                <label for="password_confirmation" class="block text-sm font-medium text-white/90 mb-2">
                    <i class="fas fa-lock mr-2"></i>Confirmar senha
                </label>
                <input type="password" 
                       id="password_confirmation" 
                       name="password_confirmation"
                       class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                       placeholder="••••••••"
                       required>
            </div>


            <div class="flex items-center">
                <input type="checkbox" 
                       id="terms" 
                       name="terms" 
                       class="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                       required>
                <label for="terms" class="ml-2 text-sm text-white/70">
                    Aceito os <a href="#" class="text-purple-300 hover:text-purple-200">termos de uso</a> e <a href="#" class="text-purple-300 hover:text-purple-200">política de privacidade</a>
                </label>
            </div>

            <button type="submit" 
                    class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent">
                <i class="fas fa-user-plus mr-2"></i>Criar conta
            </button>
        </form>

        <div class="mt-8 text-center">
            <p class="text-white/70">
                Já tem uma conta? 
                <a href="{{ route('login') }}" class="text-purple-300 hover:text-purple-200 font-semibold transition-colors">
                    Faça login
                </a>
            </p>
        </div>
    </div>
</div>
@endsection
