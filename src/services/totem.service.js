const BASE_URL = process.env.NEXT_PUBLIC_BASE_TOTEM;
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const IP_RED_TOTEM = process.env.NEXT_PUBLIC_IP_RED_TOTEM;
const UBICACION_TOTEM = process.env.NEXT_PUBLIC_UBICACION_TOTEM;

export async function getIp() {
  try {
    // const res = await fetch(`${BASE_URL}/get_ip`, {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });

    // if (!res.ok) throw new Error("Error obteniendo IP: " + res.status);

    // const data = await res.json();
    const data = {
      ip: IP_RED_TOTEM,
      ubicacion: UBICACION_TOTEM,
    };

    return data;
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

export async function getTotemConfig(id) {
  try {
    const CONFIG_URL = process.env.NEXT_PUBLIC_TOTEM_CONFIG_URL || "https://api.wit.la/totem-config";
    
    // Simulación de delay para UX
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulación de datos basados en el ID (Placeholder hasta tener el endpoint)
    if (id === "1001") {
      return {
        ip: "192.168.1.100",
        ubicacion: "Estación Central - Baño A"
      };
    } else {
      return {
        ip: "10.0.0.1",
        ubicacion: `Ubicación Totem ${id}`
      };
    }
  } catch (err) {
    console.error("[totemService] getTotemConfig error:", err);
    throw err;
  }
}
