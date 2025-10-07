const BASE_URL = process.env.NEXT_PUBLIC_BASE_TOTEM;
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export async function getIp() {
    try {
        const res = await fetch(`${BASE_URL}/get_ip`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Error obteniendo IP: " + res.status);

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("[ipService] getIp error:", err);
        throw err;
    }
}

export async function getCredentials() {
    try {
        const res = await fetch(`${BASE_URL}/get_credentials`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-auth": TOKEN,
            },
        });
        if (!res.ok) throw new Error("Error obteniendo credenciales: " + res.status);
        return res.json();
    } catch (err) {
        console.error("[ipService] getCredentials error:", err);
        throw err;
    }
}