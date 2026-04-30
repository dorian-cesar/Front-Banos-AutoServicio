const URL_DB = process.env.NEXT_PUBLIC_BASE_REMOTO;

export async function getIp(totemId) {
  try {
    const res = await fetch(`${URL_DB}/dispositivos/${totemId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      // Si no es JSON y no es ok, lanzamos error genérico
      if (!res.ok) throw new Error("Error en servidor: " + res.status);
      throw parseErr;
    }

    if (!res.ok || data.ok === false) {
      throw new Error(data.message || "Error al obtener configuración");
    }

    return data.data;
  } catch (err) {
    console.error("[ipService] getIp error:", err);
    throw err;
  }
}

export async function getCredentials() {
  try {
    // const res = await fetch(`${BASE_URL}/get_credentials`, {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-api-auth": TOKEN,
    //   },
    // });
    // if (!res.ok)
    //   throw new Error("Error obteniendo credenciales: " + res.status);
    const res = { email: "totem1@wit.la", password: "L@n8.dFg!2qW9$zXpK7*" };
    // return res.json();
    return res;
  } catch (err) {
    console.error("[ipService] getCredentials error:", err);
    throw err;
  }
}
