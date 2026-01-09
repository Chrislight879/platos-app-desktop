@echo off
echo.
echo ========================================
echo   INSTALADOR - PLATOS SALUDABLES
echo ========================================
echo.

echo Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado.
    echo Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Creando estructura de carpetas...
if not exist "backend\src" mkdir backend\src
if not exist "frontend" mkdir frontend

echo.
echo Creando package.json...
cd backend
if not exist package.json (
    echo { > package.json
    echo   "name": "platos-app", >> package.json
    echo   "version": "1.0.0", >> package.json
    echo   "main": "src/server.js", >> package.json
    echo   "scripts": { >> package.json
    echo     "start": "node src/server.js" >> package.json
    echo   } >> package.json
    echo } >> package.json
)

echo.
echo Instalando Express.js...
npm install express --save

echo.
echo ========================================
echo   INSTALACION COMPLETADA!
echo ========================================
echo.
echo Para iniciar la aplicacion:
echo   1. Ejecuta start.bat
echo   2. Abre http://localhost:3000
echo.
pause