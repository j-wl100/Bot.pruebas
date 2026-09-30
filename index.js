const { Telegraf } = require('telegraf');
const express = require('express');

// 1. Configuración robusta del Servidor Express para Render
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('⟨ ☩ ⟩ ZENITH // Connor OS Core - Active and Running.');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYS_WEB] Servidor HTTP escuchando en el puerto ${PORT}`);
});

// 2. Token de BotFather (Asegúrate de pegar tu token real aquí)
const bot = new Telegraf('8766864367:AAF6wHe3oznvIZM6A7s

HjFGy7LB4zZhCQO0');

// Bases de datos en memoria
const usuariosDB = {};
const antispamDB = {};      
const advertenciasDB = {};  

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
// 🛡️ NÚCLEO DE PROTECCIÓN BÁSICA
// ==========================================
bot.on('message', async (ctx, next) => {
    if (!ctx.chat || ctx.chat.type === 'private') return next();
    if (!ctx.from) return next();

    const userId = ctx.from.id;
    const mensajeTexto = ctx.message.text || ctx.message.caption || '';
    const ahora = Date.now();

    try {
        const textoMinuscula = mensajeTexto.toLowerCase();
        const contieneProhibida = palabrasProhibidas.some(palabra => textoMinuscula.includes(palabra));

        if (contieneProhibida) {
            await ctx.deleteMessage().catch(() => {});
            if (!advertenciasDB[userId]) advertenciasDB[userId] = 0;
            advertenciasDB[userId] += 1;
            
            ctx.reply(`[SYS_ALERT] Contenido prohibido detectado de ${ctx.from.first_name}. Advertencia [${advertenciasDB[userId]}/3].`);
            return;
        }

        if (!antispamDB[userId]) {
            antispamDB[userId] = { count: 0, timestamps: [] };
        }

        antispamDB[userId].timestamps = antispamDB[userId].timestamps.filter(t => ahora - t < 5000);
        antispamDB[userId].timestamps.push(ahora);

        if (antispamDB[userId].timestamps.length >= 5) {
            await ctx.deleteMessage().catch(() => {});
            ctx.reply(`[SYS_SECURITY_PURGE] Actividad de flood detectada de ${ctx.from.first_name}. Mensaje eliminado.`);
            return;
        }

    } catch (e) {
        console.error('[ERROR_CRITICAL_SECURITY]', e);
    }

    return next();
});

// ==========================================
// ⚡ COMANDOS (CONNOR OS)
// ==========================================

bot.start((ctx) => {
    ctx.reply('⟨ ☩ ⟩ ZENITH // CONNOR OS v5.0\n' +
              '──────────────────────────────\n' +
              'ESTADO: Red central activa y enlazada.\n' +
              'DIRECTORIO: Ejecute /menu para acceder.');
});

bot.command('menu', (ctx) => {
    ctx.reply('⟨ ☩ ⟩ ZENITH // PANEL DE CONTROL PRINCIPAL\n' +
              '──────────────────────────────\n' +
              ' [PERFIL Y DATOS]\n' +
              ' /perfil - Consulta de estatus y créditos\n' +
              ' /sincronizar - Reclamación de asignación diaria\n' +
              ' /asignar [monto] - Protocolo de transferencia de riesgo\n\n' +
              ' [COMANDOS CREATIVOS]\n' +
              ' /ciberclima [ciudad] - Diagnóstico meteorológico avanzado\n' +
              ' /escanear [objetivo] - Análisis biométrico simulado\n' +
              ' /frecuencia - Generador de ondas virtuales\n' +
              ' /analizar [término] - Búsqueda en base de datos\n' +
              ' /sistema - Métricas del servidor\n\n' +
              ' [SEGURIDAD Y ADMIN]\n' +
              ' /modo_admin - Panel de control de privilegios\n' +
              ' /bloquear y /desbloquear - Control de canal');
});

bot.command('perfil', (ctx) => {
    const p = obtenerPerfil(ctx);
    ctx.reply(`⟨ ☩ ⟩ REPORTE DE IDENTIDAD\nSUJET: ${p.nombre}\nCLEARANCE: Nivel ${p.clearanceLevel}\nCREDITS: ${p.creditos} Z-C`);
});

bot.command('sincronizar', (ctx) => {
    const p = obtenerPerfil(ctx);
    p.creditos += 75;
    ctx.reply(`⟨ ☩ ⟩ SINCRONIZACIÓN EXITOSA\nAsignación procesada: +75 Z-C.\nBalance: ${p.creditos} Z-C.`);
});

bot.command('asignar', (ctx) => {
    const p = obtenerPerfil(ctx);
    const args = ctx.message.text.split(' ');
    const monto = parseInt(args[1]);

    if (isNaN(monto) || monto <= 0) return ctx.reply('[SYS_SYNTAX] Uso: /asignar [monto]');
    if (p.creditos < monto) return ctx.reply(`[SYS_DENIED] Fondos insuficientes. Tienes ${p.creditos} Z-C.`);

    if (Math.random() < 0.48) {
        p.creditos += monto;
        ctx.reply(`[SYS_SUCCESS] Operación POSITIVA (+${monto} Z-C)\nBalance: ${p.creditos} Z-C`);
    } else {
        p.creditos -= monto;
        ctx.reply(`[SYS_FAILED] Operación NEGATIVA (-${monto} Z-C)\nBalance: ${p.creditos} Z-C`);
    }
});

bot.command('ciberclima', async (ctx) => {
    const ciudad = ctx.message.text.replace('/ciberclima', '').trim();
    if (!ciudad) return ctx.reply('[SYS_ERROR] Sintaxis: /ciberclima [ciudad]');
    try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(ciudad)}?format=3&lang=es`);
        const text = await res.text();
        ctx.reply(`⟨ ☩ ⟩ METEOROLOGÍA SECTOR: ${ciudad.toUpperCase()}\n${text}`);
    } catch (e) {
        ctx.reply('[SYS_ERROR] Fallo con los satélites meteorológicos.');
    }
});

