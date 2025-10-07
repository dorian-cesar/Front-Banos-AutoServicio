import { getToken, setToken } from "@/utils/session";
import { getCredentials } from "./totem.service";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_REMOTO;

// Lock para evitar múltiples renovaciones simultáneas
let refreshingPromise = null;

async function login(email, password) {
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) throw new Error("Error en login: " + res.status);

        const data = await res.json();
        return data; // { token, ... }
    } catch (err) {
        console.error("[banioService] login error:", err);
        throw err;
    }
}

async function safeFetch(endpoint, options = {}) {
    try {
        return await fetch(endpoint, options);
    } catch (err) {
        // redirigir / reintentar o propagar
        console.error("[banioService] network fetch error:", err);
        throw err;
    }
}

async function fetchWithToken(endpoint, options = {}, { maxRefreshAttempts = 1 } = {}) {
    let token = getToken();

    const doFetch = async (tokenToUse) => {
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            ...(tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {}),
        };

        // merge options but ensure headers merged correctly
        const opts = { ...options, headers };
        return safeFetch(endpoint, opts);
    };

    // intento inicial
    let res;
    try {
        res = await doFetch(token);
    } catch (err) {
        // fallo de red en el primer intento
        throw err;
    }

    // si 401 -> renovar una vez (o hasta maxRefreshAttempts)
    if (res && res.status === 401 && maxRefreshAttempts > 0) {
        // Si ya hay una renovación en curso, espera esa promesa
        if (refreshingPromise) {
            try {
                await refreshingPromise;
            } catch (e) {
                // la renovación falló
                // continuar para intentar renovar localmente abajo
            }
            token = getToken();
            res = await doFetch(token);
        } else {
            // crea la promesa de renovación
            refreshingPromise = (async () => {
                try {
                    console.log("[banioService] Token expirado, reautenticando...");
                    const creds = await getCredentials();
                    const loginResp = await login(creds.email, creds.password);
                    if (!loginResp || !loginResp.token) throw new Error("Login no devolvió token");
                    setToken(loginResp.token, loginResp.user);
                    return loginResp.token;
                } finally {
                    // al terminar, limpiar refreshingPromise (se hace en finally)
                }
            })();

            try {
                const newToken = await refreshingPromise;
                token = newToken;
            } catch (err) {
                // renovación falló
                refreshingPromise = null;
                throw new Error("No se pudo renovar token: " + (err.message || err));
            } finally {
                refreshingPromise = null;
            }

            // reintentar la petición con el token nuevo
            try {
                res = await doFetch(token);
            } catch (err) {
                throw err;
            }
        }
    }

    if (!res) throw new Error("[banioService] No response from server");

    if (!res.ok) {
        // leer body si es json para debug
        let message = `Status ${res.status}`;
        try {
            const errBody = await res.text();
            message += ` - ${errBody}`;
        } catch (e) { }
        throw new Error(`[banioService] Error en fetch ${endpoint}: ${message}`);
    }

    // parsear JSON seguro
    try {
        return await res.json();
    } catch (err) {
        // respuesta no JSON
        const text = await res.text().catch(() => null);
        return text;
    }
}

// exportar servicios que usan fetchWithToken
export async function getServicios() {
    return fetchWithToken(`${BASE_URL}/servicios`, { method: "GET" });
}

export async function postVentas(payload) {
    if (!payload || typeof payload !== "object") {
        throw new Error("postVentas requiere un objeto payload");
    }

    // aseguramos que el body sea JSON
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    };

    return fetchWithToken(`${BASE_URL}/ventas`, options);
}