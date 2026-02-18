@echo off
echo ====================================
echo WhatsApp Poll Sender - Fix Windows
echo ====================================

echo 1. Matando procesos de Chrome...
taskkill /F /IM chrome.exe >nul 2>&1
taskkill /F /IM chromedriver.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

echo 2. Limpiando sesiones anteriores...
if exist wwebjs_auth (
    rmdir /s /q wwebjs_auth
)

echo 3. Limpiando node_modules...
if exist node_modules (
    rmdir /s /q node_modules
)

echo 4. Limpiando package-lock.json...
del package-lock.json 2>nul

echo 5. Reinstalando dependencias...
call npm install

echo.
echo ✅ ¡Listo! Ahora ejecuta: npm run dev
echo ====================================
pause