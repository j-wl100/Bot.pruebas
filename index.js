const TelegramBot = require('node-telegram-bot-api');

// Usa la variable de entorno de Render o pon tu token directo aquí si prefieres pruebas locales
const token = process.env.TELEGRAM_TOKEN || 'TU_TOKEN_DE_BOTFATHER_AQUI';
const bot = new TelegramBot(token, { polling: true });

console.log("🔥 SPYCT.BOT está encendido y listo en el sistema...");

// ==========================================
// DICCIONARIO DE MENÚS (Puedes editar los textos aquí libremente)
// ==========================================

const menus = {
    menu: (user) => `▉          𝗦𝗣𝖸Ɔ𝖳.𝓑𝐎꓄     
      
%＿＿         𝗕𝖨𝖾𝗇𝗏𝖾𝗇𝗂𝖽x      #!?    𝖠𝗅 𝗺𝗲𝗻𝘂 𝗉𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅  

!▛      solicitado por @${user}          𔖢𔖢

〓©꯭           𝗘𝖢ꄲ𝖭Ө𝖬Ｉ𝖠 
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

〓©꯭     𝗠 𝖤 ℕɄ  𝖢𝗢𝖬𝖯𝖫𝖤꓄Ø 
 ⏤    𝖯ᴀʀᴀ ᴠᴇʀ ʟᴏ𝘴 ᴄᴏᴍᴀɴᴅᴏ𝙨 ᴜsᴀ
/menu_completo

〓©꯭          𝗠ꄲ𝖣𝗘Я𝖠匚꒐ӨΝ
 ⏤    𝖯ᴀʀᴀ ᴠᴇʀ ʟᴏ𝘴 ᴄᴏᴍᴀɴْدᴏs ᴜsᴀ 
/menu_moderacion

#𝖲𝗈𝗇 𝗈𝗇𝗅𝗒 𝖺𝖽𝗆𝗂𝗇s`,

    menu_economia: `〓©꯭           𝗘𝖢ꄲ𝖭Ө𝖬Ｉ𝖠 

/apostar - cantidad
/diaro - reclama
/trabajar  [puesto]
/robar  @user
/banco [cantidad] 
/transferir @user [cantidad]
/balance 
/top @me/all
/loteria 
/crimen
/invertir
/minar`,

    menu_perfil: `〓©꯭          𝗣𝖤ꋪ𝖥𝖨L‌  

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
/regalo @user [regalo]`,

    menu_games: `〓©꯭          𝗚 𝖠 ᛖ𝐄ֆ

/caraocruz [cantidad] [cara o cruz]
/dado [cantidad]
/ppt [piedra/papel/tijera] [@user]
/trivia
/adivinanza
/reto
/chiste
/frase
/ruleta
/ahorcado`,

    menu_random: `〓©꯭           𝗥𝗔ℕ𝖣Ø𝖬   

/clima [ciudad/pais]
/hora [pais/ciudad]
/distancia [lugar uno/lugar dos]
/calculadora [cifra]
/estadísticas 
/significado [palabra]
/traducir - idioma [texto]
/wiki [busqueda] 
/elegir [opcion/opcion]
/sticker [imagen]`,

    menu_enlaces: `»      🔗     |───────────  ●●  ┘

/reglas
/web_oficial -> [Inserta tu enlace aquí]
/cuenta_tiktok -> [Inserta tu enlace aquí]
/community_whatsapp -> [Inserta tu enlace aquí]
/canal_oficial -> [Inserta tu enlace aquí]
/canal_codigos -> [Inserta tu enlace aquí]

─────────────────────┘`,

    menu_moderacion: `〓©꯭          𝗠ꄲ𝖣𝗘Я𝖠匚꒐ӨΝ

/ban @user
/unban @user
/mute  @user [tiempo]
/unmute @user
/onlyadmin on
/onlyadmin off
/warn @user [razón]
/unwarn  @user 
/cerrar
/abrir
/antispam 
/antispam off
/antinsfw on
/antinstw off
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
/ping`,

    menu_completo: (user) => `▉          𝗦𝗣𝖸Ɔ𝖳.𝓑𝐎꓄     
      
%＿＿         𝗕𝖨𝖾𝗇𝗏𝖾𝗇𝗂𝖽x       #!?    𝖠𝗅 𝗺𝗲𝗻𝘂 𝖼𝗈𝗆𝗉𝗅𝖾𝗍𝗈   

!▛      solicitado por @${user}          𔖢𔖢

〓©꯭           𝗘𝖢ꄲ𝖭Ө𝖬Ｉ𝖠 

/apostar - cantidad
/diaro - reclama
/trabajar  [puesto]
/robar  @user
/banco [cantidad] 
/transferir @user [cantidad]
/balance 
/top @me/all
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
/hora [pais/cuidad]
/distancia [lugar uno/lugar dos]
/calculadora [sifra]
/estadísticas 
/significado [palabra]
/traducir - idioma [texto]
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
/mute  @user [tiempo]
/unmute @user
/onlyadmin on
/onlyadmin off
/warn @user [razón]
/unwarn  @user 
/cerrar
/abrir
/antispam 
/antispam off
/antinsfw on
/antinstw off
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
/ping`
};

// ==========================================
// CONFIGURACIÓN DE RESPUESTAS A COMANDOS
// ==========================================

bot.onText(/\/menu(?!\S)/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name;
    bot.sendMessage(chatId, menus.menu(username));
});

bot.onText(/\/menu_economia/, (msg) => {
    bot.sendMessage(msg.chat.id, menus.menu_economia);
});

bot.onText(/\/menu_perfil/, (msg) => {
    bot.sendMessage(msg.chat.id, menus.menu_perfil);
});

bot.onText(/\/menu_games/, (msg) => {
    bot.sendMessage(msg.chat.id, menus.menu_games);
});

bot.onText(/\/menu_random/, (msg) => {
    bot.sendMessage(msg.chat.id, menus.menu_random);
});

bot.onText(/\/menu_enlaces/, (msg) => {
    bot.sendMessage(msg.chat.id, menus.menu_enlaces);
});

bot.onText(/\/menu_moderacion/, (msg) => {
    bot.sendMessage(msg.chat.id, menus.menu_moderacion);
});

bot.onText(/\/menu_completo/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name;
    bot.sendMessage(chatId, menus.menu_completo(username));
});
