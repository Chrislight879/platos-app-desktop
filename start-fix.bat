@echo off
echo.
echo ========================================
echo   FIX - GENERADOR DE PLATOS
echo ========================================
echo.

echo Limpiando instalacion anterior...
cd backend
if exist node_modules rmdir /s /q node_modules

echo.
echo Reinstalando dependencias...
npm install express

echo.
echo Iniciando servidor...
echo.
echo Abre: http://localhost:3000
echo.
node src\server.js

pause