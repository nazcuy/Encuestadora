@echo off
echo ======================
echo WhatsApp Poll Sender
echo ======================

echo [1/5] Matando procesos previos...
taskkill /F /IM chrome.exe >nul 2>&1
taskkill /F /IM chromedriver.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

echo [2/5] Limpiando sesiones antiguas...
if exist wwebjs_auth (
    rmdir /s /q wwebjs_auth
    echo ✅ Sesiones eliminadas
) else (
    echo ℹ No hay sesiones previas
)

echo [3/5] Esperando 5 segundos para limpieza...
timeout /t 5 /nobreak >nul

echo [4/5] Verificando node_modules...
if not exist node_modules (
    echo 📦 Instalando dependencias...
    call npm install
)

echo [5/5] Iniciando servidor backend...
echo ==============================================
echo IMPORTANTE:
echo 1. Deja esta ventana ABIERTA
echo 2. Abre otra terminal para el frontend
echo 3. Escanea el QR cuando aparezca
echo ==============================================

npm run dev

pause