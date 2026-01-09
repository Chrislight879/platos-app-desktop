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
:: COLORES PARA LA CONSOLA
:: ========================================
set "COLOR_RESET=[0m"
set "COLOR_RED=[91m"
set "COLOR_GREEN=[92m"
set "COLOR_YELLOW=[93m"
set "COLOR_BLUE=[94m"
set "COLOR_MAGENTA=[95m"
set "COLOR_CYAN=[96m"
set "COLOR_WHITE=[97m"
set "COLOR_GRAY=[90m"

:: Función para imprimir con color
:printColor
    echo %time% %~2
    echo.
goto:eof

:: Función para imprimir título
:printTitle
    echo.
    echo %time% [1;95m╔══════════════════════════════════════════════════════════════╗
    echo %time% [1;95m║                                                              ║
    echo %time% [1;95m║    %~1
    echo %time% [1;95m║                                                              ║
    echo %time% [1;95m╚══════════════════════════════════════════════════════════════╝[0m
    echo.
goto:eof

:: Función para imprimir sección
:printSection
    echo %time% [1;94m══════════════════════════════════════════════════════════════════[0m
    echo %time% [1;94m  %~1[0m
    echo %time% [1;94m══════════════════════════════════════════════════════════════════[0m
    echo.
goto:eof

:: Función para imprimir paso
:printStep
    echo %time% [1;92m✓[0m %~1
goto:eof

:: Función para imprimir error
:printError
    echo %time% [1;91m✗ ERROR:[0m %~1
goto:eof

:: Función para imprimir advertencia
:printWarning
    echo %time% [1;93m⚠ ADVERTENCIA:[0m %~1
goto:eof

:: Función para imprimir información
:printInfo
    echo %time% [1;96mℹ INFO:[0m %~1
goto:eof

:: Función para imprimir éxito
:printSuccess
    echo %time% [1;92m✓ ÉXITO:[0m %~1
goto:eof

:: ========================================
:: INICIO DEL SCRIPT
:: ========================================
cls
call :printTitle "%APP_TITLE% v%APP_VERSION%"
echo %time% [1;97mIniciando servidor web en puerto %SERVER_PORT%[0m
echo %time% [90mDirectorio raíz: %ROOT_DIR%[0m
echo.

:: ========================================
:: VERIFICACIÓN DE PRERREQUISITOS
:: ========================================
call :printSection "VERIFICACIÓN DE PRERREQUISITOS"

:: Verificar Node.js
echo %time% [96mComprobando Node.js...[0m
node --version >nul 2>&1
if %errorlevel% neq 0 (
    call :printError "Node.js no está instalado"
    echo %time% [93mPor favor, instala Node.js desde:[0m
    echo %time% [94mhttps://nodejs.org/[0m
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set "NODE_VERSION=%%i"
call :printStep "Node.js %NODE_VERSION% instalado ✓"

:: Verificar npm
echo %time% [96mComprobando npm...[0m
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    call :printError "npm no está instalado"
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set "NPM_VERSION=%%i"
call :printStep "npm v%NPM_VERSION% instalado ✓"

:: Verificar estructura de directorios
echo %time% [96mComprobando estructura de directorios...[0m
if not exist "%BACKEND_DIR%" (
    call :printError "No se encuentra el directorio backend: %BACKEND_DIR%"
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    call :printError "No se encuentra el directorio frontend: %FRONTEND_DIR%"
    pause
    exit /b 1
)

if not exist "%SERVER_FILE%" (
    call :printError "No se encuentra el archivo server.js: %SERVER_FILE%"
    pause
    exit /b 1
)

call :printStep "Estructura de directorios correcta ✓"
echo.

:: ========================================
:: VERIFICACIÓN DE DEPENDENCIAS
:: ========================================
call :printSection "VERIFICACIÓN DE DEPENDENCIAS"

:: Verificar package.json en backend
if not exist "%BACKEND_DIR%\package.json" (
    call :printWarning "No existe package.json en backend, creando uno básico..."
    
    echo {
    echo   "name": "platos-app-backend",
    echo   "version": "1.0.0",
    echo   "description": "Servidor para Generador de Platos Saludables",
    echo   "main": "src/server.js",
    echo   "scripts": {
    echo     "start": "node src/server.js",
    echo     "dev": "node src/server.js",
    echo     "test": "echo \"Error: no test specified\" ^&^& exit 1"
    echo   },
    echo   "keywords": ["platos", "comida", "saludable", "nodejs"],
    echo   "author": "",
    echo   "license": "MIT",
    echo   "dependencies": {}
    echo } > "%BACKEND_DIR%\package.json"
    
    call :printSuccess "package.json creado en %BACKEND_DIR%"
)

:: Cambiar al directorio backend
pushd "%BACKEND_DIR%"

:: Verificar dependencias instaladas
echo %time% [96mComprobando dependencias de Node.js...[0m
if not exist "node_modules" (
    call :printWarning "node_modules no encontrado. Instalando dependencias..."
    
    echo %time% [93mInstalando Express.js...[0m
    call :installDependencies
) else (
    call :printStep "Dependencias ya instaladas ✓"
    
    :: Verificar si express está instalado
    echo %time% [96mVerificando paquete Express...[0m
    npm list express >nul 2>&1
    if %errorlevel% neq 0 (
        call :printWarning "Express no encontrado en node_modules"
        call :installDependencies
    ) else (
        call :printStep "Express.js instalado ✓"
    )
)

popd
echo.

:: ========================================
:: INFORMACIÓN DEL SISTEMA
:: ========================================
call :printSection "INFORMACIÓN DEL SISTEMA"

echo %time% [96mConfiguración actual:[0m
echo %time% [90m  Puerto del servidor:[0m [97m%SERVER_PORT%[0m
echo %time% [90m  URL de acceso:[0m [97m%SERVER_URL%[0m
echo %time% [90m  Directorio backend:[0m [97m%BACKEND_DIR%[0m
echo %time% [90m  Directorio frontend:[0m [97m%FRONTEND_DIR%[0m
echo %time% [90m  Archivo del servidor:[0m [97m%SERVER_FILE%[0m
echo.

:: ========================================
:: VERIFICACIÓN DE ARCHIVOS FRONTEND
:: ========================================
call :printSection "VERIFICACIÓN DE ARCHIVOS FRONTEND"

set "MISSING_FILES=0"
echo %time% [96mComprobando archivos del frontend...[0m

if not exist "%FRONTEND_DIR%\index.html" (
    call :printError "Falta: index.html"
    set /a "MISSING_FILES+=1"
) else (
    call :printStep "index.html encontrado ✓"
)

if not exist "%FRONTEND_DIR%\style.css" (
    call :printError "Falta: style.css"
    set /a "MISSING_FILES+=1"
) else (
    call :printStep "style.css encontrado ✓"
)

if not exist "%FRONTEND_DIR%\script.js" (
    call :printError "Falta: script.js"
    set /a "MISSING_FILES+=1"
) else (
    call :printStep "script.js encontrado ✓"
)

if %MISSING_FILES% gtr 0 (
    call :printWarning "Faltan %MISSING_FILES% archivos del frontend"
    echo %time% [93mLa aplicación puede no funcionar correctamente.[0m
) else (
    call :printSuccess "Todos los archivos del frontend están presentes ✓"
)
echo.

:: ========================================
:: INICIAR SERVIDOR
:: ========================================
call :printSection "INICIANDO SERVIDOR"

echo %time% [1;92m▶ Iniciando servidor Node.js...[0m
echo %time% [96mPresiona Ctrl+C para detener el servidor[0m
echo %time% [96mAccede a la aplicación en: [1;97m%SERVER_URL%[0m
echo.

:: Configurar manejo de Ctrl+C
echo %time% [90m[Presiona Ctrl+C para cerrar el servidor y este script][0m
echo.

:: Ejecutar el servidor
pushd "%BACKEND_DIR%\src"
node server.js
popd

:: ========================================
:: FIN DEL SCRIPT (cuando se cierra el servidor)
:: ========================================
echo.
call :printSection "SERVIDOR DETENIDO"
echo %time% [93mEl servidor ha sido detenido.[0m
echo %time% [96mPara reiniciar, ejecuta este script nuevamente.[0m
pause
exit /b 0

:: ========================================
:: FUNCIÓN PARA INSTALAR DEPENDENCIAS
:: ========================================
:installDependencies
    echo %time% [93mInstalando dependencias... Esto puede tomar un momento.[0m
    
    :: Instalar Express
    npm install express --save --loglevel=error
    if %errorlevel% neq 0 (
        call :printError "Error instalando Express"
        echo %time% [93mIntentando con conexión más lenta...[0m
        npm install express --save --verbose
    )
    
    if %errorlevel% equ 0 (
        call :printSuccess "Dependencias instaladas correctamente ✓"
    ) else (
        call :printError "No se pudieron instalar las dependencias"
        echo %time% [93mRevisa tu conexión a internet e intenta nuevamente.[0m
        pause
        exit /b 1
    )
goto:eof

:: ========================================
:: MANEJO DE CIERRE
:: ========================================
:cleanup
    echo.
    echo %time% [91mRecibida señal de interrupción (Ctrl+C)[0m
    echo %time% [93mCerrando servidor...[0m
    
    :: Buscar proceso de Node.js y terminarlo
    taskkill /F /IM node.exe >nul 2>&1
    
    call :printSection "SERVIDOR DETENIDO"
    echo %time% [92mServidor detenido correctamente.[0m
    echo %time% [96mHasta pronto![0m
    timeout /t 3 >nul
    exit /b 0