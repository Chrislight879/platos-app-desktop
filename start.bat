@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo   GENERADOR DE PLATOS SALUDABLES
echo ========================================
echo.

echo Paso 1: Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado!
    echo.
    echo Descargalo desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo.
echo Paso 2: Verificando dependencias...
if not exist "backend\node_modules" (
    echo Instalando Express.js...
    cd backend
    call npm install express
    cd ..
) else (
    echo Dependencias ya instaladas.
)

echo.
echo Paso 3: Iniciando servidor...
echo.
echo ========================================
echo   SERVIDOR INICIADO!
echo ========================================
echo.
echo Abre tu navegador y visita:
echo   http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
echo Los logs se mostraran aqui:
echo ========================================
echo.

cd backend
node src\server.js

echo.
echo ========================================
echo   SERVIDOR DETENIDO
echo ========================================
echo.
echo Para reiniciar, ejecuta este archivo nuevamente.
pause