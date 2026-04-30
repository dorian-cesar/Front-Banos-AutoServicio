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

async function handleRefresh() {
  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async () => {
    try {
      console.log("[banioService] Autenticando...");
      const creds = await getCredentials();
      const loginResp = await login(creds.email, creds.password);
      if (!loginResp || !loginResp.token)
        throw new Error("Login no devolvió token");
      setToken(loginResp.token, loginResp.user);
      return loginResp.token;
    } finally {
      // Se limpia abajo
    }
  })();

  try {
    return await refreshingPromise;
  } finally {
    refreshingPromise = null;
  }
}

async function fetchWithToken(
  endpoint,
  options = {},
  { maxRefreshAttempts = 1 } = {},
) {
  let token = getToken();

  const doFetch = async (tokenToUse) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {}),
    };

    const opts = { ...options, headers };
    return safeFetch(endpoint, opts);
  };

  // 1) Si no hay token, intentar obtenerlo antes de la primera petición
  if (!token && maxRefreshAttempts > 0) {
    try {
      token = await handleRefresh();
    } catch (err) {
      console.warn(
        "[banioService] No se pudo obtener token inicial:",
        err.message,
      );
    }
  }

  let res;
  try {
    res = await doFetch(token);
  } catch (err) {
    throw err;
  }

  // 2) Si 401 -> renovar y reintentar una vez
  if (res && res.status === 401 && maxRefreshAttempts > 0) {
    try {
      token = await handleRefresh();
      res = await doFetch(token);
    } catch (err) {
      console.error("[banioService] Error reintentando tras 401:", err);
      // si el reintento falla, res seguirá siendo el 401 o el error del doFetch
    }
  }

  if (!res) throw new Error("[banioService] No response from server");

  if (!res.ok) {
    let message = `Status ${res.status}`;
    try {
      const errBody = await res.text();
      message += ` - ${errBody}`;
    } catch (e) {}
    throw new Error(`[banioService] Error en fetch ${endpoint}: ${message}`);
  }

  try {
    return await res.json();
  } catch (err) {
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
