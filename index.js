const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const fs = require('fs');

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
    console.error("❌ ERROR: No se encontró la variable TELEGRAM_TOKEN en el sistema.");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("SPYCT.BOT está encendido y listo en el sistema...");

// URL Raw corregida de GitHub para enviar fotos directamente
const MENU_IMAGE_URL = "https://raw.githubusercontent.com/j-wl100/Bot.pruebas/b73d29e9c8636b91aeba31ebeef8743fec5b68c8/IMG_20261011_232149_903.jpg";

// Bases de datos en memoria
const usuariosData = {};
const gruposConfig = {};

function getUsuario(userId) {
    if (!usuariosData[userId]) {
        usuariosData[userId] = { 
            balance: 1000, 
            banco: 5000, 
            customName: "Sin nombre",
            desc: "Sin descripción", 
            identidad: "No especificado", 
            orientacion: "No especificada", 
            pronombre: "No especificado", 
            mood: "Neutro",
            warns: 0 
        };
    }
    return usuariosData[userId];
}

function getGrupoConfig(chatId) {
    if (!gruposConfig[chatId]) {
        gruposConfig[chatId] = { 
            antilink: false, 
            antinsfw: false, 
            antispam: false, 
            onlyadmin: false,
            adminsCustom: new Set(),
            warnsUsuarios: {}
        };
    }
    return gruposConfig[chatId];
}

async function verificarPermisosAdmin(chatId, userId) {
    try {
        const admins = await bot.getChatAdministrators(chatId);
        const esAdminTelegram = admins.some(admin => admin.user.id === userId);
        const cfg = getGrupoConfig(chatId);
        const esAdminCustom = cfg.adminsCustom.has(userId);
        return esAdminTelegram || esAdminCustom;
    } catch {
        return false;
    }
}

// ==========================================
// MENÚ PRINCIPAL CON IMAGEN
// ==========================================
const menuCompleto = (user) => `𓄧 𖫰     ֺ   𓄧 𖫰      ֺ   𓄧 𖫰      ֺ   𓄧 𖫰      ֺ   𓄧 

「​㋳」ㅤ¡𝗛𝗮𝗹𝗹𝗼! @${user} sᴏʏ   𝗦𝗣𝖸Ɔ𝖳-𝕭𝐎꓄,  𝖠𝗊𝗎𝗂 𝗍𝗂𝖾𝗇𝖾𝗌 𝗅𝖺 𝗅𝗂𝗌𝗍𝖺 𝖽𝖾 𝖼𝗈𝗆𝖺𝗇𝖽𝗈𝗌.

𝖯𝖺𝗋𝖺 𝗏𝖾𝗋 𝗍𝗎 𝗉𝖾𝗋𝖿𝗂𝗅 𝗎𝗌𝖺 /perfil  ❞

⸻   ֺ   𖫰    !  🔗  ! 𖫰      ֺ   ⸻

々         𝗠𝗼𝗻𝗲𝗱𝗮  »  BYT-‽

​〓ؕ     𝗪𝗲𝗯/𝗼𝗳𝗶𝗰𝗶𝗮𝗹  »  https://zspyct.carrd.co/

⸻   ֺ   𖫰    ! 𓊫 ! 𖫰      ֺ    ⸻ㅤ
ㅤㅤㅤ
#▋         𝗖𝗼𝗺𝗮𝗻𝗱𝗼𝘀       _!?    

%─────────────────
 
   ●   𝖲𝖸𝖲.𝗘𝗖𝗢𝗡𝗢𝗠𝗜𝗔  ⟍  ™

─────────────────

/apostar [cantidad]
/diaro [reclama]
/trabajar 
/robar @user
/banco [cantidad]
/transferir @user [cantidad]
/balance
/top all/me
/loteria
/crimen
/invertir [cantidad]
/minar

%─────────────────
 
   ●   𝖲𝖸𝖲.𝗚𝗔𝗠𝗘   ⟍  ™

─────────────────

/caraocruz [cara o cruz]
/dado 
/ppt [piedra/papel/tijera] [@user]
/trivia
/adivinanza
/reto
/chiste
/ahorcado

%─────────────────
 
   ●   𝖲𝖸𝖲.𝗥𝗔𝗡𝗗𝗢𝗠    ⟍  ™

─────────────────

/clima [ciudad/pais]
/hora [pais/cuidad]
/distancia [lugar uno/lugar dos]
/calculadora [sifra]
/significado [palabra]
/traducir - idioma [texto]
/wiki [busqueda]
/elegir [opcion/opcion]
/sticker [imagen]

%─────────────────
 
   ●   𝖲𝖸𝖲.𝗣𝗘𝗥𝗙𝗜𝗟   ⟍  ™

─────────────────

/perfil
/editname
/editdescripcion
/editidentidad 
/editorientacion
/editpronombre
/editmood

%─────────────────
 
   ●   𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡𝗦    ⟍  ™

─────────────────

/ban @user
/onlyadminon
/onlyadminoff
/warn @user [razón]
/unwarn @user 
/cerrar
/abrir
/antispam 
/antispamoff
/antinsfwon
/antinstwoff
/antilinkon
/antilinkoff
/chatreset
/config 
/deladmin @user
/addadmin @user
/resetuser @user
/ping

»      🔗     |───────────  ●●  ┘

/reglas
/web_oficial
/community_whatsapp

─────────────────────┘`;

