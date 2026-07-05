@echo off
title InterFacil - Iniciando servicos

cd /d "%~dp0"

echo ========================================
echo     INTERFACIL - INICIAR SERVICOS
echo ========================================
echo.

:: Verifica PostgreSQL
docker exec interfone-postgres pg_isready -U admin >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] PostgreSQL nao esta rodando.
    echo Execute: docker compose up -d
    pause
    exit /b 1
)
echo [OK] PostgreSQL conectado
echo.

:: Instala dependencias se necessario
echo Verificando dependencias...
if not exist "backend\chamada-service\node_modules\shared-db" (
    echo Instalando shared-db no chamada-service...
    cd backend\chamada-service
    call npm install >nul 2>&1
    cd ..\..

    if not exist "backend\chamada-service\node_modules\shared-db" (
        echo [ERRO] Falha ao instalar shared-db no chamada-service
        pause
        exit /b 1
    )
)
echo [OK] Dependencias verificadas
echo.

:: Abre cada servico em uma nova janela
echo Iniciando servicos...

start "Auth Service" cmd /c "cd /d %~dp0backend\auth-service && npm start"
timeout /t 2 /nobreak >nul

start "Registro Service" cmd /c "cd /d %~dp0backend\registro-service && npm start"
timeout /t 2 /nobreak >nul

start "Chamada Service" cmd /c "cd /d %~dp0backend\chamada-service && npm start"
timeout /t 2 /nobreak >nul

start "Signaling Server" cmd /c "cd /d %~dp0signaling-server && npm start"

echo.
echo ========================================
echo  TODOS OS SERVICOS FORAM INICIADOS
echo ========================================
echo.
echo  Auth:      http://localhost:3001
echo  Registro:  http://localhost:3002
echo  Chamada:   http://localhost:3003
echo  Signaling: http://localhost:3004
echo.
echo  Para parar: feche as janelas abertas
echo.
pause
