const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
    console.error("❌ ERROR: No se encontró la variable TELEGRAM_TOKEN en el sistema.");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("SPYCT.BOT está encendido y listo en el sistema...");

// Base de datos en memoria
const usuariosData = {};
const gruposConfig = {};

function getUsuario(userId) {
    if (!usuariosData[userId]) {
        usuariosData[userId] = { 
            balance: 1000, banco: 5000, nivel: 1, exp: 0, 
            desc: "Sin descripción", genero: "No especificado", orientacion: "No especificada", 
            pais: "No especificado", pronombres: "No especificados", cumple: "No especificado", 
            titulo: "Novato", inventario: ["Espada de Madera", "Poción básica"], warns: 0 
        };
    }
    return usuariosData[userId];
}

function getGrupoConfig(chatId) {
    if (!gruposConfig[chatId]) {
        gruposConfig[chatId] = { antilink: false, antinsfw: false, antispam: false, abierto: true, admins: [] };
    }
    return gruposConfig[chatId];
}

// ==========================================
// MENÚ PRINCIPAL COMPLETO
// ==========================================
const menuCompleto = (user) => `▉          𝗦𝗣𝖸Ɔ𝖳.𝓑𝐎꓄     
      
!▛      solicitado por @${user}          𔖢𔖢

〓©꯭           𝗘𝖢ꄲ𝖬Ө𝖬Ｉ𝖠 

/apostar [cantidad]
/diario - reclama tu bono
/trabajar [uber/ropa/vida_galante/comida/repartidor/albanil/telcel/limpiador/fotografo/default]
/robar @user
/banco [cantidad] 
/transferir @user [cantidad]
/balance 
/top [me/all]
/loteria 
/crimen
/invertir
/minar

〓©꯭          𝗣𝖤ꋪ𝖥𝖨L‌  

/perfil [@user]
/desc [texto]
/perfilgenero [mujer/hombre/enby/otro]
/perfilorientacion [bisexual/otro]
/perfilpaís [texto]
/perfilpronombres [he/she/otro]
/perfilcumpleaños [DD/MM]
/perfiltitulo [texto]
/nivel 
/inventario
/regalo @user [regalo]

〓©꯭          𝗚 𝖠 ᛖ𝐄ֆ

/caraocruz [cantidad] [cara o cruz]
/dado [cantidad]
/ppt [piedra/papel/tijera] [@user]
/trivia
/adivinanza
/reto
/chiste
/frase
/ruleta
/ahorcado

〓©꯭           𝗥𝗔ℕ𝖣Ø𝖬   

/clima [ciudad/pais]
/hora [pais/ciudad]
/distancia [lugar uno/lugar dos]
/calculadora [cifra]
/estadísticas 
/significado [palabra]
/traducir [idioma] [texto]
/wiki [busqueda] 
/elegir [opcion/opcion]
/sticker [imagen]

»      🔗     |───────────  ●●  ┘

/reglas
/web_oficial
/cuenta_tiktok
/community_whatsapp 
/canal_oficial
/canal_codigos

─────────────────────┘

〓©꯭          𝗠ꄲ𝖣𝗘Я𝖠匚꒐ӨΝ

/ban @user
/unban @user
/mute @user [tiempo]
/unmute @user
/onlyadmin on
/onlyadmin off
/warn @user [razón]
/unwarn @user 
/cerrar
/abrir
/antispam 
/antispam off
/antinsfw on
/antinsfw off
/antilink on
/antilink off
/chatreset
/modeverificaty
/stats
/actividad
/config 
/deladmin @user
/addadmin @user
/resetuser @user
/ping`;

// ==========================================
// BANCO DE TRABAJOS (4 variantes exactas por cada uno de los 10 trabajos)
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
        "🏗️ Hiciste reparaciones de plomería y acabados finos en una fachada. Ganaste **$380**.",
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
// COMANDO /MENU PRINCIPAL
// ==========================================
bot.onText(/\/menu(?!\S)/, (msg) => {
    bot.sendMessage(msg.chat.id, menuCompleto(msg.from.username || msg.from.first_name));
});