bot.onText(/\/menu(?!\S)/, (msg) => {
    const userName = msg.from.username || msg.from.first_name;
    const captionText = menuCompleto(userName);

    bot.sendPhoto(msg.chat.id, MENU_IMAGE_URL, {
        caption: captionText
    }).catch((err) => {
        console.error("Error al enviar foto del menú:", err);
        bot.sendMessage(msg.chat.id, captionText);
    });
});


// ==========================================
// COMANDOS DE ECONOMÍA MINIMALISTAS
// ==========================================
bot.onText(/\/diaro(?!\S)/, (msg) => {
    const userId = msg.from.id;
    const user = getUsuario(userId);
    const userName = msg.from.username || msg.from.first_name;
    user.balance += 1000;

    bot.sendMessage(msg.chat.id, `▉        𝖲𝖸𝖲.𝗖𝗟𝗔𝗜𝗠  ⟍ ＲＥＷＡＲＤＳ 
│
│  ᴜsᴇʀ  ⋮⋮  @${userName}
│
├────────────────────
│ 
│     ⛁  •  𝗛𝗔𝗭 𝗥𝗘𝖢𝗟𝗔𝗠𝗔𝖣𝖮 
│     1,000 BYT-‽
│
│
│     TOTAL BYT-‽ #${user.balance.toLocaleString()}
│
└───────────────────┘`);
});

bot.onText(/\/trabajar(?:\s+(.+))?/, (msg) => {
    const userId = msg.from.id;
    const user = getUsuario(userId);
    const userName = msg.from.username || msg.from.first_name;
    const pagos = [350, 420, 280, 500, 600];
    const pAgo = pagos[Math.floor(Math.random() * pagos.length)];
    const puestos = ["Uber", "Boutique", "Restaurante", "Repartidor", "Albañil"];
    const puesto = puestos[Math.floor(Math.random() * puestos.length)];
    const mensajesTrabajo = [
        "Completaste tu turno asignado sin contratiempos.",
        "Jornada laboral finalizada con éxito.",
        "Tareas del turno cumplidas correctamente."
    ];
    const mensajeTrabajo = mensajesTrabajo[Math.floor(Math.random() * mensajesTrabajo.length)];

    user.balance += pAgo;

    bot.sendMessage(msg.chat.id, `❛   🧾ؒ        𝖲𝖸𝖲.𝗪𝗢𝗥𝗞   ⟍   𝖩𝖮𝖡𝖲 


▋        ᴛʀᴀʙᴀᴊᴀᴅᴏʀ  𔗉  @${userName}

────────────────────

●         𝗣𝗨𝗘𝗦𝗧𝗢  [${puesto}]

  
𝆓       ¡ ᴛᴜʀɴᴏ ᴛᴇʀᴍɪɴᴀᴅᴏ ! 


${mensajeTrabajo}


𝗣𝗔𝗚𝗢 ::  ${pAgo} BYT-‽`);
});

