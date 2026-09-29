 const { Telegraf } = require('telegraf');

// 1. Pega aquí el token que te dio @BotFather entre las comillas
const bot = new Telegraf('TU_TOKEN_DE_BOTFATHER_AQUI');

// Comando de bienvenida
bot.start((ctx) => {
    ctx.reply('⟨ ☩ ⟩ ZENITH // Núcleo Temporal de Telegram Activo\n\n' +
              '⚡ El sistema está operando en la nube.');
});

// Menú principal de comandos
bot.command('menu', (ctx) => {
    ctx.reply('⟨ ☩ ⟩ PANEL DE CONTROL ZENITH (TELEGRAM)\n\n' +
              '🔹 /estado - Verifica si el servidor responde\n' +
              '🔹 /info - Datos del núcleo\n' +
              '🔹 /cerrar - (Solo en grupo) Restringe el chat\n' +
              '🔹 /abrir - (Solo en grupo) Permite hablar a todos');
});

bot.command('estado', (ctx) => {
    ctx.reply('[SYS_STATUS] 🟢 El servidor en Render está en línea y respondiendo 24/7.');
});

bot.command('info', (ctx) => {
    ctx.reply('⟨ ☩ ⟩ Red temporal de administración configurada para Zenith.');
});

// ==========================================
// COMANDOS DE ADMINISTRACIÓN PARA GRUPOS
// ==========================================

// Comando para cerrar el grupo (nadie puede hablar, solo admins)
bot.command('cerrar', async (ctx) => {
    try {
        // Verifica si el comando se usa dentro de un grupo o supergrupo
        if (ctx.chat.type === 'private') {
            return ctx.reply('⚠️ Este comando solo se puede usar dentro de un grupo de Telegram.');
        }

        // Cambia los permisos del chat para restringir mensajes de texto a los miembros
        await ctx.telegram.setChatPermissions(ctx.chat.id, {
            can_send_messages: false
        });

        ctx.reply('🔒 ⟨ ☩ ⟩ ZENITH // Grupo cerrado temporalmente. El núcleo ha restringido el chat.');
    } catch (error) {
        console.error(error);
        ctx.reply('❌ Error: Asegúrate de que el bot sea administrador del grupo con permisos para modificar el chat.');
    }
});

// Comando para abrir el grupo (todos pueden hablar)
bot.command('abrir', async (ctx) => {
    try {
        if (ctx.chat.type === 'private') {
            return ctx.reply('⚠️ Este comando solo se puede usar dentro de un grupo de Telegram.');
        }

        // Restaura los permisos para que los miembros puedan hablar
        await ctx.telegram.setChatPermissions(ctx.chat.id, {
            can_send_messages: true,
            can_send_media_messages: true,
            can_send_other_messages: true,
            can_add_web_page_previews: true
        });

        ctx.reply('🔓 ⟨ ☩ ⟩ ZENITH // Grupo abierto. El chat vuelve a estar disponible.');
    } catch (error) {
        console.error(error);
        ctx.reply('❌ Error: Asegúrate de que el bot sea administrador del grupo.');
    }
});

// Iniciar el bot en la nube
bot.launch();
console.log('Bot temporal de Telegram iniciado correctamente en Render...');

// Cierre seguro del servidor
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
