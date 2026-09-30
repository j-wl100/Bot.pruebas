const { Telegraf } = require('telegraf');

// 1. Pega tu token de BotFather aquí
const bot = new Telegraf('8766864367:AAEXy5d7hW-tvc38aoX3iwVUFjEUnb8xQQA');

// Bases de datos en memoria para el sistema operativo
const usuariosDB = {};
const antispamDB = {};      // Control de velocidad y cantidad de mensajes seguidos
const advertenciasDB = {};  // Registro de strikes por usuario

// Lista negra corporativa / palabras prohibidas
const palabrasProhibidas = ['spam', 'porno', 'nsfw', '18+', 'scam', 'phishing', 't.me/joinchat'];

function obtenerPerfil(ctx) {
    const userId = ctx.from.id;
    const nombre = ctx.from.first_name || 'Agente';
    
    if (!usuariosDB[userId]) {
        usuariosDB[userId] = {
            nombre: nombre,
            creditos: 100,
            clearanceLevel: 1,
            experiencia: 0
        };
    }
    return usuariosDB[userId];
}

// ==========================================
// 🛡️ NÚCLEO DE PROTECCIÓN AVANZADA & FLOOD
// ==========================================
bot.on('message', async (ctx, next) => {
    if (!ctx.chat || ctx.chat.type === 'private') return next();
    if (!ctx.from) return next();

    const userId = ctx.from.id;
    const mensajeTexto = ctx.message.text || ctx.message.caption || '';
    const ahora = Date.now();

    try {
        // Verificación de credenciales (Inmunidad total para Propietario / Admins)
        const miembroChat = await ctx.telegram.getChatMember(ctx.chat.id, userId);
        const esAdminOPropietario = miembroChat.status === 'creator' || miembroChat.status === 'administrator';

        if (esAdminOPropietario) {
            return next(); // Acceso libre autorizado para administración
        }

        // 1. Análisis de Contenido / Palabras Prohibidas
        const textoMinuscula = mensajeTexto.toLowerCase();
        const contieneProhibida = palabrasProhibidas.some(palabra => textoMinuscula.includes(palabra));

        if (contieneProhibida) {
            await ctx.deleteMessage().catch(() => {});
            if (!advertenciasDB[userId]) advertenciasDB[userId] = 0;
            advertenciasDB[userId] += 1;
            
            if (advertenciasDB[userId] >= 3) {
                const unHourLater = Math.floor(Date.now() / 1000) + 3600;
                await ctx.restrictChatMember(userId, { until_date: unHourLater, permissions: { can_send_messages: false } }).catch(() => {});
                ctx.reply(`[SYS_WARN] Agente ${ctx.from.first_name} neutralizado temporalmente (1h) por infracción crítica de protocolo.`);
                advertenciasDB[userId] = 0;
            } else {
                ctx.reply(`[SYS_ALERT] Contenido prohibido detectado de ${ctx.from.first_name}. Advertencia [${advertenciasDB[userId]}/3].`);
            }
            return;
        }

        // 2. Sistema Antispam / Flood Dinámico (3 msgs = Warn | 5-7 msgs rápidos = Eliminación/Purga)
        if (!antispamDB[userId]) {
            antispamDB[userId] = { count: 0, timestamps: [] };
        }

        // Limpiar registros antiguos (mayores a 5 segundos)
        antispamDB[userId].timestamps = antispamDB[userId].timestamps.filter(t => ahora - t < 5000);
        antispamDB[userId].timestamps.push(ahora);

        const totalRecientes = antispamDB[userId].timestamps.length;

        // Si manda entre 5 y 7 mensajes seguidos en menos de 5 segundos: PURGA / ELIMINACIÓN
        if (totalRecientes >= 5) {
            await ctx.deleteMessage().catch(() => {});
            
            if (!advertenciasDB[userId]) advertenciasDB[userId] = 0;
            advertenciasDB[userId] += 2; // Sanción doble por saturación masiva

            ctx.reply(`[SYS_SECURITY_PURGE] Actividad de flood masivo detectada de ${ctx.from.first_name}. Mensaje eliminado y sanción aplicada.`);
            
            // Si llega a acumular muchas faltas por flood, castigo severo de silencio
            if (advertenciasDB[userId] >= 5) {
                const muteTime = Math.floor(Date.now() / 1000) + 7200; // 2 horas
                await ctx.restrictChatMember(userId, { until_date: muteTime, permissions: { can_send_messages: false } }).catch(() => {});
                ctx.reply(`[SYS_LOCKDOWN] El nodo ${ctx.from.first_name} ha excedido los límites de flujo. Silenciado por 2 horas.`);
                advertenciasDB[userId] = 0;
            }
            return;
        }

        // Si manda 3 mensajes seguidos rápido pero sin llegar a 5: Advertencia de flujo
        if (totalRecientes === 3) {
            await ctx.deleteMessage().catch(() => {});
            ctx.reply(`[SYS_THROTTLE] Advertencia de flujo para ${ctx.from.first_name}: Reduzca la velocidad de transmisión.`);
            return;
        }

    } catch (e) {
        console.error('[ERROR_CRITICAL_SECURITY]', e);
    }

    return next();
});

