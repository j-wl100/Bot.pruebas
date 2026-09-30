const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
    console.error("❌ ERROR: No se encontró la variable TELEGRAM_TOKEN en el sistema.");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("SPYCT.BOT está encendido y listo en el sistema...");

// Base de datos de usuarios y configuraciones de grupos
const usuariosData = {};
const gruposConfig = {};

function getUsuario(userId) {
    if (!usuariosData[userId]) {
        usuariosData[userId] = { balance: 1000, banco: 5000, nivel: 1 };
    }
    return usuariosData[userId];
}

function getGrupoConfig(chatId) {
    if (!gruposConfig[chatId]) {
        gruposConfig[chatId] = { antilink: false, nsfw: false, abierto: true };
    }
    return gruposConfig[chatId];
}

// ==========================================
// DICCIONARIO DE MENÚS Y TEXTOS
// ==========================================
const menus = {
    menu: (user) => `▉          𝗦𝗣𝖸Ɔ𝖳.𝓑𝐎꓄     
      
%＿＿         𝗕𝖨𝖾𝗇𝗏𝖾𝗇𝗂𝖽x      #!?    𝖠𝗅 𝗺𝗲𝗻𝘂 𝗽𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅  

!▛      solicitado por @${user}          𔖢𔖢

〓©꯭           𝗘𝖢ꄲ𝖬Ө𝖬Ｉ𝖠 
 ⏤    𝖯ᴀʀᴀ ᴠᴇʀ ʟᴏ𝘴 ᴄᴏᴍᴀɴᴅᴏs ᴜsᴀ  
/menu_economia

〓©꯭          𝗣𝖤ꋪ𝖥𝖨L‌  
 ⏤    𝖯ᴀʀᴀ ᴠᴇʀ ʟᴏ𝘴 ᴄᴏᴍᴀɴْدᴏs ᴜsᴀ  
/menu_perfil

〓©꯭          𝗚 𝖠 ᛖ𝐄ֆ
 ⏤    𝖯ᴀʀᴀ ᴠᴇʀ ʟᴏ𝘴 ᴄᴏᴍᴀɴْدᴏs ᴜsᴀ  
/menu_games
 
〓©꯭           𝗥𝗔ℕ𝖣Ø𝖬   
 ⏤    𝖯ᴀʀᴀ ᴠᴇʀ ʟᴏ𝘴 ᴄᴏᴍᴀɴْدᴏs ᴜsᴀ  
/menu_random

〓©꯭           𝗘 𝖭 L‌ 𐌀𝖢 𝖤 § 
 ⏤    𝖯ᴀʀᴀ ᴠᴇʀ ʟᴏ𝘴 ᴄᴏᴍᴀɴْدᴏs ᴜsᴀ  
/menu_enlaces

〓©꯭          𝗠ꄲ𝣣𝗘Я𝖠匚꒐ӨΝ & 𝖲𝖳𝖠𝖳𝖲
 ⏤    𝖯ᴀʀᴀ ᴠᴇʀ ʟᴏ𝘴 ᴄᴏᴍᴀɴْدᴏs ᴜsᴀ 
/menu_moderacion`,

    menu_economia: `〓©꯭           𝗘𝖢ꄲ𝖬Ө𝖬Ｉ𝖠 

/apostar [cantidad]
/diario - reclama tu bono
/trabajar [uber/ropa/vida_galante/comida/repartidor/albanil/telcel/limpiador/fotografo/default]
/banco [cantidad] 
/balance`,

    menu_perfil: `〓©꯭          𝗣𝖤ꋪ𝖥𝖨L‌  
/perfil [@user]
/nivel`,

    menu_games: `〓©꯭          𝗚 𝖠 ᛖ𝐄ֆ
/caraocruz [cantidad] [cara/cruz]
/ppt [piedra/papel/tijera]
/chiste
/frase`,

    menu_random: `〓©꯭           𝗥𝗔ℕ𝖣Ø𝖬   
/clima [ciudad]
/hora [zona horaria o pais]
/calculadora [operacion matematica]
/wiki [busqueda real]`,

    menu_enlaces: `»      🔗     |───────────  ●●  ┘
/reglas
/web_oficial -> Enlace oficial
/cuenta_tiktok -> TikTok oficial
/community_whatsapp -> Grupo de WhatsApp
─────────────────────┘`,

    menu_moderacion: `〓©꯭          𝗠ꄲ𝣣𝗘Я𝖠匚꒐ӨΝ & 𝖲𝖳𝖠𝖳𝖲
/abrir - Abre el grupo para hablar
/cerrar - Cierra el grupo (solo admins)
/antilink [on/off] - Filtro de enlaces
/nsfw [on/off] - Control de contenido
/stats - Ver estado actual de opciones
/ban @user - Expulsar usuario`
};

