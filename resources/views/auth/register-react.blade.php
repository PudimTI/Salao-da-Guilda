<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro - Salão da Guilda</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- Favicons -->
    <link rel="icon" type="image/x-icon" href="{{ asset('src/favicon_io/favicon.ico') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('src/favicon_io/favicon-16x16.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('src/favicon_io/favicon-32x32.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('src/favicon_io/apple-touch-icon.png') }}">
    <link rel="manifest" href="{{ asset('src/favicon_io/site.webmanifest') }}">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <!-- Vite CSS -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center py-8">
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
                <i class="fas fa-dice-d20 text-white text-2xl"></i>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Salão da Guilda</h1>
            <p class="text-white/70">Crie sua conta</p>
        </div>

        @if ($errors->any())
            <div class="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-triangle text-red-400"></i>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-200">Erro no cadastro</h3>
                        <div class="mt-2 text-sm text-red-100">
                            <ul class="list-disc list-inside space-y-1">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        @endif

        <form id="register-form" method="POST" action="{{ route('register') }}" class="space-y-6">
            @csrf
            
            
            <div>
                <label for="handle" class="block text-sm font-medium text-white/90 mb-2">
                    Nome de usuário (Handle)
                </label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-at text-white/50"></i>
                    </div>
                    <input 
                        type="text" 
                        id="handle" 
                        name="handle" 
                        value="{{ old('handle') }}"
                        required
                        class="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="@seu_handle"
                    >
                </div>
            </div>

            <div>
                <label for="display_name" class="block text-sm font-medium text-white/90 mb-2">
                    Nome de exibição
                </label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-user text-white/50"></i>
                    </div>
                    <input 
                        type="text" 
                        id="display_name" 
                        name="display_name" 
                        value="{{ old('display_name') }}"
                        required
                        class="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Como você quer ser chamado"
                    >
                </div>
            </div>

            <div>
                <label for="email" class="block text-sm font-medium text-white/90 mb-2">
                    Email
                </label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-envelope text-white/50"></i>
                    </div>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value="{{ old('email') }}"
                        required
                        class="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="seu@email.com"
                    >
                </div>
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-white/90 mb-2">
                    Senha
                </label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-lock text-white/50"></i>
                    </div>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        required
                        class="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Mínimo 8 caracteres"
                    >
                </div>
            </div>

            <div>
                <label for="password_confirmation" class="block text-sm font-medium text-white/90 mb-2">
                    Confirmar senha
                </label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-lock text-white/50"></i>
                    </div>
                    <input 
                        type="password" 
                        id="password_confirmation" 
                        name="password_confirmation" 
                        required
                        class="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Digite a senha novamente"
                    >
                </div>
            </div>

            <div class="flex items-center">
                <input 
                    id="terms" 
                    name="terms" 
                    type="checkbox" 
                    required
                    class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/20 rounded bg-white/10"
                >
                <label for="terms" class="ml-2 block text-sm text-white/90">
                    Aceito os <a href="#" class="text-purple-300 hover:text-purple-200 font-medium">termos de uso</a> e <a href="#" class="text-purple-300 hover:text-purple-200 font-medium">política de privacidade</a>
                </label>
            </div>

            <div>
                <button 
                    type="submit" 
                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                    <i class="fas fa-user-plus mr-2"></i>
                    Criar conta
                </button>
            </div>
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

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const registerForm = document.getElementById('register-form');

            if (!registerForm) {
                console.warn('📝 [Register] Formulário de registro não encontrado');
                return;
            }

            registerForm.addEventListener('submit', async function (event) {
                event.preventDefault();

                const submitButton = registerForm.querySelector('button[type="submit"]');
                const submitOriginalText = submitButton ? submitButton.innerHTML : '';

                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<span class="animate-pulse">Criando conta...</span>';
                }

                const formData = {
                    handle: registerForm.handle.value,
                    display_name: registerForm.display_name.value,
                    email: registerForm.email.value,
                    password: registerForm.password.value,
                    password_confirmation: registerForm.password_confirmation.value,
                    terms: registerForm.terms.checked ? 'on' : ''
                };

                const csrfToken = registerForm.querySelector('input[name="_token"]')?.value;

                console.log('📝 [Register] Enviando formulário de registro...', {
                    handle: formData.handle,
                    email: formData.email
                });

                try {
                    const response = await fetch(registerForm.action, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken || ''
                        },
                        body: JSON.stringify(formData)
                    });

                    const data = await response.json().catch(() => null);

                    console.log('📥 [Register] Resposta recebida:', data);

                    if (response.ok && data?.success && data?.token) {
                        console.log('✅ [Register] Registro realizado com sucesso. Salvando token...');
                        localStorage.setItem('auth_token', data.token);

                        if (data.user) {
                            localStorage.setItem('user', JSON.stringify(data.user));
                        }

                        await new Promise(resolve => setTimeout(resolve, 100));

                        const savedToken = localStorage.getItem('auth_token');
                        if (savedToken) {
                            console.log('✅ [Register] Token confirmado no localStorage.');

                            const showOnboarding = window.showUserOnboardingModal;
                            if (typeof showOnboarding === 'function') {
                                showOnboarding({
                                    user: data.user,
                                    preferences: data.user?.preferences ?? undefined,
                                    blacklist: data.user?.filters?.blacklist_tags ?? undefined,
                                    onComplete: () => {
                                        window.location.href = '/';
                                    }
                                });
                                return;
                            }

                            console.warn('⚠️ [Register] Modal de onboarding indisponível. Redirecionando...');
                            window.location.href = '/';
                            return;
                        }

                        console.error('❌ [Register] Token não foi persistido no localStorage.');
                        alert('Erro ao salvar credenciais localmente. Tente novamente.');
                    } else {
                        console.error('❌ [Register] Falha no registro:', data);

                        const errorMessage = data?.message
                            || (data?.errors ? Object.values(data.errors).flat().join('\n') : null)
                            || 'Erro ao criar conta. Verifique os dados e tente novamente.';

                        alert(errorMessage);
                    }
                } catch (error) {
                    console.error('❌ [Register] Erro inesperado:', error);
                    alert('Erro inesperado ao criar conta. Tente novamente em instantes.');
                } finally {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = submitOriginalText;
                    }
                }
            });
        });
    </script>
</body>
</html>
