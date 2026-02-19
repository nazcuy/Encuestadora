/**
 * WhatsApp Poll Sender - Backend Server
 * Stack: Node.js + Express + Socket.io + whatsapp-web.js
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Client, LocalAuth, Poll } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

const app = express();
const server = http.createServer(app);

// Función para matar procesos de Chrome en Windows
const killChromeProcesses = () => {
    return new Promise((resolve) => {
        if (os.platform() === 'win32') {
            exec('taskkill /F /IM chrome.exe /T', (error) => {
                if (!error) console.log('✅ Procesos Chrome terminados');
                exec('taskkill /F /IM chromedriver.exe /T', () => {
                    resolve();
                });
            });
        } else {
            exec('pkill -f chrome 2>/dev/null || true', () => {
                resolve();
            });
        }
    });
};

// Configuración de Socket.io con CORS
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());

// Variables globales
let client = null;
let isClientReady = false;
let connectedSocket = null;

// Función para emitir logs al frontend
const emitLog = (type, message) => {
    const logEntry = {
        type, // 'info', 'success', 'error', 'warning'
        message,
        timestamp: new Date().toISOString()
    };
    console.log(`[${type.toUpperCase()}] ${message}`);
    if (connectedSocket) {
        connectedSocket.emit('log', logEntry);
    }
};

// Función para limpiar sesiones corruptas
const cleanupCorruptedSession = () => {
    const authPath = path.join(__dirname, 'wwebjs_auth');
    if (!fs.existsSync(authPath)) return false;
    
    try {
        const items = fs.readdirSync(authPath);
        const sessionFolders = items.filter(item => item.startsWith('session-'));
        if (sessionFolders.length > 5) {
            emitLog('warning', `Detectadas ${sessionFolders.length} sesiones antiguas, limpiando...`);
            
            sessionFolders.sort();
            const toDelete = sessionFolders.slice(0, -2);
            
            for (const folder of toDelete) {
                const folderPath = path.join(authPath, folder);
                try {
                    fs.rmSync(folderPath, { recursive: true, force: true });
                    emitLog('info', `Eliminada sesión antigua: ${folder}`);
                } catch (e) {
                    // Ignorar errores
                }
            }
            return true;
        }
    } catch (error) {
        emitLog('warning', `Error al limpiar sesiones: ${error.message}`);
    }
    return false;
};

// FUNCIÓN MEJORADA para crear cliente
const createNewClient = () => {
    emitLog('info', 'Creando nuevo cliente de WhatsApp...');
    
    const sessionId = "whatsapp-poll-sender";
    
    client = new Client({
        authStrategy: new LocalAuth({
            dataPath: './wwebjs_auth',
            clientId: sessionId
        }),
        puppeteer: {
            headless: false, // ⚠️ CAMBIADO A FALSE para debugging
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-extensions',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-blink-features=AutomationControlled',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ],
            executablePath: process.env.CHROME_PATH || undefined
        }
        // ⚠️ ELIMINADO webVersionCache que causaba problemas
    });

    // Evento: QR Code generado
    client.on('qr', (qr) => {
        emitLog('info', '📱 Código QR generado. Escanea con WhatsApp.');
        console.log('\n=== ESCANEA ESTE QR CON WHATSAPP ===\n');
        qrcode.generate(qr, { small: true });
        console.log('\n====================================\n');

        if (connectedSocket) {
            connectedSocket.emit('qr', qr);
        }
    });

    // Evento: Autenticación exitosa
    client.on('authenticated', () => {
        emitLog('success', '✅ Autenticación exitosa.');
        emitLog('info', '⏳ Esperando que el cliente esté completamente listo...');
    });

    // Evento: Fallo en autenticación
    client.on('auth_failure', (msg) => {
        emitLog('error', `❌ Fallo de autenticación: ${msg}`);
        isClientReady = false;
    });

    // Evento: Pantalla de carga
    client.on('loading_screen', (percent, message) => {
        if (percent % 10 === 0 || percent > 80) {
            emitLog('info', `📊 Cargando: ${percent}% - ${message}`);
            if (connectedSocket) {
                connectedSocket.emit('loading', { percent, message });
            }
        }
    });

    // Evento: Cliente listo
    client.on('ready', async () => {
        try {
            emitLog('info', '🔄 Evento ready recibido, verificando estado...');
            const state = await client.getState();
            emitLog('info', `📱 Estado actual: ${state}`);
            
            isClientReady = true;
            emitLog('success', '✅ CLIENTE LISTO - Ya puedes enviar encuestas');

            if (connectedSocket) {
                connectedSocket.emit('ready', { status: true });
            }
        } catch (error) {
            emitLog('error', `❌ Cliente no listo: ${error.message}`);
            isClientReady = false;
        }
    });

    // Evento: Desconexión
    client.on('disconnected', (reason) => {
        isClientReady = false;
        emitLog('warning', `⚠️ Cliente de WhatsApp desconectado: ${reason}`);

        if (connectedSocket) {
            connectedSocket.emit('disconnected', { reason });
        }
    });
    
    // Evento: Error general
    client.on('error', (error) => {
        emitLog('error', `❌ Error en cliente: ${error.message}`);
        console.error('Stack trace:', error.stack);
        isClientReady = false;
    });
    
    // Evento: Cambio de estado
    client.on('change_state', (state) => {
        emitLog('info', `📱 Estado cambiado a: ${state}`);
    });

    // Iniciar cliente
    let initTimeout = null;
    
    emitLog('info', '🚀 Iniciando cliente de WhatsApp...');
    
    client.initialize().catch((err) => {
        emitLog('error', `❌ Error al inicializar cliente: ${err.message}`);
        console.error('Error completo:', err);
        isClientReady = false;
        
        if (initTimeout) clearTimeout(initTimeout);
        
        // Si es error de sesión corrupta, limpiar y reintentar
        if (err.message.includes('detached') || 
            err.message.includes('SESSION') || 
            err.message.includes('already running') || 
            err.message.includes('Target closed')) {
            
            emitLog('info', '🔄 Reintentando con nueva sesión en 5 segundos...');
            
            const sessionPath = path.join(__dirname, 'wwebjs_auth', sessionId);
            if (fs.existsSync(sessionPath)) {
                try {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    emitLog('info', '🗑️ Sesión corrupta eliminada');
                } catch (e) {
                    emitLog('warning', '⚠️ No se pudo eliminar sesión corrupta');
                }
            }
            
            setTimeout(() => {
                if (connectedSocket) {
                    connectedSocket.emit('retry-init');
                }
                initializeWhatsAppClient();
            }, 5000);
        }
    });
    
    // Timeout de 180 segundos
    initTimeout = setTimeout(() => {
        if (!isClientReady && client) {
            emitLog('error', '⏱️ Timeout: Cliente no respondió en 180 segundos');
            emitLog('warning', '💡 Tip: Verifica que Chrome esté instalado y accesible');
            client.destroy().catch(() => {});
        }
    }, 180000);
};

// Inicializar cliente de WhatsApp
const initializeWhatsAppClient = async () => {
    if (client && isClientReady) {
        emitLog('warning', '⚠️ Cliente ya está activo.');
        return;
    }

    if (client) {
        emitLog('info', '🗑️ Destruyendo cliente anterior...');
        try {
            await client.destroy();
            client = null;
            isClientReady = false;
        } catch (error) {
            emitLog('warning', `⚠️ Error al destruir cliente: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    cleanupCorruptedSession();
    createNewClient();
};

// Conexión de Socket.io
io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado via WebSocket:', socket.id);
    connectedSocket = socket;

    socket.emit('status', {
        isReady: isClientReady,
        message: isClientReady ? 'Conectado a WhatsApp' : 'Esperando conexión...'
    });

    socket.on('init-client', () => {
        emitLog('info', '🔄 Inicializando cliente de WhatsApp...');
        initializeWhatsAppClient().catch(err => {
            emitLog('error', `❌ Error en inicialización: ${err.message}`);
        });
    });

    socket.on('logout', async () => {
        try {
            if (client) {
                await client.logout();
                isClientReady = false;
                emitLog('info', '👋 Sesión cerrada correctamente.');
                socket.emit('logged-out');
            }
        } catch (error) {
            emitLog('error', `❌ Error al cerrar sesión: ${error.message}`);
        }
    });

    socket.on('send-poll', async (data) => {
        const { title, options, groupNames } = data;

        if (!isClientReady || !client) {
            emitLog('error', '❌ Cliente no está listo. Escanea el código QR primero.');
            socket.emit('poll-result', {
                success: false,
                message: 'Cliente no conectado'
            });
            return;
        }

        if (!title || !options || options.length < 2) {
            emitLog('error', '❌ La encuesta debe tener título y al menos 2 opciones.');
            socket.emit('poll-result', {
                success: false,
                message: 'Datos de encuesta inválidos'
            });
            return;
        }

        if (!groupNames || groupNames.trim() === '') {
            emitLog('error', '❌ Debes especificar al menos un grupo de destino.');
            socket.emit('poll-result', {
                success: false,
                message: 'No se especificaron grupos'
            });
            return;
        }

        const targetGroups = groupNames
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        emitLog('info', `📤 Iniciando envío de encuesta a ${targetGroups.length} grupo(s)...`);

        try {
            const chats = await client.getChats();
            const groups = chats.filter(chat => chat.isGroup);

            emitLog('info', `📊 Se encontraron ${groups.length} grupos en tu cuenta.`);

            let successCount = 0;
            let failCount = 0;

            for (const targetName of targetGroups) {
                try {
                    const targetGroup = groups.find(
                        group => group.name === targetName
                    );

                    if (!targetGroup) {
                        emitLog('error', `❌ Grupo no encontrado: "${targetName}"`);
                        failCount++;
                        continue;
                    }

                    const poll = new Poll(title, options, {
                        allowMultipleAnswers: false
                    });

                    await targetGroup.sendMessage(poll);

                    emitLog('success', `✅ Enviado a: "${targetName}"`);
                    successCount++;

                    await new Promise(resolve => setTimeout(resolve, 1000));

                } catch (groupError) {
                    emitLog('error', `❌ Error al enviar a "${targetName}": ${groupError.message}`);
                    failCount++;
                }
            }

            const resultMessage = `✅ Envío completado. Éxitos: ${successCount}, Fallos: ${failCount}`;
            emitLog('info', resultMessage);

            socket.emit('poll-result', {
                success: true,
                message: resultMessage,
                stats: { successCount, failCount }
            });

        } catch (error) {
            emitLog('error', `❌ Error general: ${error.message}`);
            socket.emit('poll-result', {
                success: false,
                message: error.message
            });
        }
    });

    socket.on('get-groups', async () => {
        if (!isClientReady || !client) {
            emitLog('error', '❌ Cliente no está listo.');
            socket.emit('groups-list', { success: false, groups: [] });
            return;
        }

        try {
            const chats = await client.getChats();
            const groups = chats
                .filter(chat => chat.isGroup)
                .map(group => ({
                    id: group.id._serialized,
                    name: group.name
                }));

            emitLog('info', `📊 Se encontraron ${groups.length} grupos.`);
            socket.emit('groups-list', { success: true, groups });
        } catch (error) {
            emitLog('error', `❌ Error al obtener grupos: ${error.message}`);
            socket.emit('groups-list', { success: false, groups: [] });
        }
    });

    socket.on('disconnect', () => {
        console.log('🔌 Cliente WebSocket desconectado:', socket.id);
        if (connectedSocket?.id === socket.id) {
            connectedSocket = null;
        }
    });
});

// Endpoint de salud
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        whatsappReady: isClientReady,
        timestamp: new Date().toISOString()
    });
});

// Puerto del servidor
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║     WhatsApp Poll Sender - Backend Server v1.1            ║
║     Servidor corriendo en: http://localhost:${PORT}          ║
╚═══════════════════════════════════════════════════════════╝
    `);
    
    // ⚠️ INICIALIZACIÓN AUTOMÁTICA AL ARRANCAR EL SERVIDOR
    console.log('🚀 Inicializando cliente de WhatsApp automáticamente...\n');
    setTimeout(() => {
        initializeWhatsAppClient().catch(err => {
            console.error('❌ Error en inicialización automática:', err.message);
        });
    }, 2000); // Esperar 2 segundos para que el servidor esté completamente listo
});

// Manejo de señales de terminación
process.on('SIGINT', async () => {
    console.log('\n👋 Cerrando servidor...');
    if (client) {
        await client.destroy();
    }
    await killChromeProcesses();
    process.exit(0);
});
