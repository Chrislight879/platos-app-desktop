@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: Configuración
set "APP_NAME=Generador de Platos Saludables"
set "BACKEND_DIR=%~dp0backend"

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║          INSTALADOR DE %APP_NAME%          ║
echo ╚══════════════════════════════════════════════════╝
echo.

:: Verificar Node.js
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js no está instalado
    echo.
    echo Por favor instala Node.js desde https://nodejs.org/
    echo Luego ejecuta este script nuevamente.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set "NODE_VER=%%i"
echo    ✅ Node.js !NODE_VER! detectado

:: Verificar npm
echo [2/4] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm no está instalado
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set "NPM_VER=%%i"
echo    ✅ npm v!NPM_VER! detectado

:: Verificar directorio backend
echo [3/4] Verificando estructura...
if not exist "%BACKEND_DIR%" (
    echo ❌ ERROR: No se encuentra el directorio backend
    echo.
    echo Asegúrate de que la estructura de carpetas sea:
    echo   platos-app-desktop/
    echo   ├── backend/
    echo   └── frontend/
    echo.
    pause
    exit /b 1
)
echo    ✅ Estructura de carpetas correcta

:: Instalar dependencias
echo [4/4] Instalando dependencias...
echo    Esto puede tomar unos momentos...
echo.

pushd "%BACKEND_DIR%"

if not exist "package.json" (
    echo ℹ Creando package.json...
    
    echo {
    echo   "name": "platos-app-backend",
    echo   "version": "1.0.0",
    echo   "description": "Servidor para Generador de Platos Saludables",
    echo   "main": "src/server.js",
    echo   "scripts": {
    echo     "start": "node src/server.js",
    echo     "dev": "node src/server.js"
    echo   },
    echo   "keywords": ["platos", "comida", "saludable"],
    echo   "author": "",
    echo   "license": "MIT",
    echo   "dependencies": {}
    echo } > package.json
)

echo 📦 Instalando Express.js...
npm install express --save --loglevel=error

if %errorlevel% equ 0 (
    echo ✅ Dependencias instaladas correctamente
) else (
    echo ❌ Error instalando dependencias
    echo Intentando con modo verbose...
    npm install express --save
)

popd

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║            INSTALACIÓN COMPLETADA               ║
echo ╚══════════════════════════════════════════════════╝
echo.
echo ✅ La aplicación ha sido configurada correctamente.
echo.
echo Para iniciar el servidor:
echo   1. Ejecuta 'run-server.bat'
echo   2. Abre http://localhost:3000 en tu navegador
echo.
echo Archivos de la aplicación:
echo   📁 backend/    - Servidor Node.js
echo   📁 frontend/   - Interfaz web
echo   📄 run-server.bat - Iniciar servidor
echo.
pause