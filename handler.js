import { readdirSync, statSync } from "fs"
import { join, resolve } from "path"
import { fileURLToPath } from "url"
import chalk from "chalk"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default async function handler(sock, m) {
    try {
        // Solo procesar mensajes de texto
        if (!m.message?.conversation) return
        
        const texto = m.message.conversation.toLowerCase()
        
        // Procesar comandos
        if (texto.startsWith('/')) {
            const comando = texto.slice(1).trim()
            
            switch(comando) {
                case 'menu':
                    await sock.sendMessage(m.key.remoteJid, { 
                        text: 'Hola! Soy Lute Bot\nComandos disponibles:\n/menu - Muestra este menú' 
                    })
                    break
                    
                default:
                    await sock.sendMessage(m.key.remoteJid, { 
                        text: 'Comando no reconocido' 
                    })
            }
        } else {
            // Responder "hola" a mensajes que no son comandos
            await sock.sendMessage(m.key.remoteJid, { 
                text: "hola" 
            })
        }
    } catch (e) {
        console.error(chalk.red('[ERROR] '), e)
        await sock.sendMessage(m.key.remoteJid, { 
            text: 'Ocurrió un error al procesar el comando' 
        })
    }
}

// Función para cargar comandos dinámicamente (para futuras expansiones)
const loadCommands = () => {
    const commandsDir = join(__dirname, 'plugins')
    const commands = new Map()
    
    const getFiles = (dir) => {
        const files = readdirSync(dir)
        for (const file of files) {
            const filePath = join(dir, file)
            if (statSync(filePath).isDirectory()) {
                getFiles(filePath)
                continue
            }
            if (file.endsWith('.js')) {
                const command = require(filePath)
                commands.set(command.name, command)
            }
        }
    }
    
    if (existsSync(commandsDir)) {
        getFiles(commandsDir)
    }
    
    return commands
}