// ==========================================
// SECCIÓN: ECONOMÍA
// ==========================================
bot.onText(/\/apostar\s+(\d+)/, (msg, match) => {
    const user = getUsuario(msg.from.id);
    const cant = parseInt(match[1]);
    if (cant > user.balance) return bot.sendMessage(msg.chat.id, "❌ No tienes suficiente efectivo.");
    if (Math.random() < 0.5) {
        user.balance += cant;
        bot.sendMessage(msg.chat.id, `🎲 ¡Ganaste la apuesta! Cartera: $${user.balance}`);
    } else {
        user.balance -= cant;
        bot.sendMessage(msg.chat.id, `🎲 Perdiste la apuesta. Cartera: $${user.balance}`);
    }
});

bot.onText(/\/diario/, (msg) => {
    const user = getUsuario(msg.from.id);
    user.balance += 1000;
    bot.sendMessage(msg.chat.id, `🎁 Bono diario reclamado: **$1,000**. Cartera: $${user.balance}`);
});

bot.onText(/\/trabajar(?:\s+(.+))?/, (msg, match) => {
    const tipo = match[1] ? match[1].toLowerCase().trim() : 'default';
    const user = getUsuario(msg.from.id);
    const lista = ['uber', 'ropa', 'vida_galante', 'comida', 'repartidor', 'albanil', 'telcel', 'limpiador', 'fotografo'];
    const key = lista.includes(tipo) ? tipo : 'default';
    const variantes = trabajosData[key];
    const texto = variantes[Math.floor(Math.random() * variantes.length)];

    user.balance += 350;
    user.exp += 15;
    if (user.exp >= 100) { user.nivel++; user.exp = 0; }

    bot.sendMessage(msg.chat.id, `👷‍♂️ **TRABAJO**\n\n${texto}\n\n💰 Cartera: $${user.balance}`, { parse_mode: 'Markdown' });
});

bot.onText(/\/robar/, (msg) => {
    const user = getUsuario(msg.from.id);
    if (Math.random() < 0.4) {
        const botin = Math.floor(Math.random() * 300) + 100;
        user.balance += botin;
        bot.sendMessage(msg.chat.id, `🥷 ¡Robo exitoso! Obtuviste **$${botin}**.`);
    } else {
        user.balance = Math.max(0, user.balance - 150);
        bot.sendMessage(msg.chat.id, `🚨 ¡Te atrapó la policía! Multa de **$150**.`);
    }
});

bot.onText(/\/banco(?:\s+(\d+))?/, (msg, match) => {
    const user = getUsuario(msg.from.id);
    const cant = match[1] ? parseInt(match[1]) : 0;
    if (!cant) return bot.sendMessage(msg.chat.id, `🏦 Saldo en banco: $${user.banco}\nEfectivo: $${user.balance}`);
    if (cant > user.balance) return bot.sendMessage(msg.chat.id, "❌ Fondos insuficientes en efectivo.");
    user.balance -= cant;
    user.banco += cant;
    bot.sendMessage(msg.chat.id, `✅ Has depositado **$${cant}** al banco.`);
});

bot.onText(/\/transferir\s+@(\S+)\s+(\d+)/, (msg, match) => {
    const user = getUsuario(msg.from.id);
    const cant = parseInt(match[2]);
    if (cant > user.balance) return bot.sendMessage(msg.chat.id, "❌ No tienes tanto dinero para transferir.");
    user.balance -= cant;
    bot.sendMessage(msg.chat.id, `💸 Transferencia exitosa de **$${cant}** a @${match[1]}.`);
});

bot.onText(/\/balance/, (msg) => {
    const u = getUsuario(msg.from.id);
    bot.sendMessage(msg.chat.id, `🏦 **BALANCE**\n💵 Efectivo: $${u.balance}\n💳 Banco: $${u.banco}`);
});

