# WhatsApp Poll Sender

Aplicación web para automatizar el envío de encuestas nativas a grupos de WhatsApp.

## Stack Tecnológico

### Backend
- Node.js + Express
- Socket.io (comunicación en tiempo real)
- whatsapp-web.js (API de WhatsApp)
- LocalAuth (persistencia de sesión)

### Frontend
- React 18 (Vite)
- TailwindCSS
- Socket.io-client
- qrcode.react

## Estructura del Proyecto

```
whatsapp-poll-sender/
├── backend/
│   ├── server.js          # Servidor principal
│   ├── package.json       # Dependencias del backend
│   └── wwebjs_auth/       # Sesión de WhatsApp (generado automáticamente)
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Componente principal
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Estilos con Tailwind
│   ├── index.html
│   ├── package.json       # Dependencias del frontend
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Instalación

### Requisitos previos
- Node.js v18+
- npm o yarn
- Google Chrome/Chromium (para whatsapp-web.js)

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Dependencias que se instalarán:
# - express (servidor HTTP)
# - cors (manejo de CORS)
# - socket.io (WebSockets)
# - whatsapp-web.js (API de WhatsApp)
# - qrcode-terminal (mostrar QR en consola)
# - nodemon (dev dependency)

# Iniciar servidor
npm start

# O en modo desarrollo con recarga automática
npm run dev
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Dependencias que se instalarán:
# - react, react-dom
# - socket.io-client
# - qrcode.react
# - tailwindcss, postcss, autoprefixer
# - vite, @vitejs/plugin-react

# Iniciar servidor de desarrollo
npm run dev
```

## Uso

1. **Inicia el backend** (puerto 3001):
   ```bash
   cd backend && npm start
   ```

2. **Inicia el frontend** (puerto 5173):
   ```bash
   cd frontend && npm run dev
   ```

3. **Abre el navegador** en `http://localhost:5173`

4. **Conecta WhatsApp**:
   - Haz clic en "Conectar WhatsApp"
   - Escanea el código QR con tu teléfono
   - Espera a que aparezca "WhatsApp conectado"

5. **Envía encuestas**:
   - Escribe el título de la encuesta
   - Agrega las opciones (mínimo 2)
   - Escribe los nombres exactos de los grupos (separados por coma)
   - Haz clic en "Enviar Encuesta"

## Características

- **Autenticación persistente**: La sesión se guarda en `wwebjs_auth/`
- **Logs en tiempo real**: Visualiza el progreso del envío
- **Manejo de errores**: El servidor no cae si un grupo falla
- **Lista de grupos**: Consulta tus grupos disponibles
- **Interfaz moderna**: UI con TailwindCSS

## Notas importantes

- Los nombres de los grupos deben ser **exactos** (case-sensitive)
- WhatsApp puede limitar el envío masivo de mensajes
- La primera conexión puede tardar unos minutos
- La sesión persiste mientras no se cierre manualmente

## Solución de problemas

### El QR no aparece
- Asegúrate de que el backend esté corriendo
- Revisa la consola del backend para errores
- Verifica que Chrome/Chromium esté instalado

### Grupo no encontrado
- Verifica que el nombre sea exactamente igual
- Usa el botón "Ver mis grupos" para confirmar nombres
- Los nombres son sensibles a mayúsculas/minúsculas

### Error de Puppeteer
```bash
# En Linux, instala las dependencias de Chrome:
sudo apt-get install -y \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 \
  libgbm1 libasound2 libpangocairo-1.0-0 libgtk-3-0
```

## Licencia

MIT License
