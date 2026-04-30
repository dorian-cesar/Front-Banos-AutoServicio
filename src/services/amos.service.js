const getIpFromStorage = () => localStorage.getItem("ip");

export async function checkPosStatus() {
  const ip = getIpFromStorage();
  if (!ip) throw new Error("No hay IP en localStorage");

  //   const res = await fetch(`https://${ip}:3000/monitor`, {
  //     method: "GET",
  //     headers: { "Content-Type": "application/json" },
  //   });

  //   if (!res.ok)
  //     throw new Error("Error al obtener estado del POS: " + res.status);

  //   const data = await res.json();
  const data = {
    success: true,
    server: true,
  };

  return data.success && data.server; // true si está online, false si no
}

export async function postPayment(payload) {
  const ip = getIpFromStorage();
  if (!ip) throw new Error("No hay IP en localStorage");

  // === MODO SIMULACIÓN: RETORNO DE PAGO APROBADO ===
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  // const mockResponse = {
  //   message: "Venta aprobada",
  //   data: {
  //     approved: true,
  //     rawData: {
  //       realDate: "290426",
  //       realTime: "133000",
  //       amount: payload.amount,
  //       commerceCode: "597012345678",
  //       terminalId: "TERM001",
  //       last4Digits: "1234",
  //       cardType: "DEBITO",
  //       operationNumber: "000123",
  //       authorizationCode: "123456",
  //       accountNumber: "---",
  //       shareType: "SIN CUOTA",
  //       sharesNumber: "0",
  //       sharesAmount: "0",
  //       responseMessage: "APROBADO",
  //     },
  //   },
  // };

  // return mockResponse;

  // === CÓDIGO DE PRODUCCIÓN ===
  const res = await fetch(`https://${ip}:3000/api/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log("res payment:", res);

  if (!res.ok) throw new Error("Error al enviar la venta: " + res.status);

  const data = await res.json();
  return data;
}
