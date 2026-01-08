@echo off
chcp 65001 >nul
title Desinstalador - Generador de Platos
color 0C

echo ========================================
echo   DESINSTALADOR - Generador de Platos
echo ========================================
echo.
echo [!] ADVERTENCIA: Esto eliminará completamente la aplicación
echo.

set /p CONFIRM="¿Estás seguro de que quieres desinstalar? (s/N): "
if /i not "%CONFIRM%"=="s" (
    echo Desinstalación cancelada.
    timeout /t 3 /nobreak >nul
    exit /b 0
)

echo.
echo [*] Deteniendo servicios...
taskkill /f /im "Generador de Platos.exe" 2>nul
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [*] Eliminando archivos de programa...
if exist "%ProgramFiles%\GeneradorPlatos" (
    rmdir /s /q "%ProgramFiles%\GeneradorPlatos" 2>nul
    echo ✓ Directorio de programa eliminado
)

echo [*] Eliminando datos de usuario...
if exist "%APPDATA%\platos-app" (
    rmdir /s /q "%APPDATA%\platos-app" 2>nul
    echo ✓ Datos de usuario eliminados
)

echo [*] Eliminando accesos directos...
del "%PUBLIC%\Desktop\Generador de Platos.lnk" 2>nul
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Generador de Platos.lnk" 2>nul
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Generador de Platos.lnk" 2>nul
echo ✓ Accesos directos eliminados

echo [*] Eliminando entradas del registro...
reg delete "HKCU\Software\GeneradorPlatos" /f 2>nul
reg delete "HKLM\Software\GeneradorPlatos" /f 2>nul
reg delete "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\GeneradorPlatos" /f 2>nul
echo ✓ Entradas del registro eliminadas

echo.
echo ✅ DESINSTALACIÓN COMPLETADA
echo.
echo La aplicación ha sido eliminada completamente de tu sistema.
echo.
echo Si deseas reinstalar, descarga el instalador nuevamente.
echo.
pause