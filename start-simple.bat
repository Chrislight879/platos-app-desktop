@echo off
cd /d "%~dp0"

echo.
echo ========================================
echo   GENERADOR DE PLATOS SALUDABLES
echo ========================================
echo.

echo 1. Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado.
    echo Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)

echo 2. Iniciando servidor...
echo.
echo ========================================
echo   SERVIDOR INICIANDO...
echo ========================================
echo.
echo Abre en tu navegador:
echo   http://localhost:3000
echo.
echo Presiona Ctrl+C para detener
echo ========================================
echo.

cd backend
node src\server.js

echo.
echo Servidor detenido.
pause