@echo off
chcp 65001 >nul
title Generador de Platos - Backend (Dieta 1500 Calorías)
color 0A

echo ========================================
echo    GENERADOR DE PLATOS SALUDABLES
echo    Dieta de 1500 Calorías
echo ========================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>nul
if errorlevel 1 (
    echo [!] ERROR: Node.js no está instalado
    echo.
    echo Por favor, instala Node.js desde:
    echo https://nodejs.org/
    echo.
    echo Después ejecuta:
    echo npm install
    echo.
    pause
    exit /b 1
)

REM Verificar dependencias
if not exist "node_modules" (
    echo [*] Instalando dependencias Node.js...
    echo [*] Esto puede tomar unos minutos...
    call npm install
    if errorlevel 1 (
        echo [!] Error al instalar dependencias
        pause
        exit /b 1
    )
)

echo [*] Inicializando base de datos...
echo [*] Configurando dieta de 1500 calorías...
node init-db.js

if errorlevel 1 (
    echo [!] Error al inicializar base de datos
    pause
    exit /b 1
)

echo.
echo [*] Iniciando servidor backend...
echo [*] Puerto: 3000
echo [*] URL de acceso: http://localhost:3000
echo [*] API disponible en: http://localhost:3000/api
echo.
echo [ℹ]  Grupos alimenticios cargados:
echo       Grupo 1: Lácteos (4 alimentos)
echo       Grupo 2: Proteínas (31 alimentos)
echo       Grupo 3: Frutas (36 alimentos)
echo       Grupo 4: Cereales (23 alimentos)
echo       Grupo 5: Verduras (27 alimentos)
echo       Grupo 6: Grasas (12 alimentos)
echo.
echo [ℹ]  Porciones configuradas para dieta de 1500 calorías
echo [ℹ]  Sistema de sustituciones del Grupo 1 activado
echo.

REM Iniciar servidor
node src/server.js

if errorlevel 1 (
    echo.
    echo [!] ERROR: No se pudo iniciar el servidor
    echo [!] Verifica que el puerto 3000 no esté en uso
    pause
)