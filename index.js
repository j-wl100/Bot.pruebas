const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log('Conexión cerrada. Reconectando...', shouldReconnect);
            if(shouldReconnect) {
                connectToWhatsApp();
            }
        } else if(connection === 'open') {
            console.log('[SYS_ONLINE] Bot conectado exitosamente a WhatsApp.');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (!messageText) return;

        if (messageText.toLowerCase() === '!ping') {
            await sock.sendMessage(sender, { text: '[SYS_STATUS] ▋ En línea y operando con normalidad.' });
        }

        if (messageText.toLowerCase() === '!juego') {
            await sock.sendMessage(sender, { text: '⟨ ☩ ⟩ Acceso a la zona de juego de la comunidad.' });
        }
    });
}

connectToWhatsApp();