bot.onText(/\/apostar\s+(\d+)/, (msg, match) => {
    const user = getUsuario(msg.from.id);
    const cant = parseInt(match[1]);
    const userName = msg.from.username || msg.from.first_name;
    if (cant > user.balance) return bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Saldo insuficiente.`);

    let resultado = "";
    if (Math.random() < 0.5) {
        user.balance += cant;
        resultado = `¡ Apuesta ganada !  +${cant} BYT-‽`;
    } else {
        user.balance -= cant;
        resultado = `¡ Apuesta perdida !  -${cant} BYT-‽`;
    }

    bot.sendMessage(msg.chat.id, `▉        𝖲𝖸𝖲.𝗕𝗘𝗧   ⟍   𝗚𝗔𝗠𝗕𝗟𝗘
│
│  ᴜsᴇʀ  ⋮⋮  @${userName}
│
├────────────────────
│
│     ${resultado}
│
│     TOTAL BYT-‽ #${user.balance.toLocaleString()}
│
└───────────────────┘`);
});

bot.onText(/\/robar(?!\S)/, (msg) => {
    const user = getUsuario(msg.from.id);
    const userName = msg.from.username || msg.from.first_name;
    let mensaje = "";

    if (Math.random() < 0.4) {
        const botin = Math.floor(Math.random() * 300) + 100;
        user.balance += botin;
        mensaje = `Operación exitosa :: +${botin} BYT-‽`;
    } else {
        user.balance = Math.max(0, user.balance - 150);
        mensaje = `Intercepción policial :: -150 BYT-‽`;
    }

    bot.sendMessage(msg.chat.id, `❛   🥷        𝖲𝖸𝖲.𝗥𝗢𝗕   ⟍   𝗔𝗖𝗧𝗜𝗢𝗡


▋        ᴜsᴇʀ  𔗉  @${userName}

────────────────────

${mensaje}

TOTAL :: ${user.balance.toLocaleString()} BYT-‽`);
});

bot.onText(/\/banco(?:\s+(\d+))?/, (msg, match) => {
    const user = getUsuario(msg.from.id);
    const cant = match[1] ? parseInt(match[1]) : 0;
    if (!cant) {
        return bot.sendMessage(msg.chat.id, `▉        𝖲𝖸𝖲.𝗕𝗔𝗡𝗞   ⟍   𝗔𝗖𝗖𝗢𝗨𝗡𝗧
│
├────────────────────
│  Efectivo  :: ${user.balance.toLocaleString()} BYT-‽
│  Banco     :: ${user.banco.toLocaleString()} BYT-‽
└───────────────────┘`);
    }

    if (cant > user.balance) return bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Fondos insuficientes en efectivo.`);
    user.balance -= cant;
    user.banco += cant;

    bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗕𝗔𝗡𝗞 ︱ Depósito completado :: +${cant} BYT-‽`);
});

bot.onText(/\/transferir\s+@(\S+)\s+(\d+)/, (msg, match) => {
    const user = getUsuario(msg.from.id);
    const cant = parseInt(match[2]);
    if (cant > user.balance) return bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Saldo insuficiente.`);
    user.balance -= cant;

    bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗧𝗥𝗔𝗡𝗦𝗙𝗘𝗥 ︱ Se enviaron ${cant} BYT-‽ a @${match[1]}`);
});

bot.onText(/\/balance(?!\S)/, (msg) => {
    const u = getUsuario(msg.from.id);
    bot.sendMessage(msg.chat.id, `▉        𝖲𝖸𝖲.𝗕𝗔𝗟𝗔𝗡𝗖𝗘   ⟍   𝗦𝗧𝗔𝗧𝗨𝗦