// ==========================================
// ⚡ INTERFAZ DE COMANDOS (CONNOR OS)
// ==========================================

bot.start((ctx) => {
    ctx.reply('⟨ ☩ ⟩ ZENITH // CONNOR OS v5.0\n' +
              '──────────────────────────────\n' +
              'ESTADO: Red central activa.\n' +
              'PROTOCOLO DE SEGURIDAD: Blindado.\n' +
              'DIRECTORIO: Ejecute /menu para acceder.');
});

bot.command('menu', (ctx) => {
    ctx.reply('⟨ ☩ ⟩ ZENITH // PANEL DE CONTROL PRINCIPAL\n' +
              '──────────────────────────────\n' +
              ' [PERFIL Y DATOS]\n' +
              ' /perfil - Consulta de estatus y créditos\n' +
              ' /sincronizar - Reclamación de asignación diaria\n' +
              ' /asignar [monto] - Protocolo de transferencia de riesgo\n\n' +
              ' [COMANDOS CREATIVOS / AVANZADOS]\n' +
              ' /ciberclima [ciudad] - Diagnóstico meteorológico avanzado\n' +
              ' /escanear [objetivo] - Análisis biométrico simulado de usuario\n' +
              ' /frecuencia - Generador de ruido blanco / ondas alfa virtuales\n' +
              ' /analizar [término] - Búsqueda en base de datos multimedia\n' +
              ' /sistema - Métricas de rendimiento del servidor\n\n' +
              ' [SEGURIDAD Y ADMINISTRACIÓN]\n' +
              ' /modo_admin - Panel de control de privilegios y estado\n' +
              ' /bloquear - Restricción temporal de canales de texto\n' +
              ' /desbloquear - Restauración de permisos de transmisión');
});

// Perfil de Usuario
bot.command('perfil', (ctx) => {
    const p = obtenerPerfil(ctx);
    ctx.reply(`⟨ ☩ ⟩ REPORTE DE IDENTIDAD\n` +
              `──────────────────────────────\n` +
              `SUJET: ${p.nombre}\n` +
              `CLEARANCE: Nivel ${p.clearanceLevel}\n` +
              `CREDITS: ${p.creditos} Z-C\n` +
              `STATUS: Sincronizado`);
});

// Reclamar créditos diarios
bot.command('sincronizar', (ctx) => {
    const p = obtenerPerfil(ctx);
    p.creditos += 75;
    ctx.reply(`⟨ ☩ ⟩ SINCRONIZACIÓN EXITOSA\nAsignación diaria procesada: +75 Z-C.\nBalance actual: ${p.creditos} Z-C.`);
});

// Sistema de riesgo con créditos
bot.command('asignar', (ctx) => {
    const p = obtenerPerfil(ctx);
    const args = ctx.message.text.split(' ');
    const monto = parseInt(args[1]);

    if (isNaN(monto) || monto <= 0) {
        return ctx.reply('[SYS_SYNTAX] Uso incorrecto. Sintaxis: /asignar [monto]');
    }
    if (p.creditos < monto) {
        return ctx.reply(`[SYS_DENIED] Fondos insuficientes. Balance actual: ${p.creditos} Z-C.`);
    }

    const evaluacion = Math.random() < 0.48;
    if (evaluacion) {
        p.creditos += monto;
        ctx.reply(`[SYS_SUCCESS] Operación completada.\nResultado: POSITIVO (+${monto} Z-C)\nBalance: ${p.creditos} Z-C`);
    } else {
        p.creditos -= monto;
        ctx.reply(`[SYS_FAILED] Operación completada.\nResultado: NEGATIVO (-${monto} Z-C)\nBalance: ${p.creditos} Z-C`);
    }
});

// ==========================================
// 🧪 COMANDOS CREATIVOS Y DIFERENTES
// ==========================================

// 1. Ciberclima (Clima con estética de sistema cibernético)
bot.command('ciberclima', async (ctx) => {
    const ciudad = ctx.message.text.replace('/ciberclima', '').trim();
    if (!ciudad) return ctx.reply('[SYS_ERROR] Ubicación no especificada. Sintaxis: /ciberclima [ubicación]');
    try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(ciudad)}?format=3&lang=es`);
        const text = await res.text();
        ctx.reply(`⟨ ☩ ⟩ ANÁLISIS METEOROLÓGICO SECTOR: ${ciudad.toUpperCase()}\n` +
                  `──────────────────────────────\n` +
                  `${text}\n` +
                  `[ANÁLISIS]: Parámetros atmosféricos dentro de rangos estables.`);
    } catch (e) {
        ctx.reply('[SYS_ERROR] Fallo en la conexión con los satélites meteorológicos.');
    }
});

// 2. Escaneo Biométrico Simulado
bot.command('escanear', (ctx) => {
    const objetivo = ctx.message.reply_to_message ? ctx.message.reply_to_message.from.first_name : ctx.from.first_name;
    const estres = Math.floor(Math.random() * 100);
    const sinceridad = Math.floor(Math.random() * 100);
    const estadoMental = estres > 70 ? 'INESTABLE / ALERTA' : estres > 40 ? 'NEUTRAL / MODERADO' : 'ESTABLE / CALIBRADO';

    ctx.reply(`⟨ ☩ ⟩ ESCANEO BIOMÉTRICO // CYBER-ANALYSIS\n` +
              `──────────────────────────────\n` +
              `SUJET: ${objetivo}\n` +
              `ESTRÉS TÉRMICO: ${estres}%\n` +
              `ÍNDICE DE VERACIDAD: ${sinceridad}%\n` +
              `DIAGNÓSTICO: ${estadoMental}`);
});

