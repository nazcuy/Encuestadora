@echo off
REM Script para matar todos los procesos Chrome en Windows

echo.
echo ============================================
echo  Matando procesos Chrome/Puppeteer...
echo ============================================
echo.

REM Matar Chrome
taskkill /F /IM chrome.exe /T 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Chrome terminado
) else (
    echo ✗ No se encontraron procesos Chrome
)

REM Matar Chromedriver
taskkill /F /IM chromedriver.exe /T 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Chromedriver terminado
)

REM Dar tiempo para completar
timeout /t 2 /nobreak

echo.
echo ============================================
echo  Todos los procesos han sido terminados
echo ============================================
echo.

pause