│
├────────────────────
│  Efectivo  :: ${u.balance.toLocaleString()} BYT-‽
│  Banco     :: ${u.banco.toLocaleString()} BYT-‽
└───────────────────┘`);
});

bot.onText(/\/top(?:\s+(me|all))?/i, (msg, match) => {
    const tipo = match[1] ? match[1].toLowerCase() : 'all';
    const usuariosArray = Object.entries(usuariosData).map(([id, data]) => ({
        id,
        nombre: data.customName !== "Sin nombre" ? data.customName : `ID_${id.slice(-4)}`,
        balance: data.balance || 0
    }));

    if (usuariosArray.length === 0) return bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗥𝗔𝗡𝗞 ︱ Sin registros suficientes.");

    usuariosArray.sort((a, b) => b.balance - a.balance);
    const top10 = usuariosArray.slice(0, 10);

    let texto = `. . . ──────────────────────\n         𝖲𝖸𝖲.𝗥𝗔𝗡𝗞𝗜𝗡𝗚 ︱ 𝗧𝗢𝗣 𝗥𝗜𝗤𝗨𝗘𝗭𝗔\n────────────────────────\n\n`;
    top10.forEach((u, index) => {
        texto += `#0${index + 1} :: ${u.nombre} ︱ ${u.balance.toLocaleString()} BYT-‽\n`;
    });

    if (tipo === 'me') {
        const miId = msg.from.id.toString();
        const miPos = usuariosArray.findIndex(u => u.id === miId);
        texto += `\n📍 Tu posición :: #${miPos !== -1 ? miPos + 1 : 'N/A'}`;
    }

    bot.sendMessage(msg.chat.id, texto);
});

bot.onText(/\/loteria(?!\S)/, (msg) => {
    const u = getUsuario(msg.from.id);
    u.balance += 500;
    bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗟𝗢𝗧𝗧𝗘𝗥𝗬 ︱ Boleto premiado :: +500 BYT-‽`);
});

bot.onText(/\/crimen(?!\S)/, (msg) => {
    const u = getUsuario(msg.from.id);
    u.balance += 400;
    bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗖𝗥𝗜𝗠𝗘 ︱ Operación sigilosa completada :: +400 BYT-‽`);
});

bot.onText(/\/invertir\s+(\d+)/, (msg, match) => {
    const user = getUsuario(msg.from.id);
    const cantidad = parseInt(match[1]);

    if (cantidad <= 0 || cantidad > user.balance) return bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Cantidad no disponible.`);

    user.balance -= cantidad;
    const suerte = Math.random();
    let res = 0;

    if (suerte < 0.4) {
        bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗜𝗡𝗩𝗘𝗦𝗧 ︱ Caída de mercado :: -${cantidad} BYT-‽`);
    } else {
        res = Math.floor(cantidad * 1.8);
        user.balance += res;
        bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗜𝗡𝗩𝗘𝗦𝗧 ︱ Retorno positivo :: +${res} BYT-‽`);
    }
});

bot.onText(/\/minar(?!\S)/, (msg) => {
    const u = getUsuario(msg.from.id);
    u.balance += 300;
    bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗠𝗜𝗡𝗜𝗡𝗚 ︱ Bloque procesado :: +300 BYT-‽`);
});


// ==========================================
// COMANDOS DE PERFIL Y EDICIÓN
// ==========================================
bot.onText(/\/perfil(?!\S)/, (msg) => {
    const userId = msg.from.id;
    const user = getUsuario(userId);
    const displayName = user.customName !== "Sin nombre" ? user.customName : msg.from.first_name;
    const identificador = `ID_${userId.toString().slice(-4)}`;

    bot.sendMessage(msg.chat.id, `. . . ──────────────────────
${user.identidad} ︱ ${user.orientacion} ︱ ${user.pronombre}
────────────────────────       
                          ${user.mood}
${identificador} :: ${displayName}  
     
"${user.desc}"


▉      ${user.balance.toLocaleString()} - BYT-‽`);
});

bot.onText(/\/editname\s+(.+)/, (msg, match) => {
    getUsuario(msg.from.id).customName = match[1].trim();
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗣𝗘𝗥𝗙𝗜𝗟 ︱ Nombre actualizado.");
});

bot.onText(/\/editdescripcion\s+(.+)/, (msg, match) => {
    getUsuario(msg.from.id).desc = match[1].trim();
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗣𝗘𝗥𝗙𝗜𝗟 ︱ Descripción actualizada.");
});

bot.onText(/\/editidentidad\s+(.+)/, (msg, match) => {
    getUsuario(msg.from.id).identidad = match[1].trim();
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗣𝗘𝗥𝗙𝗜𝗟 ︱ Identidad actualizada.");
});

