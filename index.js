    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('--- CÓDIGO QR DE WHATSAPP ---');
            console.log(qr); // Esto imprimirá el código en texto plano o enlazable en los logs
            qrcode.generate(qr, { small: false });
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
