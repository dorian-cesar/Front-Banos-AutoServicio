import { NextResponse } from 'next/server';

function appendBytes(arr1, arr2) {
    const merged = new Uint8Array(arr1.length + arr2.length);
    merged.set(arr1);
    merged.set(arr2, arr1.length);
    return merged;
}

function stringToEscPos(content) {
    const encoder = new TextEncoder();
    let escPos = new Uint8Array(0);

    // 1️⃣ Inicializar impresora
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x40])); // ESC @

    // 2️⃣ Precalentamiento (alineación a la izquierda)
    escPos = appendBytes(escPos, encoder.encode('\n\n\n\n\n\n')); // 6 líneas de calentamiento
    escPos = appendBytes(escPos, new Uint8Array([0x00, 0x00, 0x00]));

    // 3️⃣ Centrar solo contenido principal
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x01])); // Centrar
    escPos = appendBytes(escPos, encoder.encode(content + '\n'));

    // 4️⃣ Reset alineación a izquierda
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x00]));

    return escPos;
}

function generateQrCodeEscPos(qrData) {
    let escPos = new Uint8Array(0);
    const encoder = new TextEncoder();

    // Comando para QR Code en impresoras ESC/POS
    // 1. Establecer tamaño del módulo QR
    escPos = appendBytes(escPos, new Uint8Array([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x08]));

    // 2. Establecer corrección de error (nivel L ~7%)
    escPos = appendBytes(escPos, new Uint8Array([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31]));

    // 3. Almacenar datos QR
    const dataLength = qrData.length + 3;
    const pL = dataLength % 256;
    const pH = Math.floor(dataLength / 256);

    escPos = appendBytes(escPos, new Uint8Array([0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30]));
    escPos = appendBytes(escPos, encoder.encode(qrData));

    // 4. Imprimir QR Code
    escPos = appendBytes(escPos, new Uint8Array([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]));

    return escPos;
}

function qrToEscPos(qrData) {
    let escPos = new Uint8Array(0);
    const encoder = new TextEncoder();

    // Centrar QR
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x01])); // Centrar

    // Espacio antes del QR
    escPos = appendBytes(escPos, encoder.encode('\n\n'));

    // Generar QR
    escPos = appendBytes(escPos, generateQrCodeEscPos(qrData));

    // Espacio después del QR
    escPos = appendBytes(escPos, encoder.encode('\n\n'));

    // Texto debajo del QR
    escPos = appendBytes(escPos, encoder.encode('Código: ' + qrData + '\n'));

    // Reset alineación
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x00]));

    return escPos;
}

function voucherWithQrToEscPos(content, qrData) {
    let escPos = new Uint8Array(0);
    const encoder = new TextEncoder();

    // 1️⃣ Inicializar impresora
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x40]));

    // 2️⃣ Precalentamiento
    escPos = appendBytes(escPos, encoder.encode('\n\n\n\n\n\n'));
    escPos = appendBytes(escPos, new Uint8Array([0x00, 0x00, 0x00]));

    // 3️⃣ Imprimir voucher centrado
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x01])); // Centrar
    escPos = appendBytes(escPos, encoder.encode(content + '\n'));
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x00])); // Reset

    // 4️⃣ Corte parcial (avanzar papel sin cortar)
    // escPos = appendBytes(escPos, new Uint8Array([0x0A, 0x0A, 0x1D, 0x56, 0x00])); // 3 líneas en blanco

    // 6️⃣ QR centrado
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x01])); // Centrar
    escPos = appendBytes(escPos, generateQrCodeEscPos(qrData));
    escPos = appendBytes(escPos, encoder.encode('\n'));

    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x00])); // Reset

    // 8️⃣ Corte final
    escPos = appendBytes(escPos, new Uint8Array([0x0A, 0x0A, 0x1D, 0x56, 0x00]));

    return escPos;
}

function uint8ToBase64(uint8arr) {
    let binary = '';
    for (let i = 0; i < uint8arr.length; i++) {
        binary += String.fromCharCode(uint8arr[i]);
    }
    return Buffer.from(binary, 'binary').toString('base64');
}

export async function POST(req) {
    try {
        const data = await req.json();

        if (!data) {
            return NextResponse.json({ error: "Faltan datos para imprimir" }, { status: 400 });
        }

        let escPosData;

        if (data.content && data.qrData) {
            // Imprimir voucher con QR
            escPosData = voucherWithQrToEscPos(data.content, data.qrData);
        } else if (data.content) {
            // Imprimir solo texto (comportamiento original)
            escPosData = stringToEscPos(data.content);
        } else if (data.qrData) {
            // Imprimir solo QR
            escPosData = qrToEscPos(data.qrData);
        } else {
            return NextResponse.json({ error: "Faltan datos para imprimir" }, { status: 400 });
        }

        const base64 = uint8ToBase64(escPosData);

        return NextResponse.json({ rawbt: `rawbt:base64,${base64}` });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error al generar impresión" }, { status: 500 });
    }
}