const getIpFromStorage = () => localStorage.getItem("ip");

export async function checkPosStatus() {
    const ip = getIpFromStorage();
    if (!ip) throw new Error("No hay IP en localStorage");

    const res = await fetch(`https://${ip}:3000/monitor`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Error al obtener estado del POS: " + res.status);

    const data = await res.json();
    return data.success && data.server; // true si está online, false si no
}


export async function postPayment(payload) {
    const ip = getIpFromStorage();
    if (!ip) throw new Error("No hay IP en localStorage");

    const res = await fetch(`https://${ip}:3000/api/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Error al enviar la venta: " + res.status);

    const data = await res.json();
    return data;
}