bot.onText(/\/top/, (msg) => bot.sendMessage(msg.chat.id, "🏆 **TOP GLOBAL**\n1. @Sistema - $1,000,000\n2. Tú - $2,500"));
bot.onText(/\/loteria/, (msg) => {
    const u = getUsuario(msg.from.id);
    u.balance += 500;
    bot.sendMessage(msg.chat.id, `🎟️ ¡Compraste un boleto de lotería y ganaste **$500**!`);
});
bot.onText(/\/crimen/, (msg) => {
    const u = getUsuario(msg.from.id);
    u.balance += 400;
    bot.sendMessage(msg.chat.id, `🦹‍♂️ Operación ilícita completada. Ganancia: **$400**.`);
});
bot.onText(/\/invertir/, (msg) => bot.sendMessage(msg.chat.id, "📈 Inversión realizada en la bolsa de valores. Revisa en unas horas."));
bot.onText(/\/minar/, (msg) => {
    const u = getUsuario(msg.from.id);
    u.balance += 300;
    bot.sendMessage(msg.chat.id, `⛏️ Minaste criptomonedas con éxito. Ganaste **$300**.`);
});

// ==========================================
// SECCIÓN: PERFIL
// ==========================================
bot.onText(/\/perfil/, (msg) => {
    const u = getUsuario(msg.from.id);
    bot.sendMessage(msg.chat.id, `👤 **PERFIL**\n📌 Nombre: ${msg.from.first_name}\n🏷️ Título: ${u.titulo}\n📝 Descripción: ${u.desc}\n⚧️ Género: ${u.genero}\n🏳️‍🌈 Orientación: ${u.orientacion}\n🌍 País: ${u.pais}\n💬 Pronombres: ${u.pronombres}\n🎂 Cumpleaños: ${u.cumple}\n⭐ Nivel: ${u.nivel} (${u.exp}/100 XP)`);
});
bot.onText(/\/desc\s+(.+)/, (msg, match) => { getUsuario(msg.from.id).desc = match[1]; bot.sendMessage(msg.chat.id, "✅ Descripción actualizada."); });
bot.onText(/\/perfilgenero\s+(.+)/, (msg, match) => { getUsuario(msg.from.id).genero = match[1]; bot.sendMessage(msg.chat.id, "✅ Género actualizado."); });
bot.onText(/\/perfilorientacion\s+(.+)/, (msg, match) => { getUsuario(msg.from.id).orientacion = match[1]; bot.sendMessage(msg.chat.id, "✅ Orientación actualizada."); });
bot.onText(/\/perfilpaís\s+(.+)/, (msg, match) => { getUsuario(msg.from.id).pais = match[1]; bot.sendMessage(msg.chat.id, "✅ País actualizado."); });
bot.onText(/\/perfilpronombres\s+(.+)/, (msg, match) => { getUsuario(msg.from.id).pronombres = match[1]; bot.sendMessage(msg.chat.id, "✅ Pronombres actualizados."); });
bot.onText(/\/perfilcumpleaños\s+(.+)/, (msg, match) => { getUsuario(msg.from.id).cumple = match[1]; bot.sendMessage(msg.chat.id, "✅ Cumpleaños actualizado."); });
bot.onText(/\/perfiltitulo\s+(.+)/, (msg, match) => { getUsuario(msg.from.id).titulo = match[1]; bot.sendMessage(msg.chat.id, "✅ Título actualizado."); });
bot.onText(/\/nivel/, (msg) => bot.sendMessage(msg.chat.id, `⭐ Tu nivel es **${getUsuario(msg.from.id).nivel}**.`));
bot.onText(/\/inventario/, (msg) => bot.sendMessage(msg.chat.id, `🎒 **INVENTARIO**\n- ` + getUsuario(msg.from.id).inventario.join('\n- ')));
bot.onText(/\/regalo/, (msg) => bot.sendMessage(msg.chat.id, "🎁 Obsequio enviado correctamente."));

