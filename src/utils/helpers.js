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
  monto_cuota,
) {
  const content =
    "                                          \n" +
    "                                          \n" +
    "              COMPROBANTE DE VENTA\n" +
    "               VENTA COPIA CLIENTE\n" +
    "           INMOBILIARIA E INVERSIONES\n" +
    "                   P Y R S.A\n" +
    "               RUT: 96.971.370-5\n" +
    "        SAN BORJA N1251, ESTACION CENTRAL\n" +
    "                Santiago - Chile\n" +
    // `CODIGO DE COMERCIO: ${codigoComercio}\n` +
    "                                          \n" +
    `               FECHA: ${formattedDate}\n` +
    `                 HORA: ${formattedTime}\n` +
    // `TERMINAL: ${terminalId}\n` +
    "                                          \n" +
    // `NUMERO DE TARJETA: **${cardNumber}\n` +
    // `TIPO DE TARJETA: ${cardType}\n` +
    `                 TOTAL: $${monto}\n` +
    `               NUMERO DE CUOTAS: ${numero_cuota}\n` +
    `            TIPO DE CUOTAS: ${tipo_cuota}\n` +
    `                 MONTO CUOTA: $${monto_cuota}\n` +
    // `NUMERO DE BOLETA: ${accountNumber}\n` +
    `             NUMERO DE OPERACION: ${operationNumber}\n` +
    `                SERVICIO: ${tipo}\n` +
    `               AUTORIZACION: ${authCode}\n` +
    "                                          \n" +
    "             GRACIAS POR SU COMPRA\n" +
    "               VALIDO COMO BOLETA\n";

  return content;
}

export async function generateCode(length = 6) {
  let isAvailable = false;
  let code = "";

  while (!isAvailable) {
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    code = "";
    for (let i = 0; i < length; i++) {
      code += (array[i] % 10).toString();
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_USER}/getUser.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pin: code }),
        },
      );

      const data = await res.json();

      // code -22 significa "Persona no existe", por lo tanto el PIN está disponible
      if (data.code === -22) {
        isAvailable = true;
        console.log("usuario generado disponible", data);
      } else {
        console.log(
          `Código ${code} no disponible (code: ${data.code}), reintentando...`,
        );
      }
    } catch (err) {
      console.error("Error validando código:", err);
      // En caso de error de red, podríamos reintentar o lanzar error.
      // Por seguridad para no quedar en bucle si el API falla, lanzamos error.
      throw new Error("No se pudo validar la disponibilidad del código");
    }
  }

  return code;
}
