@echo off
echo Configurando o projeto Salao da Guilda...

echo.
echo 1. Copiando arquivo de configuração...
copy .env.example .env

echo.
echo 2. Gerando chave da aplicacao...
php artisan key:generate

echo.
echo 3. Executando migracoes...
php artisan migrate

echo.
echo 4. Instalando dependencias do Node.js...
npm install

echo.
echo 5. Compilando assets...
npm run build

echo.
echo Configuracao concluida!
echo.
echo Para executar o projeto:
echo 1. Execute: php artisan serve
echo 2. Em outro terminal: npm run dev
echo 3. Acesse: http://localhost:8000
echo.
pause










