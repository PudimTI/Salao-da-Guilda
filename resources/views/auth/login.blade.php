@extends('layouts.app')

@section('title', 'Login - Salão da Guilda')

@section('content')
<div class="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center">
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
                <i class="fas fa-dice-d20 text-white text-2xl"></i>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Salão da Guilda</h1>
            <p class="text-white/70">Entre na sua conta</p>
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

        @if (session('status'))
            <div class="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-400 mr-3"></i>
                    <p class="text-green-200 text-sm">{{ session('status') }}</p>
                </div>
            </div>
        @endif

        <form method="POST" action="{{ route('login') }}" class="space-y-6">
            @csrf
            
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

            <div class="flex items-center justify-between">
                <label class="flex items-center">
                    <input type="checkbox" 
                           name="remember" 
                           class="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2">
                    <span class="ml-2 text-sm text-white/70">Lembrar de mim</span>
                </label>
                
                <a href="{{ route('password.request') }}" class="text-sm text-purple-300 hover:text-purple-200 transition-colors">
                    Esqueceu a senha?
                </a>
            </div>

            <button type="submit" 
                    class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent">
                <i class="fas fa-sign-in-alt mr-2"></i>Entrar
            </button>
        </form>

        <div class="mt-8 text-center">
            <p class="text-white/70">
                Não tem uma conta? 
                <a href="{{ route('register') }}" class="text-purple-300 hover:text-purple-200 font-semibold transition-colors">
                    Cadastre-se
                </a>
            </p>
        </div>
    </div>
</div>
@endsection
