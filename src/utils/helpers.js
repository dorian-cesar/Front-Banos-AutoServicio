const url = "https://andenes.terminal-calama.com/TerminalCalama/PHP/Restroom";

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
    monto_cuota) {
    const content =
        '                                          \n' +
        '                                          \n' +
        '              COMPROBANTE DE VENTA\n' +
        '                                          \n' +
        '                  EMPRESA123\n' +
        '           Direccion calle 1, Comuna ABC\n' +
        // `CODIGO DE COMERCIO: ${codigoComercio}\n` +
        '                  CIUDAD123\n' +
        '                                          \n' +
        `               FECHA: ${formattedDate}\n` +
        `                 HORA: ${formattedTime}\n` +
        // `TERMINAL: ${terminalId}\n` +
        '                                          \n' +
        // `NUMERO DE TARJETA: **${cardNumber}\n` +
        // `TIPO DE TARJETA: ${cardType}\n` +
        `                 TOTAL: $${monto}\n` +
        `               NUMERO DE CUOTAS: ${numero_cuota}\n` +
        `            TIPO DE CUOTAS: ${tipo_cuota}\n` +
        `                 MONTO CUOTA: $${monto_cuota}\n` +
        // `NUMERO DE BOLETA: ${accountNumber}\n` +
        `              NUMERO DE OPERACION: ${operationNumber}\n` +
        `                SERVICIO: ${tipo}\n` +
        `              AUTORIZACION: ${authCode}\n` +
        '                                          \n' +
        '             GRACIAS POR SU COMPRA\n' +
        '               VALIDO COMO BOLETA\n';

    return content;
}

export function generateCode(length = 6) {
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let code = '';
    for (let i = 0; i < length; i++) {
        code += (array[i] % 10).toString();
    }

    return code;
}

export async function addUser(token) {
    const userData = { pin: token, idNo: token };

    try {
        let response = await fetch(`${url}/addUser.php`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        let result = await response.text();
        console.log("Respuesta de addUser:", result);
    } catch (error) {
        console.error("Error al agregar usuario:", error);
    }
}

// Función para asignar niveles de acceso al usuario
export async function addUserAccessLevel(token) {
    const accessData = { pin: token };

    try {
        let response = await fetch(`${url}/addLevelUser2.php`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(accessData),
        });

        let result = await response.text();
        console.log("Respuesta de addLevelUser2:", result);
    } catch (error) {
        console.error("Error al asignar niveles de acceso:", error);
    }
}

export async function createUser(token) {
    try {
        console.log('Creando usuario en sistema de torniquete:', token);

        // Primero crear el usuario
        await addUser(token);

        // Luego asignar niveles de acceso
        await addUserAccessLevel(token);

        return true;
    } catch (error) {
        console.error('Error al crear usuario en sistema de torniquete:', error);
        throw new Error('No se pudo crear el acceso en el sistema del torniquete');
    }
};