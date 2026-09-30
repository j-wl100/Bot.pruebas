const { Telegraf } = require('telegraf');
const express = require('express');

// 1. Configuración del Servidor Web para mantener el bot activo en la nube
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('⟨ ☩ ⟩ SERVIDOR MULTIFUNCIÓN // Bot Core - Activo y Operativo.');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYS_WEB] Servidor HTTP escuchando en el puerto ${PORT}`);
});

// 2. Token del Bot (Reemplaza con tu nuevo token de BotFather)
const bot = new Telegraf('8871233471:AAGwFEoIlKxg5IaHemqc0x2xLEJWsR63_cc');

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
            nivel: 1
        };
    }
    return usuariosDB[userId];
}

// ==========================================
// 🛡️ NÚCLEO DE PROTECCIÓN Y MODERACIÓN
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
            
            ctx.reply(`⚠️️ Contenido prohibido detectado de ${ctx.from.first_name}. Advertencia [${advertenciasDB[userId]}/3].`);
            return;
        }

        if (!antispamDB[userId]) {
            antispamDB[userId] = { count: 0, timestamps: [] };
        }

        antispamDB[userId].timestamps = antispamDB[userId].timestamps.filter(t => ahora - t < 5000);
        antispamDB[userId].timestamps.push(ahora);

        if (antispamDB[userId].timestamps.length >= 5) {
            await ctx.deleteMessage().catch(() => {});
            ctx.reply(`🚨 Actividad de flood detectada de ${ctx.from.first_name}. Mensaje purgado.`);
            return;
        }

    } catch (e) {
        console.error('[ERROR_SECURITY]', e);
    }

    return next();
});

// ==========================================
// ⚡ MENÚ Y COMANDOS GENERALES
// ==========================================

bot.start((ctx) => {
    ctx.reply('🤖 **BOT MULTIFUNCIÓN ACTIVO**\n\n' +
              'Escribe /menu para desplegar el directorio completo de comandos disponibles.');
});

bot.command('menu', (ctx) => {
    ctx.reply('📂 **DIRECTORIO DE COMANDOS**\n' +
              '──────────────────────────────\n' +
              '🛡️ **Seguridad:** /cerrar, /abrir, /advertir, /mutesec\n' +
              '🎵 **Multimedia:** /music [canción], /letra, /pelicula\n' +
              '🎮 **Entretenimiento:** /apostar, /trivia, /chiste, /oraculo\n' +
              '🛠️ **Utilidades:** /clima, /traducir, /qr, /calcular\n' +
              '👤 **Perfil:** /perfil, /diario, /transferir, /top');
});

// ==========================================
// 🛡️ 1. SEGURIDAD Y MODERACIÓN
// ==========================================

bot.command('cerrar', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Este comando solo funciona en grupos.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, { can_send_messages: false });
        ctx.reply('🔒 Chat cerrado administrativamente. Nadie puede enviar mensajes.');
    } catch (e) {
        ctx.reply('❌ Error: El bot necesita permisos de administrador para cerrar el chat.');
    }
});

bot.command('abrir', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Este comando solo funciona en grupos.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, { 
            can_send_messages: true, 
            can_send_media_messages: true, 
            can_send_other_messages: true 
        });
        ctx.reply('🔓 Chat abierto. Los permisos han sido restaurados.');
    } catch (e) {
        ctx.reply('❌ Error: El bot necesita permisos de administrador.');
    }
});

// ==========================================
// 🎵 2. MULTIMEDIA Y MÚSICA
// ==========================================

bot.command('music', async (ctx) => {
    const query = ctx.message.text.replace('/music', '').trim();
    if (!query) return ctx.reply('🎵 Uso correcto: /music [nombre de la canción] - [artista]');

    const cargando = await ctx.reply(`🔍 Buscando "${query}"...`);

    try {
        const searchQuery = encodeURIComponent(query + " audio oficial");
        const musicUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

        await ctx.telegram.deleteMessage(ctx.chat.id, cargando.message_id).catch(() => {});

        await ctx.reply(`🎶 **RESULTADO MUSICAL**\n\n` +
                        `🔎 Pista: \`${query}\`\n\n` +
                        `Toca el botón para escuchar la canción:`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🎧 Escuchar en YouTube / YouTube Music', url: musicUrl }]
                ]
            }
        });
    } catch (error) {
        ctx.reply('❌ Error al procesar la búsqueda de música.');
    }
});

