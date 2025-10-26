@extends('layouts.app')

@section('title', 'Redefinir senha - Salão da Guilda')

@section('content')
<div class="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center">
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
                <i class="fas fa-lock text-white text-2xl"></i>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Redefinir senha</h1>
            <p class="text-white/70">Digite sua nova senha</p>
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

        <form method="POST" action="{{ route('password.update') }}" class="space-y-6">
            @csrf
            <input type="hidden" name="token" value="{{ $token }}">
            
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
                    <i class="fas fa-lock mr-2"></i>Nova senha
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
                    <i class="fas fa-lock mr-2"></i>Confirmar nova senha
                </label>
                <input type="password" 
                       id="password_confirmation" 
                       name="password_confirmation"
                       class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                       placeholder="••••••••"
                       required>
            </div>

            <button type="submit" 
                    class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent">
                <i class="fas fa-save mr-2"></i>Redefinir senha
            </button>
        </form>

        <div class="mt-8 text-center">
            <p class="text-white/70">
                Lembrou da senha? 
                <a href="{{ route('login') }}" class="text-purple-300 hover:text-purple-200 font-semibold transition-colors">
                    Faça login
                </a>
            </p>
        </div>
    </div>
</div>
@endsection
