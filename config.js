import { 
  makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys'
import makeWASocket from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import fs from 'fs'
import chalk from 'chalk'
import P from 'pino'

const logger = P({ level: 'silent' })

async function connectWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('session')
  const { version, isLatest } = await fetchLatestBaileysVersion()

  console.log(chalk.green(`Usando versión de Baileys: ${version}`))
  console.log(chalk.yellow(`¿Es la última versión? ${isLatest}`))

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: state,
    browser: ['Lute Bot MD', 'Chrome', '4.0.0']
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log(chalk.yellow('Escanea el código QR con tu WhatsApp'))
    }

    if (connection === 'close') {
      const shouldReconnect = 
        (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== 
        DisconnectReason.loggedOut

      console.log(
        chalk.red('Conexión cerrada por: '), 
        lastDisconnect?.error,
        chalk.yellow(`Reconectando: ${shouldReconnect}`)
      )

      if (shouldReconnect) {
        connectWhatsApp()
      }
    }

    if (connection === 'open') {
      console.log(chalk.green('Bot conectado exitosamente ✓'))
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0]
      if (!msg.message) return

      const sender = msg.key.remoteJid
      const text = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text || ''

      console.log(chalk.blue('Mensaje recibido:'), text)

      // Comando .menu
      if (text.toLowerCase() === '.menu') {
        const menuMessage = `
*🤖 Lute Bot MD - Menú Principal 🤖*

👋 ¡Bienvenido! Aquí están mis comandos:

*INFORMACIÓN*
• .menu - Muestra este menú
• .ping - Verificar estado del bot

*DIVERSIÓN*
• .dado - Lanza un dado
• .verdad - Juego de verdad
• .reto - Juego de reto

*UTILIDADES*
• .sticker - Convierte imagen a sticker
• .imagen - Genera imágenes con IA
`

        await sock.sendMessage(sender, { text: menuMessage })
      }

      // Comando .ping
      if (text.toLowerCase() === '.ping') {
        const start = Date.now()
        await sock.sendMessage(sender, { text: '_Calculando ping..._ ⏳' })
        const end = Date.now()
        await sock.sendMessage(sender, { 
          text: `*Pong!* 🏓\nTiempo de respuesta: *${end - start}ms*` 
        })
      }

    } catch (error) {
      console.error(chalk.red('Error procesando mensaje:'), error)
    }
  })

  return sock
}

connectWhatsApp().catch(console.error)
