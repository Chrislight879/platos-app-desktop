@echo off
chcp 65001 >nul
title Compilador de Aplicación Desktop
color 0A

echo ========================================
echo   COMPILADOR - Generador de Platos
echo   Creando aplicación desktop
echo ========================================
echo.

REM Verificar Node.js y npm
node --version >nul 2>nul
if errorlevel 1 (
    echo [!] ERROR: Node.js no está instalado
    echo Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

npm --version >nul 2>nul
if errorlevel 1 (
    echo [!] ERROR: npm no está instalado
    pause
    exit /b 1
)

echo [*] Instalando dependencias de Electron...
cd /d "%~dp0"
call npm install

if errorlevel 1 (
    echo [!] Error al instalar dependencias de Electron
    pause
    exit /b 1
)

echo [*] Compilando aplicación...
echo [*] Esto puede tomar varios minutos...

REM Construir aplicación para Windows
call npm run build:win

if errorlevel 1 (
    echo.
    echo [!] Error durante la compilación
    echo [!] Verifica que tengas acceso a internet para descargar dependencias
    pause
    exit /b 1
)

echo.
echo ✅ COMPILACIÓN EXITOSA
echo.
echo 📁 La aplicación se encuentra en:
echo    "dist/Generador de Platos Setup.exe"
echo.
echo 📝 Para instalar:
echo    1. Ejecuta el archivo Setup.exe
echo    2. Sigue las instrucciones del instalador
echo    3. La aplicación aparecerá en el menú Inicio y escritorio
echo.
echo 🚀 Características incluídas:
echo    • Sistema completo de generación de platos
echo    • Base de datos SQLite integrada
echo    • Dieta de 1500 calorías preconfigurada
echo    • 133 alimentos diferentes
echo    • Sistema de sustituciones automáticas
echo    • No requiere instalación adicional
echo.
pause