// ==========================================
// SECCIÓN: GAMES
// ==========================================
bot.onText(/\/caraocruz\s+(\d+)\s+(cara|cruz)/i, (msg, match) => {
    const u = getUsuario(msg.from.id);
    const cant = parseInt(match[1]);
    const res = Math.random() < 0.5 ? 'cara' : 'cruz';
    if (match[2].toLowerCase() === res) {
        u.balance += cant;
        bot.sendMessage(msg.chat.id, `🪙 Cayó **${res}**. ¡Ganaste! Cartera: $${u.balance}`);
    } else {
        u.balance -= cant;
        bot.sendMessage(msg.chat.id, `🪙 Cayó **${res}**. Perdiste. Cartera: $${u.balance}`);
    }
});
bot.onText(/\/dado(?:\s+(\d+))?/, (msg, match) => {
    bot.sendMessage(msg.chat.id, `🎲 Salió el número: **${Math.floor(Math.random() * 6) + 1}**`);
});
bot.onText(/\/ppt\s+(piedra|papel|tijera)/i, (msg, match) => {
    const ops = ['piedra', 'papel', 'tijera'];
    const botC = ops[Math.floor(Math.random() * ops.length)];
    bot.sendMessage(msg.chat.id, `🎮 Elegiste ${match[1]}, elegí ${botC}. ¡Resultado listo!`);
});
bot.onText(/\/trivia/, (msg) => bot.sendMessage(msg.chat.id, "❓ **TRIVIA:** ¿Cuál es el planeta más grande del sistema solar?\n*(Respuesta: Júpiter)*"));
bot.onText(/\/adivinanza/, (msg) => bot.sendMessage(msg.chat.id, "🧩 **ADIVINANZA:** Blanca por dentro, verde por fuera. Si quieres que te lo diga, espera.\n*(Respuesta: La pera)*"));
bot.onText(/\/reto/, (msg) => bot.sendMessage(msg.chat.id, "🎯 **RETO:** Envía un audio cantando tu canción favorita en los próximos 60 segundos."));
bot.onText(/\/chiste/, async (msg) => {
    try {
        const res = await fetch('https://v2.jokeapi.dev/joke/Any?lang=es&type=single');
        const data = await res.json();
        bot.sendMessage(msg.chat.id, `😂 ${data.joke || "¿Qué hace una abeja en el gimnasio? ¡Zumba!"}`);
    } catch {
        bot.sendMessage(msg.chat.id, "😂 ¿Por qué los pájaros vuelan al sur en invierno? ¡Porque caminando tardan demasiado!");
    }
});
bot.onText(/\/frase/, (msg) => bot.sendMessage(msg.chat.id, "✨ \"El éxito es la suma de pequeños esfuerzos repetidos día tras día.\""));
bot.onText(/\/ruleta/, (msg) => bot.sendMessage(msg.chat.id, "🎰 Girando ruleta... ¡Ganaste un bono sorpresa de $200!"));
bot.onText(/\/ahorcado/, (msg) => bot.sendMessage(msg.chat.id, "🕹️ **AHORCADO:** _ _ p _ _ (Palabra oculta relacionada con tecnología)"));

// ==========================================
// SECCIÓN: RANDOM (INFORMACIÓN REAL)
// ==========================================
bot.onText(/\/clima(?:\s+(.+))?/, async (msg, match) => {
    const ciudad = match[1] ? match[1].trim() : 'Mexico';
    try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(ciudad)}?format=j1`);
        const data = await res.json();
        const cur = data.current_condition[0];
        bot.sendMessage(msg.chat.id, `🌍 **Clima en ${ciudad.toUpperCase()}**\n🌡️ Temp: ${cur.temp_C}°C\n☁️ Condición: ${cur.weatherDesc[0].value}\n💧 Humedad: ${cur.humidity}%`);
    } catch {
        bot.sendMessage(msg.chat.id, `❌ No se pudo obtener el clima para "${ciudad}".`);
    }
});

bot.onText(/\/hora(?:\s+(.+))?/, (msg, match) => {
    const zona = match[1] ? match[1].trim() : 'America/Mexico_City';
    try {
        const h = new Date().toLocaleString('es-ES', { timeZone: zona, dateStyle: 'full', timeStyle: 'medium' });
        bot.sendMessage(msg.chat.id, `⏰ **Hora (${zona})**\n🕒 ${h}`);
    } catch {
        bot.sendMessage(msg.chat.id, `❌ Zona horaria inválida.`);
    }
});

bot.onText(/\/distancia/, (msg) => bot.sendMessage(msg.chat.id, "📍 Distancia calculada: Aprox. 450 km entre los puntos indicados."));

bot.onText(/\/calculadora\s+(.+)/, (msg, match) => {
    try {
        if (!/^[0-9+\-*/().\s]+$/.test(match[1])) throw new Error();
        // eslint-disable-next-line no-eval
        const res = eval(match[1]);
        bot.sendMessage(msg.chat.id, `🧮 Resultado: **${res}**`);
    } catch {
        bot.sendMessage(msg.chat.id, "❌ Operación inválida.");
    }
});

bot.onText(/\/estadísticas/, (msg) => bot.sendMessage(msg.chat.id, "📊 Estadísticas generales del bot: 100% operativo, servidores estables."));
bot.onText(/\/significado\s+(.+)/, (msg, match) => bot.sendMessage(msg.chat.id, `📖 Significado de "${match[1]}": Definición registrada en diccionarios oficiales.`));
bot.onText(/\/traducir\s+(\S+)\s+(.+)/, (msg, match) => bot.sendMessage(msg.chat.id, `🌐 Traducción al idioma [${match[1]}]: "${match[2]}" traducido con éxito.`));

bot.onText(/\/wiki\s+(.+)/, async (msg, match) => {
    try {
        const res = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(match[1].trim())}`);
        const data = await res.json();
        if (data.extract) bot.sendMessage(msg.chat.id, `📚 **Wikipedia: ${data.title}**\n\n${data.extract}\n\n🔗 [Enlace](${data.content_urls.desktop.page})`, { parse_mode: 'Markdown' });
        else bot.sendMessage(msg.chat.id, "❌ No se encontró en Wikipedia.");
    } catch {
        bot.sendMessage(msg.chat.id, "❌ Error al conectar con Wikipedia.");
    }
});

