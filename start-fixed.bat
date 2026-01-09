@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo   GENERADOR DE PLATOS - VERSION CORREGIDA
echo ========================================
echo.

echo 1. Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no encontrado!
    echo Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)

echo 2. Limpiando instalaciones anteriores...
if exist "backend\node_modules" (
    echo Eliminando node_modules antiguos...
    rmdir /s /q "backend\node_modules" 2>nul
)

echo 3. Creando package.json limpio...
cd backend
(
echo {
echo   "name": "platos-app",
echo   "version": "1.0.0",
echo   "main": "src/server.js",
echo   "scripts": { "start": "node src/server.js" },
echo   "dependencies": {}
echo }
) > package.json

echo 4. Instalando Express...
npm install express@4.18.2 --save --no-optional

echo.
echo 5. INICIANDO SERVIDOR...
echo ========================================
echo   URL: http://localhost:3000
echo ========================================
echo.
echo Presiona Ctrl+C para detener
echo.

timeout /t 2 /nobreak >nul
node src\server.js

echo.
echo Servidor detenido.
pause