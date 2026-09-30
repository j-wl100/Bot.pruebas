const { Telegraf } = require('telegraf');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('⟨ ☩ ⟩ Servidor Activo y Operativo.');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYS] Servidor HTTP en puerto ${PORT}`);
});

// Reemplaza con tu token nuevo
const bot = new Telegraf('8871233471:AAGwFEoIlKxg5IaHemqc0x2xLEJWsR63_cc');

const usuariosDB = {};
const antispamDB = {};      
const advertenciasDB = {};  
const palabrasProhibidas = ['spam', 'porno', 'nsfw', '18+', 'scam', 'phishing', 't.me/joinchat'];

function obtenerPerfil(ctx) {
    const userId = ctx.from.id;
    if (!usuariosDB[userId]) {
        usuariosDB[userId] = {
            nombre: ctx.from.first_name || 'Agente',
            creditos: 100,
            nivel: 1
        };
    }
    return usuariosDB[userId];
}

// Núcleo de seguridad básico
bot.on('message', async (ctx, next) => {
    if (!ctx.chat || ctx.chat.type === 'private') return next();
    if (!ctx.from) return next();

    const userId = ctx.from.id;
    const texto = (ctx.message.text || ctx.message.caption || '').toLowerCase();
    
    if (palabrasProhibidas.some(p => texto.includes(p))) {
        await ctx.deleteMessage().catch(() => {});
        advertenciasDB[userId] = (advertenciasDB[userId] || 0) + 1;
        ctx.reply(`⚠ Contenido prohibido detectado. Advertencia [${advertenciasDB[userId]}/3].`);
        return;
    }

    return next();
});

// Comandos
bot.start((ctx) => ctx.reply('🤖 ¡Bot multifunción activo! Escribe /menu para ver los comandos.'));

bot.command('menu', (ctx) => {
    ctx.reply('📂 **DIRECTORIO DE COMANDOS**\n\n' +
              '🛡️ **Seguridad:** /cerrar, /abrir\n' +
              '🎵 **Multimedia:** /music [canción], /pelicula\n' +
              '🎮 **Entretenimiento:** /apostar [monto], /chiste, /oraculo\n' +
              '🛠️ **Utilidades:** /clima [ciudad], /calcular\n' +
              '👤 **Perfil:** /perfil, /diario');
});

bot.command('cerrar', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Solo para grupos.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, { can_send_messages: false });
        ctx.reply('🔒 Chat cerrado administrativamente.');
    } catch (e) {
        ctx.reply('❌ Error: Necesito permisos de administrador.');
    }
});

bot.command('abrir', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('❌ Solo para grupos.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, { 
            can_send_messages: true, 
            can_send_media_messages: true, 
            can_send_other_messages: true 
        });
        ctx.reply('🔓 Chat abierto.');
    } catch (e) {
        ctx.reply('❌ Error: Necesito permisos de administrador.');
    }
});

bot.command('music', async (ctx) => {
    const query = ctx.message.text.replace('/music', '').trim();
    if (!query) return ctx.reply('🎵 Uso: /music [nombre de la canción]');
    const musicUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " audio oficial")}`;
    ctx.reply(`🎶 **Resultado musical para:** \`${query}\``, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: '🎧 Escuchar en YouTube', url: musicUrl }]] }
    });
});

bot.command('pelicula', (ctx) => {
    const q = ctx.message.text.replace('/pelicula', '').trim();
    if (!q) return ctx.reply('🎬 Uso: /pelicula [nombre]');
    ctx.reply(`🍿 **Cine:** ${q}\n🔗 https://www.google.com/search?q=pelicula+${encodeURIComponent(q)}`, { parse_mode: 'Markdown' });
});

bot.command('apostar', (ctx) => {
    const p = obtenerPerfil(ctx);
    const monto = parseInt(ctx.message.text.split(' ')[1]);
    if (isNaN(monto) || monto <= 0) return ctx.reply('🎲 Uso: /apostar [cantidad]');
    if (p.creditos < monto) return ctx.reply(`❌ No tienes suficientes créditos. Tienes ${p.creditos}.`);

    if (Math.random() < 0.5) {
        p.creditos += monto;
        ctx.reply(`🎉 ¡Ganaste! +${monto} créditos. Balance: ${p.creditos}`);
    } else {
        p.creditos -= monto;
        ctx.reply(`💀 Perdiste. -${monto} créditos. Balance: ${p.creditos}`);
    }
});

bot.command('chiste', (ctx) => {
    const chistes = [
        '— ¿Qué hace una abeja en el gimnasio? — ¡Zumba!',
        '— Hola, ¿está Agustín? — No, estoy incomodísimo.',
        '— ¿Por qué los pájaros vuelan al sur en invierno? — ¡Porque caminando tardan demasiado!'
    ];
    ctx.reply(chistes[Math.floor(Math.random() * chistes.length)]);
});

bot.command('oraculo', (ctx) => {
    const respuestas = ['Es altamente probable.', 'Ni lo sueñes.', 'Las señales apuntan a que sí.', 'Jamás sucederá.'];
    ctx.reply(`🔮 ${respuestas[Math.floor(Math.random() * respuestas.length)]}`);
});

bot.command('clima', async (ctx) => {
    const ciudad = ctx.message.text.replace('/clima', '').trim();
    if (!ciudad) return ctx.reply('🌤️ Uso: /clima [ciudad]');
    try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(ciudad)}?format=3&lang=es`);
        const text = await res.text();
        ctx.reply(`🌤️ **Clima:** ${text}`);
    } catch (e) {
        ctx.reply('❌ Error al consultar el clima.');
    }
});

bot.command('perfil', (ctx) => {
    const p = obtenerPerfil(ctx);
    ctx.reply(`👤 **Perfil:** ${p.nombre}\n🪙 Créditos: ${p.creditos}`);
});

bot.command('diario', (ctx) => {
    const p = obtenerPerfil(ctx);
    p.creditos += 50;
    ctx.reply(`🎁 ¡Has reclamado +50 créditos! Balance: ${p.creditos}`);
});

bot.launch().then(() => console.log('Bot iniciado correctamente.'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