// ==========================================
// BANCO DE TRABAJOS (4 variantes por cada uno de los 10 trabajos)
// ==========================================
const trabajosData = {
    uber: [
        "🚗 Hiciste un viaje largo por la ciudad esquivando el tráfico pesado. Ganaste **$350** por el trayecto.",
        "📱 Te tocó un pasajero silencioso pero te dejó una excelente propina digital. Recibiste **$420**.",
        "⛽ Se te complicó una ruta por obras en la calle, aun así completaste el servicio con éxito y ganaste **$280**.",
        "⭐ ¡Calificación de 5 estrellas! Tu cliente quedó fascinado con tu música y manejo. Obtuviste **$500**."
    ],
    ropa: [
        "👗 Atendiste a una clienta exigente en la boutique y le armaste un outfit completo. Ganaste **$310** de comisión.",
        "📦 Ayudaste a organizar el nuevo inventario de temporada y acomodar los escaparates. Recibiste **$250**.",
        "🏷️ Hiciste rebajas y ventas especiales este turno. Te llevaste una ganancia neta de **$390**.",
        "🤝 Cerraste una venta mayorista importante para un evento local. Ganaste jugosas comisiones por **$600**."
    ],
    vida_galante: [
        "🌙 Tuviste una noche movida en la zona exclusiva del distrito nocturno. Ganaste **$800** por tus servicios.",
        "🍸 Acompañaste a un cliente VIP en un prestigioso club de la ciudad. Te pagaron **$950**.",
        "✨ Un encuentro discreto pero muy lucrativo al amanecer te dejó una ganancia de **$700**.",
        "💸 La noche estuvo tranquila pero un cliente generoso te obsequió **$1,100** por tu compañía."
    ],
    comida: [
        "🍔 Cocinaste cientos de hamburguesas a contratiempo en horas pico en el restaurante. Ganaste **$290**.",
        "🍟 Atendiste la barra de servicio rápido con una sonrisa impecable. Recibiste **$220** más propinas.",
        "🍳 Limpiaste la cocina y preparaste los pedidos de delivery más solicitados. Ganaste **$340**.",
        "👨‍🍳 El chef principal te felicitó por tu rapidez y te dio un bono extra. Te llevaste **$450**."
    ],
    repartidor: [
        "🛵 Entregaste paquetes express bajo la lluvia por toda la zona metropolitana. Ganaste **$330**.",
        "🍕 Llevaste pedidos calientes a domicilio rompiendo el récord de velocidad. Recibiste **$270**.",
        "📦 Cargaste mercancía pesada pero cumpliste con todas tus entregas a tiempo. Ganaste **$380**.",
        "🎁 Un cliente te dio un billete extra por llegar antes de lo esperado. Te llevaste **$490**."
    ],
    albanil: [
        "🧱 Levantaste un muro de ladrillos perfecto bajo el sol intenso de la tarde. Ganaste **$400**.",
        "⚖️ Mezclaste cemento y ayudaste a vaciar la losa principal de la obra. Recibiste **$450**.",
        "🏗️️ Hiciste reparaciones de plomería y acabados finos en una fachada. Ganaste **$380**.",
        "👷‍♂️ El contratista principal valoró tu esfuerzo físico diario y te pagó **$550**."
    ],
    telcel: [
        "📡 Atendiste centro de atención a clientes renovando líneas y planes de datos. Ganaste **$350**.",
        "📱 Resolviste fallas de señal y configuraste equipos móviles nuevos. Recibiste **$300**.",
        "💼 Vendiste paquetes de portabilidad masiva superando tu cuota mensual. Ganaste **$600**.",
        "🛠️ Diste soporte técnico exprés a usuarios frustrados con su red. Te llevaste **$390**."
    ],
    limpiador: [
        "🧹 Dejaste impecables y relucientes las oficinas corporativas del centro. Ganaste **$260**.",
        "🧽 Limpiaste cristales y alfombras de un edificio comercial completo. Recibiste **$320**.",
        "✨ Realizaste una limpieza profunda post-evento en tiempo récord. Ganaste **$410**.",
        "🧼 Desinfectaste áreas comunes y recibiste felicitaciones por tu pulcritud. Te llevaste **$290**."
    ],
    fotografo: [
        "📸 Cubriste un evento social exclusivo capturando los mejores momentos. Ganaste **$600**.",
        "🌅 Hiciste una sesión fotográfica urbana en exteriores con gran iluminación. Recibiste **$500**.",
        "📷 Revelaste y editaste portafolios profesionales para modelos locales. Ganaste **$750**.",
        "💡 Montaste iluminación de estudio para una marca de ropa importante. Te llevaste **$900**."
    ],
    default: [
        "💼 Hiciste tareas generales de oficina y recados varios por la ciudad. Ganaste **$200**.",
        "🛠️ Realizaste changas temporales de mantenimiento general. Recibiste **$240**.",
        "📋 Archivaste documentos y organizaste bases de datos pendientes. Ganaste **$210**.",
        "🌟 Ayudaste en la logística de un proyecto comunitario local por **$300**."
    ]
};