bot.command('escanear', (ctx) => {
    const obj = ctx.message.reply_to_message ? ctx.message.reply_to_message.from.first_name : ctx.from.first_name;
    const estres = Math.floor(Math.random() * 100);
    const sinceridad = Math.floor(Math.random() * 100);
    ctx.reply(`⟨ ☩ ⟩ ESCANEO BIOMÉTRICO\nSUJET: ${obj}\nESTRÉS TÉRMICO: ${estres}%\nVERACIDAD: ${sinceridad}%`);
});

bot.command('frecuencia', (ctx) => {
    const freqs = ['432 Hz [Harmonic Resonance]', '528 Hz [DNA Repair]', '963 Hz [Pineal Activation]', '174 Hz [Noise Reduction]'];
    ctx.reply(`⟨ ☩ ⟩ FRECUENCIA ACTIVA: ${freqs[Math.floor(Math.random() * freqs.length)]}`);
});

bot.command('analizar', (ctx) => {
    const q = ctx.message.text.replace('/analizar', '').trim();
    if (!q) return ctx.reply('[SYS_ERROR] Sintaxis: /analizar [término]');
    ctx.reply(`⟨ ☩ ⟩ RED: ${q}\n🔗 https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, { parse_mode: 'Markdown' });
});

bot.command('sistema', (ctx) => {
    ctx.reply(`⟨ ☩ ⟩ NÚCLEO RENDER\nUPTIME: ${Math.floor(process.uptime())}s\nMEMORY: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);
});

bot.command('modo_admin', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('[SYS_ERROR] Solo en grupos.');
    ctx.reply(`⟨ ☩ ⟩ PANEL ADMIN\nESTADO: Operativo\nFiltro Antispam: Activo.`);
});

bot.command('bloquear', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('[SYS_ERROR] Solo en grupos.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, { can_send_messages: false });
        ctx.reply('⟨ ☩ ⟩ Canal bloqueado administrativamente.');
    } catch (e) {
        ctx.reply('[SYS_DENIED] Permisos insuficientes.');
    }
});

bot.command('desbloquear', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('[SYS_ERROR] Solo en grupos.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true });
        ctx.reply('⟨ ☩ ⟩ Canal desbloqueado.');
    } catch (e) {
        ctx.reply('[SYS_DENIED] Permisos insuficientes.');
    }
});

// Inicialización segura del bot con manejo de errores
bot.launch().then(() => {
    console.log('[SYS_BOOT] Connor OS v5.0 inicializado con éxito en Render.');
}).catch((err) => {
    console.error('[ERROR_LAUNCH]', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
