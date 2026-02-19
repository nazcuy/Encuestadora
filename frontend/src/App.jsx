/**
 * WhatsApp Poll Sender - Frontend App (CORREGIDO)
 * Stack: React + Vite + TailwindCSS + Socket.io-client + qrcode.react
 */

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

// URL del backend
const BACKEND_URL = 'http://localhost:3001';

function App() {
  // Estados de conexión
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWhatsAppReady, setIsWhatsAppReady] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  // Estados del formulario
  const [pollTitle, setPollTitle] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [groupNames, setGroupNames] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Estados de logs y grupos
  const [logs, setLogs] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [showGroups, setShowGroups] = useState(false);

  const logsEndRef = useRef(null);

  // Scroll automático en logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Conexión con Socket.io
  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      addLog('info', '✅ Conectado al servidor backend.');
      
      // ⚠️ AUTO-INICIALIZAR CLIENTE AL CONECTARSE
      setTimeout(() => {
        addLog('info', '🚀 Iniciando conexión con WhatsApp...');
        newSocket.emit('init-client');
      }, 1000);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setIsWhatsAppReady(false);
      addLog('warning', '⚠️ Desconectado del servidor.');
    });

    newSocket.on('status', (data) => {
      setIsWhatsAppReady(data.isReady);
      if (data.isReady) {
        setQrCode(null);
      }
    });

    newSocket.on('qr', (qr) => {
      setQrCode(qr);
      setIsWhatsAppReady(false);
      addLog('info', '📱 Código QR recibido. Escanea con WhatsApp.');
    });

    newSocket.on('ready', () => {
      setIsWhatsAppReady(true);
      setQrCode(null);
      addLog('success', '✅ WhatsApp conectado y listo para enviar encuestas!');
    });

    newSocket.on('disconnected', (data) => {
      setIsWhatsAppReady(false);
      addLog('warning', `⚠️ WhatsApp desconectado: ${data.reason}`);
    });

    newSocket.on('logged-out', () => {
      setIsWhatsAppReady(false);
      setQrCode(null);
      addLog('info', '👋 Sesión de WhatsApp cerrada.');
    });

    newSocket.on('log', (logEntry) => {
      setLogs((prev) => [...prev, logEntry]);
    });

    newSocket.on('poll-result', (result) => {
      setIsSending(false);
      if (result.success) {
        addLog('success', result.message);
      } else {
        addLog('error', result.message);
      }
    });

    newSocket.on('groups-list', (data) => {
      if (data.success) {
        setAvailableGroups(data.groups);
        setShowGroups(true);
      }
    });

    newSocket.on('loading', (data) => {
      addLog('info', `📊 WhatsApp cargando: ${data.percent}% - ${data.message}`);
    });

    newSocket.on('retry-init', () => {
      addLog('info', '🔄 Reintentando conexión automáticamente...');
      setTimeout(() => {
        if (newSocket.connected) {
          newSocket.emit('init-client');
        }
      }, 1000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Función para agregar logs locales
  const addLog = (type, message) => {
    setLogs((prev) => [
      ...prev,
      {
        type,
        message,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  // Inicializar cliente de WhatsApp (manual)
  const handleInitClient = () => {
    if (socket) {
      setQrCode(null);
      addLog('info', '🔄 Reiniciando conexión con WhatsApp...');
      socket.emit('init-client');
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    if (socket) {
      socket.emit('logout');
    }
  };

  // Obtener lista de grupos
  const handleGetGroups = () => {
    if (socket && isWhatsAppReady) {
      socket.emit('get-groups');
    }
  };

  // Agregar opción de encuesta
  const addOption = () => {
    if (pollOptions.length < 12) {
      setPollOptions([...pollOptions, '']);
    }
  };

  // Eliminar opción de encuesta
  const removeOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  // Actualizar opción
  const updateOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // Enviar encuesta
  const handleSendPoll = () => {
    if (!socket || !isWhatsAppReady) {
      addLog('error', '❌ WhatsApp no está conectado.');
      return;
    }

    const validOptions = pollOptions.filter((opt) => opt.trim() !== '');

    if (!pollTitle.trim()) {
      addLog('error', '❌ El título de la encuesta es requerido.');
      return;
    }

    if (validOptions.length < 2) {
      addLog('error', '❌ Se requieren al menos 2 opciones válidas.');
      return;
    }

    if (!groupNames.trim()) {
      addLog('error', '❌ Debes especificar al menos un grupo.');
      return;
    }

    setIsSending(true);
    socket.emit('send-poll', {
      title: pollTitle.trim(),
      options: validOptions,
      groupNames: groupNames.trim()
    });
  };

  // Seleccionar grupo de la lista
  const selectGroup = (groupName) => {
    const currentGroups = groupNames.trim();
    if (currentGroups) {
      setGroupNames(`${currentGroups}, ${groupName}`);
    } else {
      setGroupNames(groupName);
    }
  };

  // Obtener color del log según tipo
  const getLogColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  // Obtener icono del log
  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">WhatsApp Poll Sender</h1>
                <p className="text-sm text-gray-400">Envía encuestas a múltiples grupos</p>
              </div>
            </div>
            
            {/* Indicador de estado mejorado */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                {isConnected ? (
                  isWhatsAppReady ? '✅ WhatsApp Listo' : '⏳ Conectando WhatsApp...'
                ) : '❌ Sin conexión'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Panel izquierdo - Estado y Logs */}
          <div className="space-y-6">
            {/* Estado de WhatsApp */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Estado de WhatsApp
              </h2>

              {!isWhatsAppReady && !qrCode && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-full mb-4">
                    <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-300 mb-4">Iniciando WhatsApp...</p>
                  <p className="text-sm text-gray-500">Esto puede tardar 30-60 segundos</p>
                </div>
              )}

              {qrCode && !isWhatsAppReady && (
                <div className="text-center">
                  <p className="text-gray-300 mb-4">Escanea este código QR con WhatsApp</p>
                  <div className="inline-block p-4 bg-white rounded-xl">
                    <QRCodeSVG value={qrCode} size={256} />
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-400">1. Abre WhatsApp en tu teléfono</p>
                    <p className="text-sm text-gray-400">2. Ve a Configuración → Dispositivos vinculados</p>
                    <p className="text-sm text-gray-400">3. Toca "Vincular un dispositivo"</p>
                    <p className="text-sm text-gray-400">4. Escanea este código QR</p>
                  </div>
                  <button
                    onClick={handleInitClient}
                    className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    🔄 Regenerar QR
                  </button>
                </div>
              )}

              {isWhatsAppReady && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold text-green-400 mb-2">
                    WhatsApp conectado correctamente
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleGetGroups}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                    >
                      📋 Ver mis grupos
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                    >
                      🚪 Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal de grupos disponibles */}
            {showGroups && (
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">📋 Grupos disponibles ({availableGroups.length})</h2>
                  <button
                    onClick={() => setShowGroups(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availableGroups.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No se encontraron grupos</p>
                  ) : (
                    availableGroups.map((group, index) => (
                      <button
                        key={index}
                        onClick={() => selectGroup(group.name)}
                        className="w-full text-left px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                      >
                        👥 {group.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Logs en tiempo real */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Logs en tiempo real
              </h2>
              <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <p className="text-gray-500">Esperando eventos...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 mb-2">
                      <span className={`${getLogColor(log.type)} font-bold`}>
                        [{getLogIcon(log.type)}]
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={getLogColor(log.type)}>{log.message}</span>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
              {logs.length > 0 && (
                <button
                  onClick={() => setLogs([])}
                  className="mt-3 text-sm text-gray-400 hover:text-white"
                >
                  🗑️ Limpiar logs
                </button>
              )}
            </div>
          </div>

          {/* Panel derecho - Formulario de encuesta */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Configuración de Encuesta
            </h2>

            <div className="space-y-6">
              {/* Título de la encuesta */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título de la encuesta
                </label>
                <input
                  type="text"
                  value={pollTitle}
                  onChange={(e) => setPollTitle(e.target.value)}
                  placeholder="Ej: ¿Qué día prefieren para la reunión?"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Opciones de la encuesta */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Opciones de respuesta (mín. 2, máx. 12)
                </label>
                <div className="space-y-3">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Opción ${index + 1}`}
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pollOptions.length < 12 && (
                  <button
                    onClick={addOption}
                    className="mt-3 text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar opción
                  </button>
                )}
              </div>

              {/* Grupos de destino */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Grupos de destino (separados por coma)
                </label>
                <textarea
                  value={groupNames}
                  onChange={(e) => setGroupNames(e.target.value)}
                  placeholder="Ej: Familia, Trabajo, Amigos del gym"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Escribe los nombres exactos de los grupos tal como aparecen en WhatsApp
                </p>
              </div>

              {/* Botón de envío */}
              <button
                onClick={handleSendPoll}
                disabled={!isWhatsAppReady || isSending}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                  isWhatsAppReady && !isSending
                    ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {isSending ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Enviar Encuesta
                  </>
                )}
              </button>

              {!isWhatsAppReady && (
                <p className="text-center text-yellow-400 text-sm">
                  ⚠️ Conecta WhatsApp primero para enviar encuestas
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-6">
        WhatsApp Poll Sender v1.1 | Desarrollado con Node.js + React
      </footer>
    </div>
  );
}

export default App;
