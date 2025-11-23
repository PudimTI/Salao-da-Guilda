<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Salão da Guilda</title>
    
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
<body class="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center">
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
                <i class="fas fa-dice-d20 text-white text-2xl"></i>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Salão da Guilda</h1>
            <p class="text-white/70">Entre na sua conta</p>
        </div>

        @if ($errors->any())
            <div class="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-triangle text-red-400"></i>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-200">Erro na autenticação</h3>
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

        <div id="login-error" class="hidden mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas fa-exclamation-triangle text-red-400"></i>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-200">Erro na autenticação</h3>
                    <p id="login-error-message" class="mt-2 text-sm text-red-100"></p>
                </div>
            </div>
        </div>

        <form id="login-form" class="space-y-6">
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
                        autofocus
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
                        placeholder="Sua senha"
                    >
                </div>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <input 
                        id="remember" 
                        name="remember" 
                        type="checkbox" 
                        class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/20 rounded bg-white/10"
                    >
                    <label for="remember" class="ml-2 block text-sm text-white/90">
                        Lembrar de mim
                    </label>
                </div>

                @if (Route::has('password.request'))
                    <div class="text-sm">
                        <a href="{{ route('password.request') }}" class="text-purple-300 hover:text-purple-200 font-medium transition-colors">
                            Esqueceu a senha?
                        </a>
                    </div>
                @endif
            </div>

            <div>
                <button 
                    type="submit" 
                    id="login-submit"
                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <i class="fas fa-sign-in-alt mr-2"></i>
                    <span id="login-submit-text">Entrar</span>
                </button>
            </div>
        </form>

        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const loginForm = document.getElementById('login-form');
                const errorDiv = document.getElementById('login-error');
                const errorMessage = document.getElementById('login-error-message');
                const submitButton = document.getElementById('login-submit');
                const submitText = document.getElementById('login-submit-text');

                loginForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    // Mostrar loading
                    submitButton.disabled = true;
                    submitText.textContent = 'Entrando...';
                    errorDiv.classList.add('hidden');

                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    const remember = document.getElementById('remember').checked;

                    console.log('🔐 [Login] Iniciando login...');
                    console.log('🔐 [Login] Email:', email);

                    try {
                        const response = await fetch('/api/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                            },
                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        });

                        const data = await response.json();
                        console.log('📥 [Login] Resposta:', data);

                        if (response.ok && data.success && data.token) {
                            console.log('✅ [Login] Login bem-sucedido!');
                            console.log('🎫 [Login] Token recebido:', data.token);

                            // Salvar token no localStorage
                            localStorage.setItem('auth_token', data.token);
                            console.log('✅ [Login] Token salvo no localStorage');

                            // Salvar dados do usuário
                            if (data.user) {
                                localStorage.setItem('user', JSON.stringify(data.user));
                                console.log('✅ [Login] Dados do usuário salvos');
                            }

                            // Aguardar um momento antes de redirecionar para garantir persistência
                            await new Promise(resolve => setTimeout(resolve, 100));
                            
                            // Verificar se o token foi salvo corretamente
                            const savedToken = localStorage.getItem('auth_token');
                            if (savedToken) {
                                console.log('✅ [Login] Token confirmado no localStorage');
                                console.log('🚀 [Login] Redirecionando para /...');
                                window.location.href = '/';
                            } else {
                                console.error('❌ [Login] Token não foi salvo corretamente!');
                                errorMessage.textContent = 'Erro ao salvar credenciais. Tente novamente.';
                                errorDiv.classList.remove('hidden');
                                submitButton.disabled = false;
                                submitText.textContent = 'Entrar';
                            }
                        } else {
                            console.error('❌ [Login] Login falhou:', data.message);
                            errorMessage.textContent = data.message || 'Credenciais inválidas';
                            errorDiv.classList.remove('hidden');
                            submitButton.disabled = false;
                            submitText.textContent = 'Entrar';
                        }
                    } catch (error) {
                        console.error('❌ [Login] Erro:', error);
                        errorMessage.textContent = 'Erro ao fazer login. Tente novamente.';
                        errorDiv.classList.remove('hidden');
                        submitButton.disabled = false;
                        submitText.textContent = 'Entrar';
                    }
                });
            });
        </script>

        <div class="mt-8 text-center">
            <p class="text-white/70">
                Não tem uma conta? 
                <a href="{{ route('register') }}" class="text-purple-300 hover:text-purple-200 font-semibold transition-colors">
                    Cadastre-se
                </a>
            </p>
        </div>
    </div>
</body>
</html>