bot.onText(/\/editorientacion\s+(.+)/, (msg, match) => {
    getUsuario(msg.from.id).orientacion = match[1].trim();
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗣𝗘𝗥𝗙𝗜𝗟 ︱ Orientación actualizada.");
});

bot.onText(/\/editpronombre\s+(.+)/, (msg, match) => {
    getUsuario(msg.from.id).pronombre = match[1].trim();
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗣𝗘𝗥𝗙𝗜𝗟 ︱ Pronombres actualizados.");
});

bot.onText(/\/editmood\s+(.+)/, (msg, match) => {
    getUsuario(msg.from.id).mood = match[1].trim();
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗣𝗘𝗥𝗙𝗜𝗟 ︱ Mood actualizado.");
});


// ==========================================
// JUEGOS Y UTILIDADES MINIMALISTAS
// ==========================================
bot.onText(/\/caraocruz\s+(cara|cruz)/i, (msg, match) => {
    const u = getUsuario(msg.from.id);
    const res = Math.random() < 0.5 ? 'cara' : 'cruz';
    if (match[1].toLowerCase() === res) {
        u.balance += 100;
        bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗚𝗔𝗠𝗘 ︱ Resultado: ${res}. Ganaste +100 BYT-‽`);
    } else {
        u.balance = Math.max(0, u.balance - 50);
        bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗚𝗔𝗠𝗘 ︱ Resultado: ${res}. Perdiste -50 BYT-‽`);
    }
});

bot.onText(/\/dado(?!\S)/, (msg) => {
    bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗚𝗔𝗠𝗘 ︱ Dado: ${Math.floor(Math.random() * 6) + 1}`);
});

bot.onText(/\/ppt\s+(piedra|papel|tijera)/i, (msg, match) => {
    const ops = ['piedra', 'papel', 'tijera'];
    const botC = ops[Math.floor(Math.random() * ops.length)];
    bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗚𝗔𝗠𝗘 ︱ Tú: ${match[1]} ︱ Bot: ${botC}`);
});

bot.onText(/\/trivia(?!\S)/, (msg) => bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗧𝗥𝗜𝗩𝗜𝗔 ︱ ¿Planeta más grande del sistema solar?\n(Respuesta: Júpiter)"));
bot.onText(/\/adivinanza(?!\S)/, (msg) => bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗤𝗨𝗜𝗭 ︱ Blanca por dentro, verde por fuera.\n(Respuesta: La pera)"));
bot.onText(/\/reto(?!\S)/, (msg) => bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗖𝗛𝗔𝗟𝗟𝗘𝗡𝗚𝗘 ︱ Envía una foto del cielo o tu espacio actual."));
bot.onText(/\/chiste(?!\S)/, (msg) => bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗥𝗔𝗡𝗗𝗢𝗠 ︱ ¿Qué le dice un bit a otro? Nos vemos en el bus."));
bot.onText(/\/ahorcado(?!\S)/, (msg) => bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗚𝗔𝗠𝗘 ︱ _ _ P _ _ (Categoría: Tecnología)"));

bot.onText(/\/clima(?:\s+(.+))?/, async (msg, match) => {
    const ciudad = match[1] ? match[1].trim() : 'Mexico';
    try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(ciudad)}?format=j1`);
        const data = await res.json();
        const cur = data.current_condition[0];
        bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗜𝗡𝗙𝗢 ︱ Clima en ${ciudad.toUpperCase()} :: ${cur.temp_C}°C ︱ Humedad: ${cur.humidity}%`);
    } catch {
        bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ No se obtuvo datos de clima.`);
    }
});

bot.onText(/\/hora(?:\s+(.+))?/, (msg, match) => {
    const zona = match[1] ? match[1].trim() : 'America/Mexico_City';
    try {
        const h = new Date().toLocaleString('es-ES', { timeZone: zona, timeStyle: 'medium' });
        bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗧𝗜𝗠𝗘 ︱ Hora actual [${zona}] :: ${h}`);
    } catch {
        bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Zona horaria no válida.`);
    }
});

bot.onText(/\/distancia\s+(.+)\s*\/\s*(.+)/, async (msg, match) => {
    const origen = match[1].trim();
    const destino = match[2].trim();
    try {
        const getCoords = async (lugar) => {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lugar)}`, { headers: { 'User-Agent': 'SpyctBot/1.0' } });
            const data = await res.json();
            if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            throw new Error();
        };
        const c1 = await getCoords(origen);
        const c2 = await getCoords(destino);

        const rad = (x) => (x * Math.PI) / 180;
        const R = 6371;
        const dLat = rad(c2.lat - c1.lat);
        const dLon = rad(c2.lon - c1.lon);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(c1.lat)) * Math.cos(rad(c2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanciaKm = Math.round(R * c);

        bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗠𝗔𝗣𝗦 ︱ Distancia estimada :: ${distanciaKm} km`);
    } catch {
        bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ No se calcularon las coordenadas.`);
    }
});

