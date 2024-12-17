import readlineSync from 'readline-sync';
import qrcode from 'qrcode-terminal';

function generateEightDigitCode() {
    // Genera un código aleatorio de 8 dígitos
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateQRCode() {
    // Simula un código QR de WhatsApp (en realidad, esto sería generado por el protocolo real de WhatsApp)
    const mockQRData = 'https://wa.me/whatsapp-connection-qr';
    
    return new Promise((resolve, reject) => {
        qrcode.generate(mockQRData, {small: true}, (qrCodeText) => {
            console.log(qrCodeText);
            resolve();
        });
    });
}

async function main() {
    console.log("Selecciona una opción de conexión para WhatsApp:");
    console.log("1. Generar Código de 8 Dígitos");
    console.log("2. Generar Código QR");

    const opcion = readlineSync.questionInt('Introduce el número de opción (1 o 2): ');

    switch(opcion) {
        case 1:
            const codigo = generateEightDigitCode();
            console.log(`Tu código de conexión es: ${codigo}`);
            break;
        case 2:
            console.log("Generando Código QR...");
            await generateQRCode();
            break;
        default:
            console.log("Opción inválida. Por favor, selecciona 1 o 2.");
    }
}

// Ejecutar el programa principal
main().catch(error => {
    console.error("Ocurrió un error:", error);
});
