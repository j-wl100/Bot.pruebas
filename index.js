const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const http = require('http');

// Servidor HTTP para cumplir con el requisito de puertos de Render
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ZENITH BOT - ONLINE\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[SYS_PORT] Servidor web activo en el puerto ${PORT}`);
});

async function connectToWhatsApp() {
    // Usamos una carpeta de sesión nueva para evitar que arrastre datos viejos
    const { state, saveCreds } = await useMultiFileAuthState('sesion_zenith_nueva');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: Browsers.macOS("Chrome"),
        logger: pino({ level: 'silent' })
    });

    // Código de emparejamiento por número de teléfono
    if(!sock.authState.creds.registered) {
        // REEMPLAZA ESTE NÚMERO con tu número secundario (código de país + número, sin espacios ni signos, ej: 52155XXXXXXXX)
        const phoneNumber = "5218671691201"; 
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                console.log(`\n========================================`);
                console.log(`[SYS_PAIRING] CÓDIGO DE VINCULACIÓN: ${code}`);
                console.log(`========================================\n`);
            } catch(err) {
                console.log('[SYS_ERROR] Error al solicitar el código:', err.message);
            }
        }, 6000);
    }

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
        
        if (messageText.toLowerCase() === '!menu') {
            await sock.sendMessage(sender, { 
                text: '⟨ ☩ ⟩ **ZENITH // SISTEMA CENTRAL**\n\n' +
                      '🔹 `!ping` - Verifica el estado del núcleo.\n' +
                      '🔹 `!zenith` - Protocolo de identidad.' 
            });
        }
    });
}

connectToWhatsApp();
