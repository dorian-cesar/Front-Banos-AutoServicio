const BASE_URL = process.env.NEXT_PUBLIC_BASE_TOTEM;

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
        // Llamamos a nuestro endpoint interno de Next.js que usa el token privado
        const res = await fetch("/api/totem-credentials");
        if (!res.ok) throw new Error("Error obteniendo credenciales: " + res.status);
        return res.json();
    } catch (err) {
        console.error("[ipService] getCredentials error:", err);
        throw err;
    }
}