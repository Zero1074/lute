

// plugins/menu.js
export async function menu(sock, m) {
    await sock.sendMessage(m.key.remoteJid, {
        text: "Hola! Soy Lute Bot\nComandos disponibles:\n/menu - Muestra este menú"
    });
}

// plugins/general.js
export async function general(sock, m) {
    await sock.sendMessage(m.key.remoteJid, {
        text: "hola"
    });
}
