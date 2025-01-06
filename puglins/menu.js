export const menu = {
  command: ['.menu', '/menu', '!menu'],
  description: 'Mostrar menú principal',
  async run(sock, m) {
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
    await sock.sendMessage(m.chat, { text: menuMessage })
  }
} 