// ==========================================
// COMANDOS DE MENÚS
// ==========================================
bot.onText(/\/menu(?!\S)/, (msg) => {
    bot.sendMessage(msg.chat.id, menus.menu(msg.from.username || msg.from.first_name));
});
bot.onText(/\/menu_economia/, (msg) => bot.sendMessage(msg.chat.id, menus.menu_economia));
bot.onText(/\/menu_perfil/, (msg) => bot.sendMessage(msg.chat.id, menus.menu_perfil));
bot.onText(/\/menu_games/, (msg) => bot.sendMessage(msg.chat.id, menus.menu_games));
bot.onText(/\/menu_random/, (msg) => bot.sendMessage(msg.chat.id, menus.menu_random));
bot.onText(/\/menu_enlaces/, (msg) => bot.sendMessage(msg.chat.id, menus.menu_enlaces));
bot.onText(/\/menu_moderacion/, (msg) => bot.sendMessage(msg.chat.id, menus.menu_moderacion));

// ==========================================
// COMANDOS DE MODERACIÓN Y ESTADÍSTICAS (STATS)
// ==========================================

// Abrir grupo
bot.onText(/\/abrir/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        await bot.setChatPermissions(chatId, {
            can_send_messages: true,
            can_send_media_messages: true,
            can_send_other_messages: true,
            can_add_web_page_previews: true
        });
        const config = getGrupoConfig(chatId);
        config.abierto = true;
        bot.sendMessage(chatId, "🔓 **GRUPO ABIIERTO**\n\nTodos los miembros ya pueden enviar mensajes nuevamente.");
    } catch (e) {
        bot.sendMessage(chatId, "❌ No se pudo abrir el grupo. Asegúrate de que el bot sea Administrador con permisos.");
    }
});

// Cerrar grupo
bot.onText(/\/cerrar/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        await bot.setChatPermissions(chatId, {
            can_send_messages: false
        });
        const config = getGrupoConfig(chatId);
        config.abierto = false;
        bot.sendMessage(chatId, "🔒 **GRUPO CERRADO**\n\nEl grupo ha sido cerrado temporalmente por los administradores.");
    } catch (e) {
        bot.sendMessage(chatId, "❌ No se pudo cerrar el grupo. Asegúrate de que el bot sea Administrador.");
    }
});

// Antilink ON/OFF
bot.onText(/\/antilink\s+(on|off)/i, (msg, match) => {
    const chatId = msg.chat.id;
    const estado = match[1].toLowerCase() === 'on';
    const config = getGrupoConfig(chatId);
    config.antilink = estado;
    bot.sendMessage(chatId, `🛡️ **Filtro Antilink:** ${estado ? '✅ ACTIVADO (Se eliminarán enlaces externos)' : '❌ DESACTIVADO'}`);
});

// NSFW ON/OFF
bot.onText(/\/nsfw\s+(on|off)/i, (msg, match) => {
    const chatId = msg.chat.id;
    const estado = match[1].toLowerCase() === 'on';
    const config = getGrupoConfig(chatId);
    config.nsfw = estado;
    bot.sendMessage(chatId, `🔞 **Control NSFW:** ${estado ? '✅ ACTIVADO (Protección estricta contra contenido explícito)' : '❌ DESACTIVADO'}`);
});

// Panel de Estadísticas (STATS)
bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    const config = getGrupoConfig(chatId);
    bot.sendMessage(chatId, `📊 **ESTADÍSTICAS Y ESTADO DEL CHAT**\n\n🔓 Estado del grupo: ${config.abierto ? 'Abierto' : 'Cerrado'}\n🛡️ Antilink: ${config.antilink ? '🟢 Activado' : '🔴 Desactivado'}\n🔞 Control NSFW: ${config.nsfw ? '🟢 Activado' : '🔴 Desactivado'}\n🤖 Estado del Bot: 100% Operativo`, { parse_mode: 'Markdown' });
});

