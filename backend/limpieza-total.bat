@echo off
cls
echo ============================================
echo LIMPIEZA COMPLETA - WhatsApp Poll Sender
echo ============================================
echo.

echo [1/6] Matando TODOS los procesos Node.js...
taskkill /F /IM node.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Procesos Node terminados
) else (
    echo ℹ No habia procesos Node activos
)

echo.
echo [2/6] Matando procesos Chrome/Puppeteer...
taskkill /F /IM chrome.exe /T >nul 2>&1
taskkill /F /IM chromedriver.exe /T >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Procesos Chrome terminados
) else (
    echo ℹ No habia procesos Chrome activos
)

echo.
echo [3/6] Liberando puerto 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo ✅ Puerto 3001 liberado

echo.
echo [4/6] Eliminando sesiones de WhatsApp...
if exist wwebjs_auth (
    rmdir /s /q wwebjs_auth
    echo ✅ Carpeta wwebjs_auth eliminada
) else (
    echo ℹ No habia sesiones guardadas
)

if exist .wwebjs_auth (
    rmdir /s /q .wwebjs_auth
    echo ✅ Caché de wwebjs eliminada
)

if exist .wwebjs_cache (
    rmdir /s /q .wwebjs_cache
    echo ✅ Caché adicional eliminada
)

echo.
echo [5/6] Esperando 5 segundos para asegurar limpieza...
timeout /t 5 /nobreak >nul

echo.
echo [6/6] Verificando estado...
netstat -ano | findstr :3001 >nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️ Puerto 3001 aún en uso - reinicia tu PC
) else (
    echo ✅ Puerto 3001 disponible
)

echo.
echo ============================================
echo ✨ LIMPIEZA COMPLETADA
echo ============================================
echo.
echo Próximos pasos:
echo 1. npm run dev (en esta terminal)
echo 2. Espera a ver el QR
echo 3. Escanea con WhatsApp
echo ============================================
echo.
pause
