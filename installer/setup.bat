@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   INSTALADOR - Generador de Platos
echo ========================================
echo.

REM Verificar si Node.js está instalado
echo [*] Verificando Node.js...
node --version >nul 2>nul
if errorlevel 1 (
    echo [!] Node.js no está instalado
    echo [*] Descargando Node.js...
    
    REM Descargar Node.js LTS
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi' -OutFile '%TEMP%\nodejs.msi'"
    
    REM Instalar Node.js
    msiexec /i "%TEMP%\nodejs.msi" /quiet /norestart
    del "%TEMP%\nodejs.msi"
    
    REM Actualizar PATH
    setx PATH "%PATH%;%ProgramFiles%\nodejs" /M
    echo [+] Node.js instalado correctamente
) else (
    echo [+] Node.js ya está instalado
)

REM Crear directorio de instalación
echo [*] Creando directorio de instalación...
set INSTALL_DIR="%ProgramFiles%\GeneradorPlatos"
if not exist %INSTALL_DIR% mkdir %INSTALL_DIR%

REM Copiar archivos
echo [*] Copiando archivos...
xcopy /E /I /Y "backend" "%INSTALL_DIR%\backend"
xcopy /E /I /Y "frontend" "%INSTALL_DIR%\frontend"

REM Instalar dependencias del backend
echo [*] Instalando dependencias...
cd /d "%INSTALL_DIR%\backend"
call npm install --production

REM Crear acceso directo
echo [*] Creando acceso directo...
set SHORTCUT="%USERPROFILE%\Desktop\Generador de Platos.lnk"
set TARGET="%WINDIR%\System32\cmd.exe"
set ICON="%INSTALL_DIR%\icon.ico"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%USERPROFILE%\Desktop\Generador de Platos.lnk'); $s.TargetPath = 'cmd.exe'; $s.Arguments = '/c \"cd /d %INSTALL_DIR%\backend && node src/server.js\"'; $s.WorkingDirectory = '%INSTALL_DIR%\backend'; $s.Save()"

REM Crear script de inicio
echo [*] Creando script de inicio...
(
@echo off
chcp 65001 ^>nul
title Generador de Platos
echo ========================================
echo   GENERADOR DE PLATOS SALUDABLES
echo ========================================
echo.
echo [*] Iniciando servidor...
echo [*] URL: http://localhost:3000
echo.
cd /d "%~dp0"
node src/server.js
echo.
pause
) > "%INSTALL_DIR%\Iniciar.bat"

REM Crear archivo de configuración
echo [*] Creando configuración...
(
{
    "port": 3000,
    "database": {
        "path": "%APPDATA%/platos-app/platos.db"
    },
    "autoStart": true
}
) > "%INSTALL_DIR%\config.json"

REM Crear desinstalador
echo [*] Creando desinstalador...
(
@echo off
chcp 65001 ^>nul
echo ========================================
echo   DESINSTALADOR - Generador de Platos
echo ========================================
echo.
echo [!] Esto eliminará la aplicación
set /p CONFIRM="¿Estás seguro? (s/n): "
if /i "!CONFIRM!" neq "s" exit /b 1
echo.
echo [*] Deteniendo servidor...
taskkill /f /im node.exe 2^>nul
echo [*] Eliminando archivos...
rmdir /s /q "%ProgramFiles%\GeneradorPlatos" 2^>nul
del "%USERPROFILE%\Desktop\Generador de Platos.lnk" 2^>nul
echo.
echo [+] Desinstalación completada
pause
) > "%INSTALL_DIR%\Desinstalar.bat"

echo.
echo ========================================
echo   INSTALACIÓN COMPLETADA
echo ========================================
echo.
echo Resumen:
echo   - Aplicación instalada en: %INSTALL_DIR%
echo   - Para iniciar: Doble clic en "Generador de Platos" en el escritorio
echo   - O ejecuta: %INSTALL_DIR%\Iniciar.bat
echo   - URL de acceso: http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul