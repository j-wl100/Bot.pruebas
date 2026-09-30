 const { Telegraf } = require('telegraf');

// Pega aquí tu token de BotFather
const bot = new Telegraf('8766864367:AAEXy5d7hW-tvc38aoX3iwVUFjEUnb8xQQA');

// Base de datos temporal en memoria para los perfiles de la comunidad
const usuariosDB = {};

// Función auxiliar para obtener o crear el perfil del usuario
function obtenerPerfil(ctx) {
    const userId = ctx.from.id;
    const nombre = ctx.from.first_name || 'Usuario';
    
    if (!usuariosDB[userId]) {
        usuariosDB[userId] = {
            nombre: nombre,
            saldo: 100,      // Saldo inicial de bienvenida (ZenithCoins)
            nivel: 1,
            xp: 0
        };
    }
    return usuariosDB[userId];
}

// 1. BIENVENIDA Y MENÚ
bot.start((ctx) => {
    ctx.reply('ZENITH // Núcleo Central Activo\n\n' +
              ' Bienvenido a la red. Escribe /menu para ver todas las funciones disponibles.');
});

bot.command('menu', (ctx) => {
    ctx.reply('⟨ ☩ ⟩ PANEL DE CONTROL GENERAL - ZENITH\n\n' +
              '〰️ **Perfil y Economía:**\n' +
              '〰️ /perfil - Ver tu saldo, nivel y experiencia\n' +
              '〰️ /diaria - Reclama tu saldo diario\n\n' +
              '〰️ **Juegos y Entretenimiento:**\n' +
              '〰️ /apostar <cantidad> - Juega al volado (cara o cruz)\n' +
              '〰️ /musica <término> - Busca canciones y enlaces\n\n' +
              '✔️ **Utilidades:**\n' +
              '〰️ /clima <ciudad> - Consulta el estado del tiempo\n' +
              '〰️ /redes - Enlaces oficiales de la comunidad\n\n' +
              '〰️ **Administración (Solo Grupos):**\n' +
              '🔹 /cerrar y /abrir - Control de chat');
});

// 2. PERFIL Y SALDO
bot.command('perfil', (ctx) => {
    const perfil = obtenerPerfil(ctx);
    ctx.reply(`⟨ ☩ ⟩ PERFIL DE USUARIO\n\n` +
              ` Nombre: ${perfil.nombre}\n` +
              ` Saldo: ${perfil.saldo} Z-Coins\n` +
              ` Nivel: ${perfil.nivel} (XP: ${perfil.xp})`);
});

bot.command('diaria', (ctx) => {
    const perfil = obtenerPerfil(ctx);
    perfil.saldo += 50;
    ctx.reply(`🎁 ¡Has reclamado tu bono diario! Se han sumado 50 Z-Coins a tu cuenta.\n🪙 Saldo actual: ${perfil.saldo} Z-Coins.`);
});

// 3. JUEGOS POR COMANDOS (Apostar saldo)
bot.command('apostar', (ctx) => {
    const perfil = obtenerPerfil(ctx);
    const args = ctx.message.text.split(' ');
    const apuesta = parseInt(args[1]);

    if (isNaN(apuesta) || apuesta <= 0) {
        return ctx.reply('⚠️ Uso incorrecto. Debes indicar cuánto deseas apostar. Ejemplo: `/apostar 20`');
    }

    if (perfil.saldo < apuesta) {
        return ctx.reply(`❌ No tienes suficiente saldo. Tu saldo actual es de ${perfil.saldo} Z-Coins.`);
    }

    // Juego simple: Cara o Cruz (50% de probabilidad)
    const gano = Math.random() < 0.5;

    if (gano) {
        perfil.saldo += apuesta;
        perfil.xp += 10;
        ctx.reply(`🎉 ¡Has ganado la apuesta!\n🪙 Ganaste: +${apuesta} Z-Coins\n💼 Nuevo saldo: ${perfil.saldo} Z-Coins`);
    } else {
        perfil.saldo -= apuesta;
        ctx.reply(`💀 La suerte no estuvo de tu lado. Perdiste ${apuesta} Z-Coins.\n💼 Nuevo saldo: ${perfil.saldo} Z-Coins`);
    }
});

// 4. BUSCADOR DE MÚSICA (Generador de enlaces directos sin saturar Render)
bot.command('musica', (ctx) => {
    const query = ctx.message.text.replace('/musica', '').trim();
    if (!query) {
        return ctx.reply('⚠️ Escribe el nombre de la canción que buscas. Ejemplo: `/musica Cyberpunk soundtrack`');
    }
    const busquedaEncoded = encodeURIComponent(query);
    ctx.reply(`🎧 Resultados de búsqueda para: *${query}*\n\n` +
              `🔗 YouTube: https://www.youtube.com/results?search_query=${busquedaEncoded}\n` +
              `🎵 Spotify: https://open.spotify.com/search/${busquedaEncoded}`, 
              { parse_mode: 'Markdown' });
});

// 5. CONSULTA DE CLIMA EN TIEMPO REAL (Usando wttr.in API gratuita)
bot.command('clima', async (ctx) => {
    const ciudad = ctx.message.text.replace('/clima', '').trim();
    if (!ciudad) {
        return ctx.reply('⚠️ Escribe el nombre de una ciudad. Ejemplo: `/clima Ciudad de Mexico`');
    }

    try {
        // Hacemos una petición limpia a la API pública de clima
        const response = await fetch(`https://wttr.in/${encodeURIComponent(ciudad)}?format=3&lang=es`);
        const resultado = await response.text();

        ctx.reply(`🌤️ Clima actual:\n${resultado}`);
    } catch (error) {
        ctx.reply('❌ No se pudo obtener el clima en este momento. Inténtalo de nuevo más tarde.');
    }
});

// 6. ENLACES Y REDES
bot.command('redes', (ctx) => {
    ctx.reply('⟨ ☩ ⟩ ENLACES OFICIALES - ZENITH\n\n' +
              '🌐 Comunidad Principal / Carrd\n' +
              '💬 Canal de Avisos\n' +
              '🔗 NGL para mensajes anónimos');
});

// 7. ADMINISTRACIÓN DE GRUPOS (Cerrar / Abrir)
bot.command('cerrar', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('⚠️ Este comando solo funciona en grupos.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, { can_send_messages: false });
        ctx.reply('🔒 ⟨ ☩ ⟩ El núcleo ha restringido el chat temporalmente.');
    } catch (error) {
        ctx.reply('❌ Error: Asegúrate de que el bot sea administrador con permisos.');
    }
});

bot.command('abrir', async (ctx) => {
    if (ctx.chat.type === 'private') return ctx.reply('⚠️ Este comando solo funciona en grupos.');
    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, {
            can_send_messages: true,
            can_send_media_messages: true,
            can_send_other_messages: true,
            can_add_web_page_previews: true
        });
        ctx.reply('🔓 ⟨ ☩ ⟩ El chat vuelve a estar abierto para todos.');
    } catch (error) {
        ctx.reply('❌ Error: Asegúrate de que el bot sea administrador.');
    }
});

// Iniciar bot
bot.launch();
console.log('Bot avanzado de Zenith iniciado correctamente en Render...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
