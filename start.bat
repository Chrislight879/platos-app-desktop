@echo off
echo ========================================
echo   GENERADOR DE PLATOS DE DIETA - WEB
echo ========================================
echo.

echo Iniciando la aplicacion web...
echo.

REM Navegar al directorio backend
cd backend

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado o no esta en el PATH.
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si la base de datos existe
if not exist dieta.db (
    echo Base de datos no encontrada. Inicializando...
    call npm run init-db
)

REM Instalar dependencias si no existen
if not exist node_modules (
    echo Instalando dependencias...
    call npm install
)

REM Iniciar el servidor
echo.
echo Iniciando servidor web...
echo.
echo Accede a la aplicacion en: http://localhost:3000
echo Presiona Ctrl+C para detener el servidor
echo.
node src/server.js

pause