const { Telegraf } = require('telegraf');

// 1. Pega tu token de BotFather aquí
const bot = new Telegraf('8766864367:AAEXy5d7hW-tvc38aoX3iwVUFjEUnb8xQQA');

// Base de datos en memoria para perfiles y economía
const usuariosDB = {};

function obtenerPerfil(ctx) {
    const userId = ctx.from.id;
    const nombre = ctx.from.first_name || 'Usuario';
    
    if (!usuariosDB[userId]) {
        usuariosDB[userId] = {
            nombre: nombre,
            saldo: 100,
            nivel: 1,
            xp: 0
        };
    }
    return usuariosDB[userId];
}

// Menú y arranque
bot.start((ctx) => {
    ctx.reply('⟨ ☩ ⟩ ZENITH // Núcleo Central Activo\n\n⚡ El sistema está en línea. Escribe /menu para ver las opciones.');
});

bot.command('menu', (ctx) => {
    ctx.reply('⟨ ☩ ⟩ PANEL DE CONTROL ZENITH\n\n' +
              '👤 /perfil - Ver tu saldo y nivel\n' +
              '🎁 /diaria - Reclamar saldo diario\n' +
              '🎮 /apostar [cantidad] - Juega al azar\n' +
              '🎵 /musica [nombre] - Buscar canciones\n' +
              '🌤️ /clima [ciudad] - Ver el tiempo\n' +
              '🔒 /cerrar y /abrir - Admin de grupos');
});

// Perfil y economía
bot.command('perfil', (ctx) => {
    const p = obtenerPerfil(ctx);
    ctx.reply(`⟨ ☩ ⟩ PERFIL\n👤 ${p.name || p.nombre}\n🪙 Saldo: ${p.saldo} Z-Coins\n⭐ Nivel: ${p.nivel}`);
});

bot.command('diaria', (ctx) => {
    const p = obtenerPerfil(ctx);
    p.saldo += 50;
    ctx.reply(`🎁 ¡Bono reclamado! +50 Z-Coins.\n🪙 Saldo total: ${p.saldo} Z-Coins.`);
});

// Juego de apuestas
bot.command('apostar', (ctx) => {
    const p = obtenerPerfil(ctx);
    const args = ctx.message.text.split(' ');
    const apuesta = parseInt(args[1]);

    if (isNaN(apuesta) || apuesta <= 0) {
        return ctx.reply('⚠️ Uso: /apostar [cantidad]. Ejemplo: /apostar 20');
    }
    if (p.saldo < apuesta) {
        return ctx.reply(`❌ Saldo insuficiente. Tienes ${p.saldo} Z-Coins.`);
    }

    const gano = Math.random() < 0.5;
    if (gano) {
        p.saldo += apuesta;
        ctx.reply(`🎉 ¡Ganaste! +${apuesta} Z-Coins\n💼 Saldo: ${p.saldo}`);
    } else {
        p.saldo -= apuesta;
        ctx.reply(`💀 Perdiste ${apuesta} Z-Coins.\n💼 Saldo: ${p.saldo}`);
    }
});

// Música (Enlaces rápidos)
bot.command('musica', (ctx) => {
    const query = ctx.message.text.replace('/musica', '').trim();
    if (!query) return ctx.reply('⚠️ Escribe el nombre de la canción. Ejemplo: /musica Cyberpunk');
    const enc = encodeURIComponent(query);
    ctx.reply(`🎧 Búsqueda para: *${query}*\n\n🔗 YouTube: https://www.youtube.com/results?search_query=${enc}`, { parse_mode: 'Markdown' });
});

// Clima
bot.command('clima', async (ctx) => {
    const ciudad = ctx.message.text.replace('/clima', '').trim();
    if (!ciudad) return ctx.reply('⚠️ Escribe una ciudad. Ejemplo: /clima Madrid');
    try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(ciudad)}?format=3&lang=es`);
        const text = await res.text();
        ctx.reply(`🌤️ Clima:\n${text}`);
    } catch (e) {
        ctx.reply('❌ No se pudo consultar el clima.');
    }
});

// Administración de grupos
bot.command('cerrar', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('⚠️ Solo en grupos.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, { can_send_messages: false });
        ctx.reply('🔒 Grupo cerrado temporalmente.');
    } catch (e) {
        ctx.reply('❌ Error: El bot necesita permisos de administrador.');
    }
});

bot.command('abrir', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('⚠️ Solo en grupos.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, {
            can_send_messages: true,
            can_send_media_messages: true,
            can_send_other_messages: true,
            can_add_web_page_previews: true
        });
        ctx.reply('🔓 Grupo abierto.');
    } catch (e) {
        ctx.reply('❌ Error: El bot necesita permisos de administrador.');
    }
});

// Iniciar
bot.launch();
console.log('Bot en línea correctamente...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
