# Correcciones Aplicadas - Error "Detached Frame"

## 🔍 Problema Identificado
El error `Attempted to use detached Frame 'A921D4B5A5B999951776DDBC7EFB4849'` ocurre cuando whatsapp-web.js intenta acceder a un frame o elemento del DOM que ha sido removido de la página. Esto es común cuando:

- WhatsApp Web recarga iframes internos
- La página navega o se recarga
- Hay operaciones simultáneas que modifican el DOM
- El cliente no está completamente listo

---

## ✅ Correcciones Implementadas

### 1. **Reintentos en `get-groups`**
- Agregado sistema de reintentos (3 intentos) para obtener grupos
- Espera exponencial entre reintentos (500ms, 1s, 2s)
- Detección específica de errores de frame desvinculado
- Logging mejorado para seguimiento

### 2. **Reintentos en `send-poll`**
- Sistema robusto de reintentos para envío de encuestas
- Reintentos específicos para cada grupo (3 intentos)
- Obtención de grupos con reintentos antes de procesar
- Esperas más largas entre envíos (2s) para evitar saturación
- Mejor manejo de errores con mensajes descriptivos

### 3. **Mejoras en Configuración de Puppeteer**
- Argumentos adicionales para mejor estabilidad:
  - `--disable-background-timer-throttling`
  - `--disable-backgrounding-occluded-windows`
  - `--enable-features=NetworkService,NetworkServiceInProcess`
- Timeout aumentado a 60 segundos
- User-agent actualizado (Chrome 120)

### 4. **Verificación Mejorada de "Ready"**
- Espera adicional de 2 segundos después del evento "ready"
- Intenta obtener información del cliente para validar conexión
- Validación más rigurosa antes de marcar cliente como listo

### 5. **Control de Reintentos Inteligente**
- Diferencia entre errores de frame desvinculado y otros errores
- Solo reintenta automáticamente en casos de frames desvinculados
- Otros errores se reportan inmediatamente sin reintentos

---

## 🚀 Cómo Usar

### Iniciar el servidor
```bash
npm start
# o con nodemon para desarrollo
npm run dev
```

### Escanear código QR
El navegador se abrirá automáticamente. Escanea el código QR con WhatsApp.

### Enviar encuestas
Ahora el sistema es más robusto:
- Reintentará automáticamente si falla por frames desvinculados
- Esperará entre intentos para dar tiempo al DOM a recuperarse
- Reportará claramente qué grupos fallaron y por qué

---

## 📊 Monitoreo

El servidor emitirá mensajes como:

**Éxito:**
```
[INFO] ✅ Enviado a: "Nombre del Grupo"
```

**Reintento automático:**
```
[WARNING] ⚠️ Error de frame desvinculado en "Nombre del Grupo" (intento 1/3), reintentando...
```

**Fallo después de reintentos:**
```
[ERROR] ❌ Error al enviar a "Nombre del Grupo": Attempted to use detached Frame...
```

---

## 🔧 Optimizaciones Adicionales Recomendadas

Si aún tienes problemas, considera:

### 1. **Caché de Grupos** (próxima mejora)
```javascript
// Agregar caché de 5 minutos para no obtener grupos cada vez
const groupsCache = { data: [], timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
```

### 2. **Validar Estado Antes de Operaciones**
```javascript
// Consultar cliente.info antes de operaciones críticas
const clientState = await client.getState();
if (clientState !== 'READY') {
    throw new Error('Cliente no está en estado READY');
}
```

### 3. **Aumentar Esperas Entre Operaciones**
- Actual: 2 segundos entre envíos
- Recomendado si sigue fallando: 3-4 segundos

### 4. **Desactivar Modo "Headless"** (ayuda para debugging)
- Ya está en `headless: false` para que veas la ventana del navegador
- Esto te permite ver si WhatsApp Web está respondiendo correctamente

---

## 📝 Próximos Pasos

1. **Reinicia el servidor** con las nuevas correcciones
2. **Escanea el código QR** nuevamente (solo la primera vez)
3. **Intenta enviar una encuesta** - deberá reintentarse automáticamente si hay errores
4. **Monitorea los logs** para confirmar que usa los reintentos

---

## 📞 Debugging

Si el problema persiste, revisa:

1. **¿Está Chrome actualizado?** 
   - Ejecuta: `chrome://version` en una ventana de Chrome
   - Considera actualizar a Chrome 120+

2. **¿Hay procesos Chrome anteriores corriendo?**
   - Windows: `tasklist | findstr chrome`
   - Ejecuta: `taskkill /F /IM chrome.exe /T`

3. **¿Está WhatsApp Web accesible?**
   - Abre manualmente https://web.whatsapp.com en una ventana normal
   - Verifica que no haya notificación de sesión activa en otro lugar

4. **Aumentar verbosidad de logs**
   - El servidor ya registra todos los intentos y errores
   - Revisa la consola para patrones

---

**Versión:** Backend v1.1.1 (Con manejo robusto de frames desvinculados)
**Última actualización:** 2025-02-18