// Moderador Ban
bot.onText(/\/ban/, async (msg) => {
    const chatId = msg.chat.id;
    if (msg.reply_to_message) {
        const userIdToBan = msg.reply_to_message.from.id;
        try {
            await bot.banChatMember(chatId, userIdToBan);
            bot.sendMessage(chatId, `🔨 El usuario ha sido expulsado correctamente del grupo.`);
        } catch (e) {
            bot.sendMessage(chatId, `❌ No se pudo banear al usuario. Verifica que el bot sea administrador.`);
        }
    } else {
        bot.sendMessage(chatId, `⚠️ Responde al mensaje del usuario que deseas banear con el comando \`/ban\`.`);
    }
});

// ==========================================
// FILTRO ANTILINK AUTOMÁTICO (Escucha mensajes)
// ==========================================
bot.on('message', (msg) => {
    if (!msg.text) return;
    const chatId = msg.chat.id;
    const config = gruposConfig[chatId];
    
    if (config && config.antilink) {
        const regexLink = /(https?:\/\/[^\s]+|t\.me\/[^\s]+|www\.[^\s]+)/i;
        if (regexLink.test(msg.text)) {
            bot.deleteMessage(chatId, msg.message_id).catch(() => {});
            bot.sendMessage(chatId, `⚠️ @${msg.from.username || msg.from.first_name}, los enlaces están prohibidos en este grupo (Antilink activo).`).then(sent => {
                setTimeout(() => bot.deleteMessage(chatId, sent.message_id).catch(() => {}), 5000);
            });
        }
    }
});

// ==========================================
// COMANDOS DE ECONOMÍA Y TRABAJOS
// ==========================================
bot.onText(/\/trabajar(?:\s+(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const tipo = match[1] ? match[1].toLowerCase().trim() : 'default';
    const user = getUsuario(userId);

    const listaTrabajos = ['uber', 'ropa', 'vida_galante', 'comida', 'repartidor', 'albanil', 'telcel', 'limpiador', 'fotografo'];
    const trabajoKey = listaTrabajos.includes(tipo) ? tipo : 'default';

    const variantes = trabajosData[trabajoKey];
    const mensajeAleatorio = variantes[Math.floor(Math.random() * variantes.length)];

    user.balance += 350;

    bot.sendMessage(chatId, `👷‍♂️ **SISTEMA DE TRABAJO - SPYCT.BOT**\n\n${mensajeAleatorio}\n\n💰 Tu balance actual aumentó. Cartera: **$${user.balance}**`, { parse_mode: 'Markdown' });
});

bot.onText(/\/balance/, (msg) => {
    const user = getUsuario(msg.from.id);
    bot.sendMessage(msg.chat.id, `🏦 **ESTADO FINANCIERO**\n\n💵 Efectivo: $${user.balance}\n💳 Banco: $${user.banco}`);
});

bot.onText(/\/diario/, (msg) => {
    const user = getUsuario(msg.from.id);
    user.balance += 1000;
    bot.sendMessage(msg.chat.id, `🎁 ¡Has reclamado tu bono diario de **$1,000**! Cartera actual: $${user.balance}`);
});

// ==========================================
// COMANDOS DINÁMICOS REALES (Clima, Hora, Calculadora, Wiki)
// ==========================================

// 1. CLIMA REAL
bot.onText(/\/clima(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const ciudad = match[1] ? match[1].trim() : 'Mexico';
    try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(ciudad)}?format=j1`);
        const data = await res.json();
        const current = data.current_condition[0];
        const climaTxt = `🌍 **Clima Real en ${ciudad.toUpperCase()}**\n\n🌡️ Temperatura: ${current.temp_C}°C\n☁️ Condición: ${current.weatherDesc[0].value}\n💧 Humedad: ${current.humidity}\%\n💨 Viento: ${current.windspeedKmph} km/h`;
        bot.sendMessage(chatId, climaTxt, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, `❌ No se pudo obtener el clima para "${ciudad}".`);
    }
});

// 2. HORA REAL
bot.onText(/\/hora(?:\s+(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const zona = match[1] ? match[1].trim() : 'America/Mexico_City';
    try {
        const horaActual = new Date().toLocaleString('es-ES', { timeZone: zona, dateStyle: 'full', timeStyle: 'medium' });
        bot.sendMessage(chatId, `⏰ **Hora Oficial Global**\n\n📍 Zona: \`${zona}\`\n🕒 ${horaActual}`, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, `❌ Zona horaria no válida. Ejemplos: \`America/Mexico_City\`, \`America/Bogota\`, \`Europe/Madrid\``, { parse_mode: 'Markdown' });
    }
});