// 3. Generador de Frecuencia / Ondas Virtuales
bot.command('frecuencia', (ctx) => {
    const frecuencias = [
        '432 Hz [Harmonic Resonance - Calibración neural óptima]',
        '528 Hz [DNA Repair Frequency - Enfoque y claridad mental]',
        '963 Hz [Pineal Activation - Conexión con el núcleo de red]',
        '174 Hz [Anesthetic Frequency - Reducción de ruido cognitivo]'
    ];
    const freqSeleccionada = frecuencias[Math.floor(Math.random() * frecuencias.length)];
    ctx.reply(`⟨ ☩ ⟩ EMISIÓN DE ONDAS VIRTUALES\n` +
              `──────────────────────────────\n` +
              `FRECUENCIA ACTIVA: ${freqSeleccionada}\n` +
              `ESTADO: Transmitiendo pulsos al subconsciente del nodo.`);
});

// Buscador multimedia
bot.command('analizar', (ctx) => {
    const query = ctx.message.text.replace('/analizar', '').trim();
    if (!query) return ctx.reply('[SYS_ERROR] Parámetro vacío. Sintaxis: /analizar [término]');
    const enc = encodeURIComponent(query);
    ctx.reply(`⟨ ☩ ⟩ ANÁLISIS DE RED: ${query}\n\n[YOUTUBE]: https://www.youtube.com/results?search_query=${enc}`, { parse_mode: 'Markdown' });
});

// Métricas del sistema
bot.command('sistema', (ctx) => {
    const uptimeSec = process.uptime();
    const memoriaUsada = process.memoryUsage().heapUsed / 1024 / 1024;
    ctx.reply(`⟨ ☩ ⟩ DIAGNÓSTICO DEL NÚCLEO\n` +
              `──────────────────────────────\n` +
              `HOST: Render Cloud Server\n` +
              `UPTIME: ${Math.floor(uptimeSec)}s\n` +
              `HEAP MEMORY: ${memoriaUsada.toFixed(2)} MB\n` +
              `SECURITY: Activo [Connor OS v5.0]`);
});

// ==========================================
// 🎛️ MODO ADMIN / CONTROL DE PRIVILEGIOS
// ==========================================
bot.command('modo_admin', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('[SYS_ERROR] Comando exclusivo para nodos de grupo.');
    try {
        const userId = ctx.from.id;
        const miembroChat = await ctx.telegram.getChatMember(ctx.chat.id, userId);
        const esAdminOPropietario = miembroChat.status === 'creator' || miembroChat.status === 'administrator';

        if (!esAdminOPropietario) {
            return ctx.reply('[SYS_DENIED] Acceso denegado. Este comando de diagnóstico solo responde a rangos administrativos.');
        }

        ctx.reply(`⟨ ☩ ⟩ PANEL DE CONTROL ADMINISTRATIVO\n` +
                  `──────────────────────────────\n` +
                  `ADMINISTRADOR VERIFICADO: ${ctx.from.first_name}\n` +
                  `ESTADO DE PROTECCIÓN: ACTIVO\n` +
                  `- Filtro Flood (3 msgs warn / 5-7 msgs purga): OPERATIVO\n` +
                  `- Inmunidad de Propietario/Admins: CONFIGURADA\n` +
                  `- Filtro de Palabras Clave: ACTIVO`);
    } catch (e) {
        ctx.reply('[SYS_ERROR] No se pudo verificar el rango administrativo.');
    }
});

// Administración: Bloquear Canal
bot.command('bloquear', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('[SYS_ERROR] Comando exclusivo para nodos de grupo.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, { can_send_messages: false });
        ctx.reply('⟨ ☩ ⟩ PROTOCOLO DE BLOQUEO ACTIVADO.\nCanal restringido por orden administrativa.');
    } catch (e) {
        ctx.reply('[SYS_DENIED] Se requieren privilegios de administración.');
    }
});

// Administración: Desbloquear Canal
bot.command('desbloquear', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('[SYS_ERROR] Comando exclusivo para nodos de grupo.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, {
            can_send_messages: true,
            can_send_media_messages: true,
            can_send_other_messages: true,
            can_add_web_page_previews: true
        });
        ctx.reply('⟨ ☩ ⟩ PROTOCOLO DE DESBLOQUEO ACTIVADO.\nCanal de texto operativo.');
    } catch (e) {
        ctx.reply('[SYS_DENIED] Se requieren privilegios de administración.');
    }
});

// Inicialización del sistema
bot.launch();
console.log('[SYS_BOOT] Connor OS v5.0 / Zenith Core iniciado correctamente en Render.');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
