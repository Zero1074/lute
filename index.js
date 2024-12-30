import { createRequire } from "module";
import path, { join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { platform } from "os";
import { createInterface } from "readline";
import { setupMaster, fork } from "cluster";
import { watchFile, unwatchFile } from "fs";
import chalk from "chalk";
import { makeWASocket, protoType, serialize } from "./lib/simple.js";
import { Low, JSONFile } from "lowdb";
import pino from "pino";
import * as baileys from "@whiskeysockets/baileys";

const rl = createInterface(process.stdin, process.stdout);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const database = new Low(new JSONFile("database.json"));

// Inicio del Bot
async function startBot() {
    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
    });

    // Manejador de mensajes
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        
        // Solo procesar mensajes de tipo texto
        if (m.message?.conversation) {
            const text = m.message.conversation.toLowerCase();
            
            // Manejar comando /menu
            if (text === "/menu") {
                await sock.sendMessage(m.key.remoteJid, { 
                    text: "Hola! Soy Lute Bot\nComandos disponibles:\n/menu - Muestra este menú" 
                });
            }
            // Responder "hola" a cualquier otro mensaje
            else {
                await sock.sendMessage(m.key.remoteJid, { 
                    text: "hola" 
                });
            }
        }
    });

    // Manejador de conexión
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== baileys.DisconnectReason.loggedOut;
            console.log("Conexión cerrada debido a", lastDisconnect.error, "Reconectando:", shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === "open") {
            console.log(chalk.green("Bot conectado!"));
        }
    });
}
// ... (imports anteriores)
import handler from "./handler.js"

// En el evento messages.upsert:
sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    await handler(sock, m)
})
// Crear archivo de base de datos si no existe
await database.read();
database.data ||= { users: [] };
await database.write();

// Iniciar el bot
startBot().catch(console.error);