bot.onText(/\/calculadora\s+(.+)/, (msg, match) => {
    try {
        if (!/^[0-9+\-*/().\s]+$/.test(match[1])) throw new Error();
        // eslint-disable-next-line no-eval
        const res = eval(match[1]);
        bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗠𝗔𝗧𝗛 ︱ Resultado :: ${res}`);
    } catch {
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Operación no válida.");
    }
});

bot.onText(/\/significado\s+(.+)/, async (msg, match) => {
    try {
        const res = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(match[1].trim())}`);
        const data = await res.json();
        if (data && data.extract) {
            bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗜𝗡𝗙𝗢 ︱ ${data.title}\n\n"${data.extract}"`);
        } else {
            bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Sin resultados.`);
        }
    } catch {
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Fallo en consulta.");
    }
});

bot.onText(/\/traducir\s+-\s+(\S+)\s+(.+)/, async (msg, match) => {
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(match[2])}&langpair=es|${match[1].toLowerCase()}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.responseData) {
            bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗧𝗥𝗔𝗡𝗦𝗟𝗔𝗧𝗘 ︱ "${data.responseData.translatedText}"`);
        }
    } catch {
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Error en la traducción.");
    }
});

bot.onText(/\/wiki\s+(.+)/, async (msg, match) => {
    try {
        const res = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(match[1].trim())}`);
        const data = await res.json();
        if (data.extract) bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗪𝗜𝗞𝗜 ︱ ${data.title}\n\n${data.extract}`);
        else bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ No encontrado.");
    } catch {
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Fallo en Wikipedia.");
    }
});

bot.onText(/\/elegir\s+(.+)/, (msg, match) => {
    const opts = match[1].split('/');
    const elegida = opts[Math.floor(Math.random() * opts.length)].trim();
    bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗦𝗘𝗟𝗘𝗖𝗧 ︱ Selección :: ${elegida}`);
});

bot.onText(/\/sticker(?!\S)/, async (msg) => {
    const chatId = msg.chat.id;
    let foto = null;
    if (msg.photo && msg.photo.length > 0) {
        foto = msg.photo[msg.photo.length - 1];
    } else if (msg.reply_to_message && msg.reply_to_message.photo) {
        foto = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
    }

    if (!foto) return bot.sendMessage(chatId, "𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Responde o adjunta una imagen.");

    try {
        await bot.sendChatAction(chatId, 'upload_document');
        await bot.sendSticker(chatId, foto.file_id);
    } catch {
        bot.sendMessage(chatId, "𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ No se procesó el sticker.");
    }
});


// ==========================================
// ENLACES OFICIALES
// ==========================================
bot.onText(/\/reglas(?!\S)/, (msg) => {
    bot.sendMessage(msg.chat.id, "📜 Reglas del grupo:\n1. Respeto\n2. Cero spam\n3. Contenido moderado\n\n🔗 https://spyctsitie.neocities.org/");
});

bot.onText(/\/web_oficial(?!\S)/, (msg) => {
    bot.sendMessage(msg.chat.id, "https://zspyct.carrd.co/");
});

bot.onText(/\/community_whatsapp(?!\S)/, (msg) => {
    bot.sendMessage(msg.chat.id, "Comunidad de WhatsApp :: [Enlace no configurado]");
});


