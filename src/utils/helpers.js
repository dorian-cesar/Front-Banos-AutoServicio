export function voucher(
    codigoComercio, 
    formattedDate, 
    formattedTime, 
    terminalId, 
    cardNumber, 
    cardType, 
    monto, 
    accountNumber, 
    operationNumber, 
    tipo, 
    authCode, 
    numero_cuota,
    tipo_cuota,
    monto_cuota ) {
    if (numero_cuota) {
        const content =                                     
            '                                          \n' +
            '                                          \n' +
            '              COMPROBANTE DE VENTA\n' +
            '                                          \n' +
            '                   EMPRESA123\n' +
            '          Direccion calle 1, Comuna ABC\n' +
            // `CODIGO DE COMERCIO: ${codigoComercio}\n` +
            '                    CIUDAD123\n' +
            '                                          \n' +
            `                  FECHA: ${formattedDate}\n` +
            `                    HORA: ${formattedTime}\n` +
            // `TERMINAL: ${terminalId}\n` +
            '                                          \n' +
            // `NUMERO DE TARJETA: **${cardNumber}\n` +
            // `TIPO DE TARJETA: ${cardType}\n` +
            `                    TOTAL: $${monto}\n` +
            `                  NUMERO DE CUOTAS: ${numero_cuota}\n` +
            `               TIPO DE CUOTAS: ${tipo_cuota}\n` +
            `                    MONTO CUOTA: $${monto_cuota}\n` +
            // `NUMERO DE BOLETA: ${accountNumber}\n` +
            `                 NUMERO DE OPERACION: ${operationNumber}\n` +
            `                   SERVICIO: ${tipo}\n` +
            `                 AUTORIZACION: ${authCode}\n` +
            '                                          \n' +
            '                GRACIAS POR SU COMPRA\n' +
            '                   VALIDO COMO BOLETA\n';

        return content;
    } else {
        const content =
            '\n'+
            '\n'+
            'COMPROBANTE DE VENTA\n' +
            '\n' +
            'EMPRESA123\n' +
            'Direccion calle 1, Comuna ABC\n' +
            // `CODIGO DE COMERCIO: ${codigoComercio}\n` +
            'CIUDAD123\n' +
            '\n' +
            `FECHA: ${formattedDate}\n` +
            `HORA: ${formattedTime}\n` +
            // `TERMINAL: ${terminalId}\n` +
            '\n' +
            // `NUMERO DE TARJETA: **${cardNumber}\n` +
            // `TIPO DE TARJETA: ${cardType}\n` +
            `TOTAL: $${monto}\n` +
            // `NUMERO DE BOLETA: ${accountNumber}\n` +
            `NUMERO DE OPERACION: ${operationNumber}\n` +
            `SERVICIO: ${tipo}\n` +
            `AUTORIZACION: ${authCode}\n` +
            '\n' +
            'GRACIAS POR SU COMPRA\n' +
            'VALIDO COMO BOLETA\n';

        return content;
    }

}

export function generateCode(length = 6) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(36)[0]).join("");
}