bot.command('pelicula', async (ctx) => {
    const q = ctx.message.text.replace('/pelicula', '').trim();
    if (!q) return ctx.reply('🎬 Uso correcto: /pelicula [nombre]');
    ctx.reply(`🍿 **Búsqueda de Cine:** ${q}\n🔗 https://www.google.com/search?q=pelicula+${encodeURIComponent(q)}`, { parse_mode: 'Markdown' });
});

// ==========================================
// 🎮 3. ENTRETENIMIENTO Y MINIJUEGOS
// ==========================================

bot.command('apostar', (ctx) => {
    const p = obtenerPerfil(ctx);
    const args = ctx.message.text.split(' ');
    const monto = parseInt(args[1]);

    if (isNaN(monto) || monto <= 0) return ctx.reply('🎲 Uso: /apostar [cantidad]');
    if (p.creditos < monto) return ctx.reply(`❌ Fondos insuficientes. Tienes ${p.creditos} créditos.`);

    if (Math.random() < 0.5) {
        p.creditos += monto;
        ctx.reply(`🎉 ¡Ganaste la apuesta! +${monto} créditos.\n💰 Balance: ${p.creditos}`);
    } else {
        p.creditos -= monto;
        ctx.reply(`💀 Perdiste la apuesta. -${monto} créditos.\n💰 Balance: ${p.creditos}`);
    }
});

bot.command('chiste', (ctx) => {
    const chistes = [
        Mi amor, ¿qué tal me queda este vestido? - ¡Pareces una diosa! - ¿Ah, sí? ¿De qué mitología? Del caos.`,
        '— Papá, papá, ¿qué se siente tener un hijo tan guapo? — No lo sé, hijo, pregúntale a tu abuelo.',
        '— Camarero, hay una mosca en mi sopa. — No se preocupe, el murciélago que pidió la cazuela se la comerá luego.'
    ];
    ctx.reply(chistes[Math.floor(Math.random() * chistes.length)]);
});

bot.command('oraculo', (ctx) => {
    const q = ctx.message.text.replace('/oraculo', '').trim();
    if (!q) return ctx.reply('🔮 Pregúntale algo al oráculo: /oraculo [pregunta]');
    const respuestas = ['Es altamente probable.', 'Ni lo sueñes.', 'Las señales apuntan a que sí.', 'Jamás sucederá.', 'Prueba a consultarlo más tarde.'];
    ctx.reply(`🔮 **Oráculo:** ${respuestas[Math.floor(Math.random() * respuestas.length)]}`);
});

// ==========================================
// 🛠️ 4. UTILIDADES Y HERRAMIENTAS
// ==========================================

bot.command('clima', async (ctx) => {
    const ciudad = ctx.message.text.replace('/clima', '').trim();
    if (!ciudad) return ctx.reply('🌤️ Uso: /clima [ciudad]');
    try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(ciudad)}?format=3&lang=es`);
        const text = await res.text();
        ctx.reply(`🌤️ **Clima para ${ciudad.toUpperCase()}:**\n${text}`);
    } catch (e) {
        ctx.reply('❌ No se pudo obtener el reporte meteorológico.');
    }
});

bot.command('calcular', (ctx) => {
    const expr = ctx.message.text.replace('/calcular', '').trim();
    if (!expr) return ctx.reply('🔢 Uso: /calcular [operación matemática, ej: 5*5+2]');
    try {
        // Usamos eval de forma segura limitada a números
        const resultado = eval(expr.replace(/[^0-9+\-*/().]/g, ''));
        ctx.reply(`🔢 Resultado: ${resultado}`);
    } catch (e) {
        ctx.reply('❌ Operación inválida.');
    }
});

// ==========================================
//  5. PERFILES Y ECONOMÍA
// ==========================================

bot.command('perfil', (ctx) => {
    const p = obtenerPerfil(ctx);
    ctx.reply(` **PERFIL DE USUARIO**\n` +
              `• Nombre: ${p.nombre}\n` +
              `• Nivel: ${p.nivel}\n` +
              `• Créditos: ${p.creditos} 🪙`);
});

bot.command('diario', (ctx) => {
    const p = obtenerPerfil(ctx);
    p.creditos += 50;
    ctx.reply(`¡Has reclamado tu bonificación diaria!\n💰 Has ganado +50 créditos. Balance actual: ${p.creditos} 🪙`);
});

// ==========================================
// 🚀 INICIALIZACIÓN
// ==========================================

bot.launch().then(() => {
    console.log('[SYS_BOOT] Bot multifunción inicializado correctamente.');
}).catch((err) => {
    console.error('[ERROR_LAUNCH]', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
