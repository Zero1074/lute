import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'
import { Boom } from '@hapi/boom'

async function startBot() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
        
        const sock = makeWASocket.default({
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: 'silent' })
        })

        sock.ev.on('creds.update', saveCreds)

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update
            
            if(connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom) && 
                    lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                    
                console.log('Conexión cerrada debido a ', lastDisconnect?.error?.message)
                
                if(shouldReconnect) {
                    startBot()
                }
            } else if(connection === 'open') {
                console.log('Bot conectado exitosamente!')
            }
        })

        sock.ev.on('messages.upsert', async ({ messages }) => {
            const m = messages[0]
            if (!m.message) return
            
            if (m.message?.conversation === '.ping') {
                await sock.sendMessage(m.key.remoteJid, { text: 'Pong! 🏓' })
            }
        })

    } catch (error) {
        console.error('Error al iniciar el bot:', error)
    }
}

// Iniciar el bot
startBot()