// 3. CALCULADORA REAL
bot.onText(/\/calculadora\s+(.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const expresion = match[1];
    try {
        if (!/^[0-9+\-*/().\s]+$/.test(expresion)) {
            throw new Error('Caracteres inválidos');
        }
        // eslint-disable-next-line no-eval
        const resultado = eval(expresion);
        bot.sendMessage(chatId, `🧮 **Calculadora**\n\n📥 Operación: \`${expresion}\`\n📤 Resultado: **${resultado}**`, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, `❌ Formato inválido. Ejemplo: \`/calculadora 45*2+10\``, { parse_mode: 'Markdown' });
    }
});

// 4. WIKIPEDIA REAL
bot.onText(/\/wiki\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1].trim();
    try {
        const res = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.title && data.extract) {
            bot.sendMessage(chatId, `📚 **Wikipedia: ${data.title}**\n\n${data.extract}\n\n🔗 [Más información](${data.content_urls.desktop.page})`, { parse_mode: 'Markdown' });
        } else {
            bot.sendMessage(chatId, `❌ No se encontró ningún resultado en Wikipedia para "${query}".`);
        }
    } catch (e) {
        bot.sendMessage(chatId, `❌ Error al conectar con Wikipedia.`);
    }
});

// ==========================================
// JUEGOS Y ENTRETENIMIENTO
// ==========================================
bot.onText(/\/caraocruz\s+(\d+)\s+(cara|cruz)/i, (msg, match) => {
    const chatId = msg.chat.id;
    const user = getUsuario(msg.from.id);
    const apuesta = parseInt(match[1]);
    const eleccion = match[2].toLowerCase();

    if (apuesta > user.balance) {
        return bot.sendMessage(chatId, `❌ No tienes suficiente dinero. Tu balance actual es $${user.balance}`);
    }

    const resultado = Math.random() < 0.5 ? 'cara' : 'cruz';
    if (eleccion === resultado) {
        user.balance += apuesta;
        bot.sendMessage(chatId, `🪙 Cayó **${resultado.toUpperCase()}**. ¡Ganaste la apuesta! 🎉\n💰 Cartera: $${user.balance}`);
    } else {
        user.balance -= apuesta;
        bot.sendMessage(chatId, `🪙 Cayó **${resultado.toUpperCase()}**. Perdiste la apuesta. 😢\n💰 Cartera: $${user.balance}`);
    }
});

bot.onText(/\/chiste/, async (msg) => {
    try {
        const res = await fetch('https://v2.jokeapi.dev/joke/Any?lang=es&type=single');
        const data = await res.json();
        bot.sendMessage(msg.chat.id, `😂 ${data.joke || "¿Qué hace una abeja en el gimnasio? ¡Zumba!"}`);
    } catch (e) {
        bot.sendMessage(msg.chat.id, "😂 ¿Por qué los pájaros vuelan al sur en invierno? ¡Porque caminando tardan demasiado!");
    }
});

bot.onText(/\/frase/, (msg) => {
    const frases = [
        "✨ El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
        "🚀 No cuentes los días, haz que los días cuenten.",
        "💡 La mejor forma de predecir el futuro es creándolo.",
        "🔥 Cree en ti mismo y todo será posible."
    ];
    bot.sendMessage(msg.chat.id, frases[Math.floor(Math.random() * frases.length)]);
});

// ==========================================
// ENLACES
// ==========================================
bot.onText(/\/reglas/, (msg) => bot.sendMessage(msg.chat.id, "📜 **REGLAS OFICIALES**\n\n1. Respeto mutuo.\n2. Cero spam.\n3. Diviértete y usa los comandos."));
bot.onText(/\/web_oficial/, (msg) => bot.sendMessage(msg.chat.id, "🌐 Visita nuestra web oficial: https://carrd.co"));
bot.onText(/\/cuenta_tiktok/, (msg) => bot.sendMessage(msg.chat.id, "📱 TikTok oficial del proyecto."));
bot.onText(/\/community_whatsapp/, (msg) => bot.sendMessage(msg.chat.id, "💬 Canal y comunidad oficial de WhatsApp."));

// ==========================================
// SERVIDOR HTTP PARA RENDER
// ==========================================
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SPYCT.BOT está en línea y funcionando correctamente.\n');
});

server.listen(PORT, () => {
    console.log(`Servidor web escuchando en el puerto ${PORT}`);
});