// ==========================================
// SECCIÓN DE ADMINISTRACIÓN
// ==========================================
bot.onText(/\/ban(?:\s+@(\S+))?/, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    if (!msg.reply_to_message) return bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Responde al usuario a banear.");

    try {
        await bot.banChatMember(msg.chat.id, msg.reply_to_message.from.id);
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Usuario sancionado.");
    } catch {
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Sin permisos suficientes.");
    }
});

bot.onText(/\/onlyadminon/i, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    getGrupoConfig(msg.chat.id).onlyadmin = true;
    try {
        await bot.setChatPermissions(msg.chat.id, { can_send_messages: false });
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Modo Administradores activado.");
    } catch {
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Requiere permisos de admin.");
    }
});

bot.onText(/\/onlyadminoff/i, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    getGrupoConfig(msg.chat.id).onlyadmin = false;
    try {
        await bot.setChatPermissions(msg.chat.id, { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true });
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Modo Administradores desactivado.");
    } catch {
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Requiere permisos de admin.");
    }
});

bot.onText(/\/warn(?:\s+@\S+)?(?:\s+(.+))?/, async (msg, match) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    if (!msg.reply_to_message) return bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Responde al usuario.");

    const userId = msg.reply_to_message.from.id;
    const razon = match[1] ? match[1].trim() : 'Sin razón especificada';
    const cfg = getGrupoConfig(msg.chat.id);

    if (!cfg.warnsUsuarios[userId]) cfg.warnsUsuarios[userId] = 0;
    cfg.warnsUsuarios[userId]++;

    bot.sendMessage(msg.chat.id, `𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Advertencia (${cfg.warnsUsuarios[userId]}/3) ︱ Razón: ${razon}`);

    if (cfg.warnsUsuarios[userId] >= 3) {
        try {
            await bot.banChatMember(msg.chat.id, userId);
            bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Límite de advertencias alcanzado. Baneado.");
            cfg.warnsUsuarios[userId] = 0;
        } catch {}
    }
});

bot.onText(/\/unwarn/, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    if (!msg.reply_to_message) return bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Responde al usuario.");

    getGrupoConfig(msg.chat.id).warnsUsuarios[msg.reply_to_message.from.id] = 0;
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Advertencias reiniciadas.");
});

bot.onText(/\/cerrar/, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    try {
        await bot.setChatPermissions(msg.chat.id, { can_send_messages: false });
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Chat cerrado.");
    } catch {
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Sin permisos.");
    }
});

bot.onText(/\/abrir/, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    try {
        await bot.setChatPermissions(msg.chat.id, { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true });
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Chat abierto.");
    } catch {
        bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗘𝗥𝗥𝗢𝗥 ︱ Sin permisos.");
    }
});

bot.onText(/\/antispam(?!\S)/i, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    getGrupoConfig(msg.chat.id).antispam = true;
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Antispam :: ACTIVADO");
});

bot.onText(/\/antispamoff/i, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    getGrupoConfig(msg.chat.id).antispam = false;
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Antispam :: DESACTIVADO");
});

bot.onText(/\/antinsfwon/i, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    getGrupoConfig(msg.chat.id).antinsfw = true;
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ AntiNSFW :: ACTIVADO");
});

bot.onText(/\/antinstwoff|antinsfwoff/i, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    getGrupoConfig(msg.chat.id).antinsfw = false;
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ AntiNSFW :: DESACTIVADO");
});

bot.onText(/\/antilinkon/i, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    getGrupoConfig(msg.chat.id).antilink = true;
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Antilink :: ACTIVADO");
});

bot.onText(/\/antilinkoff/i, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    getGrupoConfig(msg.chat.id).antilink = false;
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Antilink :: DESACTIVADO");
});

bot.onText(/\/chatreset(?!\S)/, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗖𝗟𝗘𝗔𝗡 ︱ Limpieza de registro requerida", {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Vaciar buffer reciente', callback_data: 'ejecutar_chatreset' }]
            ]
        }
    });
});

bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    if (callbackQuery.data === 'ejecutar_chatreset') {
        const esAdmin = await verificarPermisosAdmin(msg.chat.id, callbackQuery.from.id);
        if (!esAdmin) {
            return bot.answerCallbackQuery(callbackQuery.id, { text: "Acceso denegado.", show_alert: true });
        }
        const currentId = msg.message_id;
        try {
            for (let i = 0; i < 40; i++) {
                await bot.deleteMessage(msg.chat.id, currentId - i).catch(() => {});
            }
            bot.answerCallbackQuery(callbackQuery.id, { text: "Chat purgado." });
        } catch {
            bot.answerCallbackQuery(callbackQuery.id, { text: "Error en purga.", show_alert: true });
        }
    }
});

bot.onText(/\/config(?!\S)/, async (msg) => {
    if (msg.chat.type === 'private') return;
    const cfg = getGrupoConfig(msg.chat.id);
    bot.sendMessage(msg.chat.id, `. . . ──────────────────────
         𝖲𝖸𝖲.𝗖𝗢𝗡𝗙𝗜𝗚 ︱ 𝗦𝗧𝗔𝗧𝗨𝗦
────────────────────────       

Antilink  :: ${cfg.antilink ? 'ON' : 'OFF'}
AntiNSFW  :: ${cfg.antinsfw ? 'ON' : 'OFF'}
Antispam  :: ${cfg.antispam ? 'ON' : 'OFF'}
OnlyAdmin :: ${cfg.onlyadmin ? 'ON' : 'OFF'}`);
});

bot.onText(/\/addadmin(?!\S)/, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    if (!msg.reply_to_message) return bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Responde al usuario.");
    
    getGrupoConfig(msg.chat.id).adminsCustom.add(msg.reply_to_message.from.id);
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Rango administrativo otorgado.");
});

bot.onText(/\/deladmin(?!\S)/, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    if (!msg.reply_to_message) return bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Responde al usuario.");

    getGrupoConfig(msg.chat.id).adminsCustom.delete(msg.reply_to_message.from.id);
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Rango administrativo removido.");
});

bot.onText(/\/resetuser(?!\S)/, async (msg) => {
    if (msg.chat.type === 'private') return;
    if (!await verificarPermisosAdmin(msg.chat.id, msg.from.id)) return;
    if (!msg.reply_to_message) return bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Responde al usuario.");

    delete usuariosData[msg.reply_to_message.from.id];
    bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗔𝗗𝗠𝗜𝗡 ︱ Registro de usuario reseteado.");
});

bot.onText(/\/ping(?!\S)/, async (msg) => {
    const inicio = Date.now();
    const sent = await bot.sendMessage(msg.chat.id, "𝖲𝖸𝖲.𝗣𝗜𝗡𝗚 ︱ Midiendo...");
    const latencia = Date.now() - inicio;
    bot.editMessageText(`𝖲𝖸𝖲.𝗣𝗜𝗡𝗚 ︱ Pong :: ${latencia} ms`, {
        chat_id: msg.chat.id,
        message_id: sent.message_id
    });
});


// ==========================================
// FILTROS DE SEGURIDAD
// ==========================================
bot.on('message', async (msg) => {
    if (!msg.text || msg.chat.type === 'private') return;
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const cfg = getGrupoConfig(chatId);

    if (await verificarPermisosAdmin(chatId, userId)) return;

    if (cfg.antilink) {
        const regexLinks = /(https?:\/\/[^\s]+|t\.me\/[^\s]+|www\.[^\s]+)/i;
        if (regexLinks.test(msg.text)) {
            const dominiosOficiales = /(youtube\.com|youtu\.be|tiktok\.com|whatsapp\.com|wa\.me|carrd\.co|google\.com)/i;
            if (!dominiosOficiales.test(msg.text)) {
                await bot.deleteMessage(chatId, msg.message_id).catch(() => {});
                return;
            }
        }
    }

    if (cfg.antinsfw) {
        const palabrasNsfw = /\b(porno|nsfw|xxx|desnudo|semen|coger|pene|vagina|orgy)\b/i;
        if (palabrasNsfw.test(msg.text)) {
            await bot.deleteMessage(chatId, msg.message_id).catch(() => {});
            return;
        }
    }
});

// ==========================================
// SERVIDOR WEB
// ==========================================
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SPYCT.BOT operativo.\n');
}).listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
