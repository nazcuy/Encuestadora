# 📊 PollSender

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

## Automatiza el envío de encuestas a múltiples grupos de app de mensajería.

[Demo](#-demo) • [Características](#-características-principales) • [Instalación](#-instalación) • [Tecnologías](#️-tecnologías)
---

</div>

## 🎯 Descripción

**PollSender** es una solución robusta *Full-Stack* diseñada para transformar la comunicación unidireccional en una herramienta de gestión de datos y toma de decisiones en tiempo real. Aunque es versátil para diversos sectores, su arquitectura está optimizada para entornos de **Seguridad e Higiene (SySO)** y **Recursos Humanos**, donde la verificación de la formación y el cumplimiento de normas es crítica.

La aplicación permite a técnicos y coordinadores desplegar encuestas dinámicas a múltiples grupos operativos de forma simultánea, eliminando la carga administrativa del envío manual y centralizando el monitoreo del proceso mediante WebSockets para una trazabilidad total.



### ¿Por qué utilizar esta herramienta?

* **Validación de Formación SySO:** Ideal para realizar exámenes rápidos o "charlas de 5 minutos" digitales, asegurando que el personal operativo ha comprendido los riesgos de su sector.
* **Eficiencia en Terreno:** Permite a los técnicos obtener feedback inmediato de sectores específicos (como Maquinistas o personal de Mantenimiento) sin necesidad de traslados físicos.
* **Monitoreo en Tiempo Real:** Gracias a la integración con **Socket.io**, el usuario recibe un flujo constante de logs que confirman el éxito de cada envío, garantizando que nadie quede fuera de la capacitación.
* **Privacidad Corporativa:** Al utilizar una instancia local de **Puppeteer**, la sesión de la app de mensajería y los datos de los grupos permanecen exclusivamente en la infraestructura del usuario, cumpliendo con estándares de confidencialidad.
* **Interfaz Profesional:** Diseñada con **TailwindCSS** para ofrecer una experiencia de usuario (UX) moderna, intuitiva y completamente responsive.

### Características Principales

-  **Conexión directa con app de mensajería** mediante QR
-  **Creación de encuestas personalizadas** (hasta 12 opciones)
-  **Envío masivo** a múltiples grupos simultáneamente
-  **Vista previa de grupos** disponibles en tiempo real
-  **Logs en tiempo real** del proceso de envío
-  **Interfaz moderna** y responsive con TailwindCSS
-  **Sesión persistente** - no requiere escanear QR cada vez
-  **Comunicación en tiempo real** con WebSockets

### Principales Casos de Uso

⛑️ Seguridad y Salud Ocupacional (SySO)
Es el uso principal para técnicos y licenciados que necesitan verificar el conocimiento en planta:

- Validación de Formación: Realizar exámenes rápidos después de charlas de 5 minutos para asegurar la comprensión de riesgos.
- Control de EPP: Consultar el estado de los Elementos de Protección Personal de forma masiva (ej. "¿Tu casco se encuentra en condiciones?").
- Detección de Riesgos: Encuestas para identificar condiciones inseguras reportadas por los propios operarios en sus sectores.
- Eventos y Capacitaciones: Gestión de asistencia para jornadas de formación externa o simulacros de evacuación.

🏢 Gestión Corporativa y RRHH

- Clima Laboral: Medir el "pulso" de la empresa mediante consultas anónimas y rápidas sobre el ambiente de trabajo.
- Coordinación de Turnos: Organizar rotaciones o disponibilidad horaria de equipos de mantenimiento y operativos.
- Comunicación Interna: Confirmación de lectura de avisos importantes o cambios en las políticas de la empresa.



## 📸 Demo

### Conexión y QR
- Escanea el código QR con tu app de mensajería para vincular la sesión

![QR Connection](/screenshots/QRconnection.png)

### Panel Principal
- Vista previa de grupos disponibles y logs en tiempo real

![PollSender Dashboard](/screenshots/dashboard.png)

### Envío de Encuestas
- Envío de encuesta a múltiples grupos con un solo clic

![Encuesta Enviada](/screenshots/encuestaEnviadaFront.png)

- Pantalla de app de mensajería mostrando la encuesta enviada al grupo

![Encuesta Enviada - pantalla app de mensajería](/screenshots/encuestaEnviada.png)


## 🛠️ Tecnologías

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **Socket.io** - Comunicación bidireccional en tiempo real
- **whatsapp-web.js** - Interacción con app de mensajería Web
- **Puppeteer** - Automatización de navegador headless
- **CORS** - Manejo de peticiones cross-origin

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Build tool y dev server ultrarrápido
- **TailwindCSS** - Framework CSS utility-first
- **Socket.io-client** - Cliente WebSocket
- **qrcode.react** - Generación de códigos QR

### DevOps & Tools
- **Nodemon** - Auto-restart del servidor en desarrollo
- **Git** - Control de versiones
- **npm** - Gestor de paquetes

## 🚀 Instalación

### Prerrequisitos

```bash
node >= 18.0.0
npm >= 9.0.0
Google Chrome instalado
```

### 1. Clonar el repositorio

```bash
git clone https://github.com/nazcuy/Encuestadora.git
cd Encuestadora
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

### 4. Configurar variables de entorno (opcional)

```bash
# backend/.env
PORT=3001
CHROME_PATH=/ruta/a/chrome  # Solo si Chrome no está en ruta por defecto
```

### 5. Iniciar la aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Acceder a la aplicación:**
```
http://localhost:5173
```

## 📖 Uso

### Primer Uso - Vincular app de mensajería

1. Inicia el backend y frontend
2. Espera 30-60 segundos a que aparezca el código QR
3. Abre la app de mensajería en tu teléfono
4. Ve a **Configuración → Dispositivos vinculados**
5. Toca **"Vincular un dispositivo"**
6. Escanea el código QR mostrado en pantalla

### Crear y Enviar una Encuesta

1. **Título:** Escribe el título de tu encuesta
   ```
   Ejemplo: "¿Cuál es el procedimiento correcto si detectás que tu casco está dañado antes de empezar la jornada?"
   ```

2. **Opciones:** Agrega entre 2 y 12 opciones
   ```
   Ejemplo: "Lo sigo usando igual y aviso al finalizar el turno.", "Solicito el recambio inmediato antes de iniciar.", "Intento repararlo con cinta o pegamento para poder trabajar."
   ```

3. **Grupos:** Especifica los grupos destino (separados por coma)
   ```
   Ejemplo: "Operadores, Personal de Depósito, Mantenimiento Mecánico"
   ```

4. **Enviar:** Haz clic en el botón "Enviar Encuesta"

5. **Monitor:** Observa los logs en tiempo real del proceso de envío

## 🏗️ Arquitectura

```
┌─────────────┐         WebSocket          ┌─────────────┐
│             │◄──────────────────────────►│             │
│   Frontend  │         Socket.io          │   Backend   │
│   (React)   │                            │  (Node.js)  │
│             │         HTTP/REST          │             │
│             │◄──────────────────────────►│             │
└─────────────┘                            └──────┬──────┘
                                                  │
                                                  │ Puppeteer
                                                  │
                                           ┌──────▼───────────────┐
                                           │                      │
                                           │  App de mensajería   │
                                           │     Web              │
                                           │                      │
                                           └──────────────────────┘
```

### Flujo de Datos

1. **Usuario** crea encuesta en la interfaz React
2. **Frontend** emite evento Socket.io al backend
3. **Backend** recibe solicitud y procesa con whatsapp-web.js
4. **Puppeteer** controla instancia de Chrome con aplicación de mensajería Web
5. **Backend** envía encuesta a cada grupo especificado
6. **Logs en tiempo real** se envían al frontend vía WebSocket
7. **Frontend** muestra progreso y resultados al usuario

## 📁 Estructura del Proyecto

```
Encuestadora/
├── backend/
│   ├── server.js              # Servidor principal
│   ├── package.json           # Dependencias backend
│   ├── cleanup.js             # Script de limpieza
│   ├── limpieza-total.bat     # Limpieza Windows
│   └── nodemon.json           # Config Nodemon
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Componente principal
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Estilos globales
│   ├── package.json           # Dependencias frontend
│   └── vite.config.js         # Config Vite
└── README.md
```

## 🔧 Scripts Disponibles

### Backend
```bash
npm start       # Iniciar servidor en producción
npm run dev     # Iniciar servidor en desarrollo con auto-reload
```

### Frontend
```bash
npm run dev     # Iniciar dev server
npm run build   # Build para producción
npm run preview # Preview del build
```

### Utilidades (Windows)
```bash
limpieza-total.bat      # Limpieza completa del sistema
free-port-3001.bat      # Liberar puerto 3001
check-status.bat        # Verificar estado del sistema
```

## ⚙️ Configuración Avanzada

### Cambiar Puerto del Backend

```javascript
// backend/server.js (línea 446)
const PORT = process.env.PORT || 3001;  // Cambiar 3001 por el puerto deseado
```

### Modo Headless de Chrome

```javascript
// backend/server.js (línea 118)
puppeteer: {
    headless: false,  // true = invisible, false = visible
    // ...
}
```

### Timeout de Inicialización

```javascript
// backend/server.js (línea 252)
setTimeout(() => {
    // ...
}, 180000);  // 180 segundos = 3 minutos
```

## 🐛 Solución de Problemas

### Puerto 3001 en uso

```bash
# Windows
netstat -ano | findstr :3001
taskkill /F /PID <PID>

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

### Cliente no se conecta

1. Ejecutar `limpieza-total.bat`
2. Verificar que Chrome esté instalado
3. Eliminar carpeta `wwebjs_auth`
4. Reiniciar el servidor

### QR no aparece

1. Cambiar `headless: false` en server.js
2. Verificar logs del backend
3. Esperar 60 segundos completos


## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/Feature`)
3. Commit tus cambios (`git commit -m 'Add: Feature'`)
4. Push a la rama (`git push origin feature/Feature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**[Nicolás Azcuy]**

- LinkedIn: [nicolas-azcuy-prog](www.linkedin.com/in/nicolas-azcuy-prog)
- GitHub: [@nazcuy](https://github.com/nazcuy)
- Email: nico.azcuy@gmail.com

---

<div align="center">

### ⭐ Si este proyecto te fue útil, considera darle una estrella

</div>

## 🙏 Agradecimientos

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - Biblioteca principal para interactuar con app de mensajería Web
- [Puppeteer](https://pptr.dev/) - Automatización de navegador
- [Socket.io](https://socket.io/) - Comunicación en tiempo real
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS

---

## 🔐 Seguridad y Privacidad

- ✅ No almacenamos tus mensajes
- ✅ Las sesiones son locales en tu máquina
- ✅ No hay servidor externo que procese tus datos
- ✅ Código 100% open source para auditoría
- ⚠️ Usa bajo tu propia responsabilidad
- ⚠️ Cumple con los términos de servicio de WhatsApp



---

<div align="center">


**⚡ Stack Principal:** Node.js • React • Socket.io • Puppeteer

**🛠️ Ecosistema:** Express • TailwindCSS • Vite

</div>
