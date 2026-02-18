const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Limpiando sesiones de WhatsApp...');

const authPath = path.join(__dirname, 'wwebjs_auth');
if (fs.existsSync(authPath)) {
    fs.rmSync(authPath, { recursive: true, force: true });
    console.log('✅ Carpeta wwebjs_auth eliminada');
}

// Eliminar también la caché de wwebjs
const cachePath = path.join(__dirname, '.wwebjs_auth');
if (fs.existsSync(cachePath)) {
    fs.rmSync(cachePath, { recursive: true, force: true });
    console.log('✅ Caché de wwebjs eliminada');
}

// Matar procesos de Chrome/Puppeteer colgados
try {
    if (process.platform === 'win32') {
        execSync('taskkill /F /IM chrome.exe /T', { stdio: 'ignore' });
        execSync('taskkill /F /IM chromedriver.exe /T', { stdio: 'ignore' });
    } else {
        execSync('pkill -f chrome', { stdio: 'ignore' });
        execSync('pkill -f chromedriver', { stdio: 'ignore' });
    }
    console.log('✅ Procesos de Chrome terminados');
} catch (e) {
    // Ignorar errores si no hay procesos
}

console.log('\n✨ Limpieza completada. Ahora puedes reiniciar el servidor.');