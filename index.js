const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const http = require('http');
const readline = require('readline');

// Servidor HTTP para Render
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ZENITH BOT - ONLINE\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[SYS_PORT] Servidor web activo en el puerto ${PORT}`);
});

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: Browsers.macOS("Chrome"), // Simula un navegador para evitar bloqueos
        logger: pino({ level: 'silent' })
    });

    // Si quieres vincular por código de emparejamiento (opcional si no quieres QR)
    if(!sock.authState.creds.registered) {
        // Puedes poner tu número aquí con código de país (ej: 521XXXXXXXXXX para México)
        const phoneNumber = "AQUÍ_TU_NUMERO_CON_CODIGO_DE_PAIS"; 
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                console.log(`[SYS_PAIRING] Tu código de vinculación es: ${code}`);
            } catch(err) {
                console.log('Error al solicitar código:', err);
            }
        }, 4000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('=== ESCANEA ESTE QR O USA EL CÓDIGO ===');
            // Si el QR se genera en texto plano legible:
            console.log(qr);
        }

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
    });
}

connectToWhatsApp();
