@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: Configuración
set "APP_NAME=Generador de Platos Saludables"
set "BACKEND_DIR=%~dp0backend"

echo.
echo =========================================
echo    INSTALADOR DE %APP_NAME%
echo =========================================
echo.

:: Verificar Node.js
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo.
    echo Por favor instala Node.js desde https://nodejs.org/
    echo Luego ejecuta este script nuevamente.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set "NODE_VER=%%i"
echo    OK: Node.js !NODE_VER! detectado

:: Verificar npm
echo [2/4] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no esta instalado
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set "NPM_VER=%%i"
echo    OK: npm v!NPM_VER! detectado

:: Crear estructura de directorios si no existe
echo [3/4] Creando estructura de directorios...
if not exist "%BACKEND_DIR%" (
    mkdir "%BACKEND_DIR%"
    mkdir "%BACKEND_DIR%\src"
    echo    Creado: backend/src/
)

if not exist "frontend" (
    mkdir "frontend"
    echo    Creado: frontend/
)

echo    OK: Estructura de carpetas lista

:: Instalar dependencias
echo [4/4] Instalando dependencias...
echo    Esto puede tomar unos momentos...
echo.

pushd "%BACKEND_DIR%"

if not exist "package.json" (
    echo Creando package.json...
    
    (
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
    echo   "license": "MIT"
    echo }
    ) > package.json
    
    echo    OK: package.json creado
)

echo Instalando Express.js...
echo Ejecutando: npm install express --save
npm install express --save

if %errorlevel% equ 0 (
    echo    OK: Dependencias instaladas correctamente
) else (
    echo ERROR: Error instalando dependencias
    echo.
    echo Intenta manualmente:
    echo cd backend
    echo npm install express --save
)

popd

echo.
echo =========================================
echo    INSTALACION COMPLETADA
echo =========================================
echo.
echo OK: La aplicacion ha sido configurada correctamente.
echo.
echo Para iniciar el servidor:
echo   1. Ejecuta 'run-server.bat'
echo   2. Abre http://localhost:3000 en tu navegador
echo.
echo Archivos de la aplicacion:
echo   backend/     - Servidor Node.js
echo   frontend/    - Interfaz web
echo   run-server.bat - Iniciar servidor
echo.
echo NOTA: Asegurate de tener el archivo server.js en:
echo   %BACKEND_DIR%\src\server.js
echo.
pause