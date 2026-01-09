@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: ========================================
:: CONFIGURACIÓN DE LA APLICACIÓN
:: ========================================
set "APP_TITLE=Generador de Platos Saludables"
set "APP_VERSION=1.0.0"
set "SERVER_PORT=3000"
set "SERVER_URL=http://localhost:%SERVER_PORT%"

:: ========================================
:: VARIABLES DE RUTAS
:: ========================================
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "SERVER_FILE=%BACKEND_DIR%\src\server.js"

:: ========================================
:: INICIO DEL SCRIPT
:: ========================================
cls
echo.
echo =========================================
echo    %APP_TITLE% v%APP_VERSION%
echo =========================================
echo.
echo Iniciando servidor web en puerto %SERVER_PORT%
echo Directorio raiz: %ROOT_DIR%
echo.

:: ========================================
:: VERIFICACIÓN DE PRERREQUISITOS
:: ========================================
echo [1/5] VERIFICACION DE PREREQUISITOS
echo.

:: Verificar Node.js
echo Comprobando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo.
    echo Por favor, instala Node.js desde:
    echo https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set "NODE_VERSION=%%i"
echo    OK: Node.js %NODE_VERSION% instalado

:: Verificar npm
echo Comprobando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no esta instalado
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set "NPM_VERSION=%%i"
echo    OK: npm v%NPM_VERSION% instalado

:: Verificar estructura de directorios
echo Comprobando estructura de directorios...
if not exist "%BACKEND_DIR%" (
    echo ERROR: No se encuentra el directorio backend
    mkdir "%BACKEND_DIR%"
    mkdir "%BACKEND_DIR%\src"
    echo    Creado directorio backend
)

if not exist "%FRONTEND_DIR%" (
    echo ERROR: No se encuentra el directorio frontend
    mkdir "%FRONTEND_DIR%"
    echo    Creado directorio frontend
)

if not exist "%SERVER_FILE%" (
    echo ADVERTENCIA: No se encuentra server.js
    echo    Se necesita el archivo server.js en: %SERVER_FILE%
)

echo    OK: Estructura de directorios correcta
echo.

:: ========================================
:: VERIFICACIÓN DE DEPENDENCIAS
:: ========================================
echo [2/5] VERIFICACION DE DEPENDENCIAS
echo.

:: Cambiar al directorio backend
pushd "%BACKEND_DIR%"

:: Verificar package.json
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
    echo   "keywords": ["platos", "comida", "saludable", "nodejs"],
    echo   "author": "",
    echo   "license": "MIT"
    echo }
    ) > package.json
    
    echo    OK: package.json creado
)

:: Verificar dependencias instaladas
echo Comprobando dependencias de Node.js...
if not exist "node_modules" (
    echo Dependencias no encontradas. Instalando...
    call :installDependencies
) else (
    echo    OK: Dependencias ya instaladas
    
    :: Verificar si express está instalado
    npm list express >nul 2>&1
    if %errorlevel% neq 0 (
        echo Express no encontrado. Reinstalando...
        call :installDependencies
    ) else (
        echo    OK: Express.js instalado
    )
)

popd
echo.

:: ========================================
:: INFORMACIÓN DEL SISTEMA
:: ========================================
echo [3/5] INFORMACION DEL SISTEMA
echo.
echo Configuracion actual:
echo    Puerto del servidor: %SERVER_PORT%
echo    URL de acceso: %SERVER_URL%
echo    Directorio backend: %BACKEND_DIR%
echo    Directorio frontend: %FRONTEND_DIR%
echo    Archivo del servidor: %SERVER_FILE%
echo.

:: ========================================
:: VERIFICACIÓN DE ARCHIVOS FRONTEND
:: ========================================
echo [4/5] VERIFICACION DE ARCHIVOS FRONTEND
echo.

set "MISSING_FILES=0"
echo Comprobando archivos del frontend...

if not exist "%FRONTEND_DIR%\index.html" (
    echo    FALTA: index.html
    set /a "MISSING_FILES+=1"
) else (
    echo    OK: index.html encontrado
)

if not exist "%FRONTEND_DIR%\style.css" (
    echo    FALTA: style.css
    set /a "MISSING_FILES+=1"
) else (
    echo    OK: style.css encontrado
)

if not exist "%FRONTEND_DIR%\script.js" (
    echo    FALTA: script.js
    set /a "MISSING_FILES+=1"
) else (
    echo    OK: script.js encontrado
)

if %MISSING_FILES% gtr 0 (
    echo.
    echo ADVERTENCIA: Faltan %MISSING_FILES% archivos del frontend
    echo La aplicacion puede no funcionar correctamente.
)

echo.

:: ========================================
:: INICIAR SERVIDOR
:: ========================================
echo [5/5] INICIANDO SERVIDOR
echo.
echo =========================================
echo INICIANDO SERVIDOR NODE.JS...
echo =========================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
echo Accede a la aplicacion en:
echo    %SERVER_URL%
echo.
echo =========================================
echo.

:: Configurar manejo de Ctrl+C
setlocal DisableDelayedExpansion
set "CtrlCExit="
for /f %%a in ('copy /Z "%~dpf0" nul') do set "CtrlCKey=%%a"
(
    endlocal
    set "CtrlCKey=%CtrlCKey%"
)

:: Ejecutar el servidor
pushd "%BACKEND_DIR%\src"
echo Ejecutando: node server.js
echo.
node server.js

:: Si llegamos aquí, el servidor se cerró
popd
echo.
echo =========================================
echo SERVIDOR DETENIDO
echo =========================================
echo.
echo El servidor ha sido detenido.
echo Para reiniciar, ejecuta este script nuevamente.
echo.
pause
exit /b 0

:: ========================================
:: FUNCIÓN PARA INSTALAR DEPENDENCIAS
:: ========================================
:installDependencies
    echo Instalando dependencias... Esto puede tomar un momento.
    echo.
    
    :: Instalar Express
    echo Ejecutando: npm install express --save
    npm install express --save
    
    if %errorlevel% neq 0 (
        echo ERROR: No se pudieron instalar las dependencias
        echo.
        echo Soluciones posibles:
        echo 1. Verifica tu conexion a internet
        echo 2. Intenta ejecutar como administrador
        echo 3. Instala manualmente: npm install express
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo OK: Dependencias instaladas correctamente
    echo.
goto:eof

:: ========================================
:: MANEJADOR DE CTRL+C
:: ========================================
:handleCtrlC
    echo.
    echo ^C
    echo Recibida senal de interrupcion (Ctrl+C)
    echo Cerrando servidor...
    
    :: Buscar proceso de Node.js y terminarlo
    taskkill /F /IM node.exe >nul 2>&1
    
    echo Servidor detenido correctamente.
    timeout /t 2 >nul
    exit /b 0