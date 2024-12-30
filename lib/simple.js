import * as baileys from "@whiskeysockets/baileys";

export function makeWASocket(connectionConfig) {
    return baileys.makeWASocket({
        ...connectionConfig,
        getMessage: async (key) => {
            return { conversation: "Mensaje no encontrado" };
        }
    });
}

export function serialize() {
    return {};
}

export const protoType = () => {};
