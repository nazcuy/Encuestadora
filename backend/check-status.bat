@echo off
echo Verificando estado del WhatsApp Poll Sender...
echo.

echo 1. Procesos activos:
tasklist | findstr /i "node chrome"

echo.
echo 2. Sesiones guardadas:
if exist wwebjs_auth (
    dir wwebjs_auth
) else (
    echo No hay sesiones guardadas
)

echo.
echo 3. Estado del backend (si está corriendo):
curl -s http://localhost:3001/health || echo "Backend no responde"

echo.
echo 4. Puerto 3001 en uso:
netstat -ano | findstr :3001

echo.
pause