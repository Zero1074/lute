// config.js
const config = {
    owner: ['TuNúmero@s.whatsapp.net'], // Reemplaza con tu número
    packname: 'Bot-MD',
    author: 'Tu Nombre',
    prefix: '.',  // Prefijo para los comandos
    botName: 'Tu Bot'
}

module.exports = config

// index.js
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const pino = require('pino')
const { join } = require('path')
const { existsSync, mkdirSync } = require('fs')

// Asegurar que existan las carpetas necesarias
const AUTH_DIR = './auth_info'
const TEMP_DIR = './temp'
if (!existsSync(AUTH_DIR)) mkdirSync(AUTH_DIR)
if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR)

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ['Bot-MD', 'Chrome', '1.0.0']
    })

    // Guardar credenciales cuando se actualicen
    sock.ev.on('creds.update', saveCreds)

    // Manejar conexión
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Conexión cerrada por:', lastDisconnect?.error?.message)
            if(shouldReconnect) startBot()
        } else if(connection === 'open') {
            console.log('¡Bot conectado correctamente!')
        }
    })

    // Manejar mensajes
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        const m = messages[0]
        if (!m.message) return
        
        const messageType = Object.keys(m.message)[0]
        const body = (messageType === 'conversation') ? 
            m.message.conversation :
            (messageType === 'extendedTextMessage') ?
            m.message.extendedTextMessage.text : ''
        
        // Comando de prueba
        if (body === '.ping') {
            await sock.sendMessage(m.key.remoteJid, { text: '¡Pong! 🏓' })
        }
    })
}

// Iniciar el bot
startBot()
