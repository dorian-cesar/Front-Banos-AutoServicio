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

function generateBarcodeEscPos(barcodeData, barcodeType = 'CODE128') {
    let escPos = new Uint8Array(0);
    const encoder = new TextEncoder();

    // Configuración del código de barras
    escPos = appendBytes(escPos, new Uint8Array([0x1D, 0x68, 0x50])); // GS h n - Altura del código de barras (80 puntos)
    escPos = appendBytes(escPos, new Uint8Array([0x1D, 0x77, 0x02])); // GS w n - Ancho del módulo (2 puntos)
    escPos = appendBytes(escPos, new Uint8Array([0x1D, 0x48, 0x02])); // GS H n - Mostrar texto debajo del código (0x02 = abajo)

    // Comando Code128: GS k m d1...dk NUL
    const barcodeContent = `{B${barcodeData}`;

    // La longitud debe incluir el prefijo {B
    escPos = appendBytes(escPos, new Uint8Array([0x1D, 0x6B, 0x49, barcodeContent.length]));
    escPos = appendBytes(escPos, encoder.encode(barcodeContent));
    // El terminador 0x00 es necesario para Code128
    escPos = appendBytes(escPos, new Uint8Array([0x00]));

    return escPos;
}

function barcodeToEscPos(barcodeData, barcodeType = 'CODE128') {
    let escPos = new Uint8Array(0);
    const encoder = new TextEncoder();

    // Inicializar impresora
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x40]));

    // Centrar código de barras
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x01])); // Centrar

    // Espacio antes del código de barras
    escPos = appendBytes(escPos, encoder.encode('\n\n'));

    // Generar código de barras
    escPos = appendBytes(escPos, generateBarcodeEscPos(barcodeData, barcodeType));

    // Espacio después del código de barras
    escPos = appendBytes(escPos, encoder.encode('\n\n'));

    // Texto debajo del código de barras
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x01])); // Centrar
    escPos = appendBytes(escPos, encoder.encode('Codigo: ' + barcodeData + '\n'));
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x00])); // Reset

    // Corte final
    escPos = appendBytes(escPos, new Uint8Array([0x0A, 0x0A, 0x1D, 0x56, 0x00]));

    return escPos;
}

function voucherWithBarcodeToEscPos(content, barcodeData, barcodeType = 'CODE128') {
    let escPos = new Uint8Array(0);
    const encoder = new TextEncoder();

    // 1️⃣ Inicializar impresora
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x40]));

    // 2️⃣ Precalentamiento
    escPos = appendBytes(escPos, encoder.encode('\n\n\n\n\n\n'));
    escPos = appendBytes(escPos, new Uint8Array([0x00, 0x00, 0x00]));

    // 3️⃣ Imprimir voucher (texto normal, no centrado para mejor formato)
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x00])); // Alineación izquierda
    escPos = appendBytes(escPos, encoder.encode(content + '\n\n'));

    // 4️⃣ Separador
    // escPos = appendBytes(escPos, encoder.encode("--------------------------------\n"));

    // 5️⃣ Código de barras centrado
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x01])); // Centrar
    escPos = appendBytes(escPos, generateBarcodeEscPos(barcodeData, barcodeType));
    escPos = appendBytes(escPos, encoder.encode('\n'));

    // 6️⃣ Texto del código
    escPos = appendBytes(escPos, encoder.encode('Codigo: ' + barcodeData + '\n\n'));
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x00])); // Reset

    // 7️⃣ Mensaje final centrado
    escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x01])); // Centrar
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

        // Compatibilidad con qrData y barcodeData
        const barcodeData = data.barcodeData || data.qrData;

        if (data.content && barcodeData) {
            // Imprimir voucher con código de barras
            escPosData = voucherWithBarcodeToEscPos(
                data.content,
                barcodeData,
                data.barcodeType || 'CODE128'
            );
        } else if (data.content) {
            // Imprimir solo texto (comportamiento original)
            escPosData = stringToEscPos(data.content);
        } else if (barcodeData) {
            // Imprimir solo código de barras
            escPosData = barcodeToEscPos(
                barcodeData,
                data.barcodeType || 'CODE128'
            );
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