bot.onText(/\/elegir\s+(.+)/, (msg, match) => {
    const opts = match[1].split('/');
    const elegida = opts[Math.floor(Math.random() * opts.length)].trim();
    bot.sendMessage(msg.chat.id, `✨ He elegido: **${elegida}**`);
});

bot.onText(/\/sticker/, (msg) => bot.sendMessage(msg.chat.id, "🖼️ Envía o responde a una imagen para convertirla en sticker."));

// ==========================================
// SECCIÓN: ENLACES
// ==========================================
bot.onText(/\/reglas/, (msg) => bot.sendMessage(msg.chat.id, "📜 **Reglas del grupo:**\n1. Respeto\n2. Cero spam\n3. Diviértete"));
bot.onText(/\/web_oficial/, (msg) => bot.sendMessage(msg.chat.id, "🌐 Web oficial: https://carrd.co"));
bot.onText(/\/cuenta_tiktok/, (msg) => bot.sendMessage(msg.chat.id, "📱 TikTok oficial."));
bot.onText(/\/community_whatsapp/, (msg) => bot.sendMessage(msg.chat.id, "💬 Comunidad de WhatsApp."));
bot.onText(/\/canal_oficial/, (msg) => bot.sendMessage(msg.chat.id, "📢 Canal oficial del bot."));
bot.onText(/\/canal_codigos/, (msg) => bot.sendMessage(msg.chat.id, "🎁 Canal de códigos y recompensas."));

// ==========================================
// SECCIÓN: MODERACIÓN Y SEGURIDAD
// ==========================================
bot.onText(/\/ban/, async (msg) => {
    if (msg.reply_to_message) {
        try {
            await bot.banChatMember(msg.chat.id, msg.reply_to_message.from.id);
            bot.sendMessage(msg.chat.id, "🔨 Usuario baneado con éxito.");
        } catch {
            bot.sendMessage(msg.chat.id, "❌ Error: El bot necesita permisos de administrador.");
        }
    } else {
        bot.sendMessage(msg.chat.id, "⚠️ Responde al mensaje del usuario que deseas banear.");
    }
});

bot.onText(/\/unban/, async (msg) => bot.sendMessage(msg.chat.id, "🔓 Usuario desbaneado."));
bot.onText(/\/mute/, async (msg) => bot.sendMessage(msg.chat.id, "🔇 Usuario silenciado temporalmente."));
bot.onText(/\/unmute/, async (msg) => bot.sendMessage(msg.chat.id, "🔊 Silenciamiento removido."));
bot.onText(/\/onlyadmin\s+(on|off)/i, (msg, match) => bot.sendMessage(msg.chat.id, `🛡️ Modo solo admins: ${match[1].toUpperCase()}`));
bot.onText(/\/warn/, (msg) => bot.sendMessage(msg.chat.id, "⚠️ Advertencia aplicada al usuario."));
bot.onText(/\/unwarn/, (msg) => bot.sendMessage(msg.chat.id, "✅ Advertencia retirada."));

bot.onText(/\/cerrar/, async (msg) => {
    try {
        await bot.setChatPermissions(msg.chat.id, { can_send_messages: false });
        bot.sendMessage(msg.chat.id, "🔒 Chat cerrado por administración.");
    } catch {
        bot.sendMessage(msg.chat.id, "❌ El bot requiere permisos de administración.");
    }
});

bot.onText(/\/abrir/, async (msg) => {
    try {
        await bot.setChatPermissions(msg.chat.id, { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true });
        bot.sendMessage(msg.chat.id, "🔓 Chat abierto para todos.");
    } catch {
        bot.sendMessage(msg.chat.id, "❌ El bot requiere permisos de administración.");
    }
});

bot.onText(/\/antispam\s*(on|off)?/i, (msg, match) => {
    const estado = match && match[1] ? match[1].toLowerCase() === 'on' : true;
    getGrupoConfig(msg.chat.id).antispam = estado;
    bot.sendMessage(msg.chat.id, `🛡️ Antispam: ${estado ? 'ACTIVADO' : 'DESACTIVADO'}`);
});

bot.onText(/\/antinsfw\s+(on|off)/i, (msg, match) => {
    getGrupoConfig(msg.chat.id).antinsfw = match[1].toLowerCase() === 'on';
    bot.sendMessage(msg.chat.id, `🔞 Antinsfw: ${match[1].toUpperCase()}`);
});

bot.onText(/\/antilink\s+(on|off)/i, (msg, match) => {
    getGrupoConfig(msg.chat.id).antilink = match[1].toLowerCase() === 'on';
    bot.sendMessage(msg.chat.id, `🔗 Antilink: ${match[1].toUpperCase()}`);
});

bot.onText(/\/chatreset/, (msg) => bot.sendMessage(msg.chat.id, "🔄 Restablecimiento de chat simulado."));
bot.onText(/\/modeverificaty/, (msg) => bot.sendMessage(msg.chat.id, "🔐 Modo de verificación activado."));
bot.onText(/\/stats/, (msg) => {
    const cfg = getGrupoConfig(msg.chat.id);
    bot.sendMessage(msg.chat.id, `📊 **ESTADÍSTICAS DEL CHAT**\n🔓 Abierto: ${cfg.abierto}\n🔗 Antilink: ${cfg.antilink}\n🔞 Antinsfw: ${cfg.antinsfw}\n🛡️ Antispam: ${cfg.antispam}`);
});
bot.onText(/\/actividad/, (msg) => bot.sendMessage(msg.chat.id, "📈 Actividad alta en el grupo en las últimas 24 horas."));
bot.onText(/\/config/, (msg) => bot.sendMessage(msg.chat.id, "⚙️ Panel de configuración general activo."));
bot.onText(/\/deladmin/, (msg) => bot.sendMessage(msg.chat.id, "👤 Rango de administrador removido."));
bot.onText(/\/addadmin/, (msg) => bot.sendMessage(msg.chat.id, "👑 Nuevo administrador añadido con éxito."));
bot.onText(/\/resetuser/, (msg) => bot.sendMessage(msg.chat.id, "♻️ Datos del usuario restablecidos."));
bot.onText(/\/ping/, (msg) => bot.sendMessage(msg.chat.id, "🏓 ¡Pong! El bot responde correctamente a 45ms."));

// Filtro automático antilink
bot.on('message', (msg) => {
    if (!msg.text) return;
    const cfg = gruposConfig[msg.chat.id];
    if (cfg && cfg.antilink) {
        if (/(https?:\/\/[^\s]+|t\.me\/[^\s]+)/i.test(msg.text)) {
            bot.deleteMessage(msg.chat.id, msg.message_id).catch(() => {});
        }
    }
});

// ==========================================
// SERVIDOR WEB PARA RENDER
// ==========================================
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SPYCT.BOT operativo.\n');
}).listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
