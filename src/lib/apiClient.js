// src/lib/apiClient.js
export class ApiClient {
    constructor({ baseUrl } = {}) {
        this.baseUrl = baseUrl;
        this.token = null;
    }

    async fetchToken(baseUrl = this.baseUrl) {
        try {
            const url = `${baseUrl}/auth/login`;
            console.log('[ApiClient] fetchToken ->', url);
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: process.env.NEXT_PUBLIC_TOTEM_USER,
                    password: process.env.NEXT_PUBLIC_TOTEM_PASSWORD,
                }),
            });

            if (!res.ok) throw new Error("Error autenticando: " + res.status);
            const data = await res.json();
            this.token = data.token;

            if (typeof window !== "undefined" && window.localStorage) {
                try {
                    localStorage.setItem("token", data.token);
                } catch (e) {
                    console.warn("localStorage fallo", e);
                }
            }
            return this.token;
        } catch (err) {
            console.error('[ApiClient] fetchToken error:', err);
            throw err;
        }
    }

    clearToken() {
        this.token = null;
        if (typeof window !== "undefined" && window.localStorage) {
            try {
                localStorage.removeItem("token");
                console.log("[ApiClient] Token eliminado de localStorage");
            } catch (e) {
                console.warn("localStorage fallo al borrar token", e);
            }
        }
    }

    getTokenFromStorage() {
        if (this.token) return this.token;
        if (typeof window !== "undefined" && window.localStorage) {
            this.token = localStorage.getItem("token");
        }
        return this.token;
    }

    async readToken(baseUrl = this.baseUrl) {
        const t = this.getTokenFromStorage();
        if (t) return t;
        return this.fetchToken(baseUrl);
    }

    async request(endpoint, options = {}, customBaseUrl = null) {
        const base = customBaseUrl || this.baseUrl;

        // Para endpoints que no requieren token (como /get_ip, /monitor)
        const noAuthEndpoints = ['/get_ip', '/monitor'];
        const requiresAuth = !noAuthEndpoints.some(ep => endpoint.includes(ep));

        if (requiresAuth) {
            try {
                await this.readToken(base);
            } catch (err) {
                throw new Error('No se pudo obtener token: ' + (err.message || err));
            }
        }

        const url = `${base}${endpoint}`;
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        };

        // Solo agregar Authorization si requiere autenticación y tenemos token
        if (requiresAuth && this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        const fetchOptions = {
            ...options,
            headers,
        };

        if ((fetchOptions.method || 'GET').toUpperCase() === 'GET') {
            delete fetchOptions.body;
        }

        let res;
        try {
            res = await fetch(url, fetchOptions);
        } catch (err) {
            throw new Error('NetworkError: ' + (err.message || err));
        }

        if (res.status === 401 && requiresAuth) {
            console.log('[ApiClient] 401, refrescando token...');
            this.clearToken()
            await this.readToken(base);
            const retryHeaders = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.token}`,
                ...(options.headers || {})
            };
            const retryOpts = {
                ...options,
                headers: retryHeaders
            };
            const retryRes = await fetch(url, retryOpts);
            if (!retryRes.ok) throw new Error("Error en fetch (retry): " + retryRes.status);
            return retryRes.json();
        }

        if (!res.ok) {
            let text;
            try { text = await res.text(); } catch (_) { text = ''; }
            throw new Error(`Error en fetch: ${res.status} ${res.statusText} ${text}`);
        }

        try {
            return await res.json();
        } catch (_) {
            return null;
        }
    }

    async get(endpoint, customBaseUrl) {
        return this.request(endpoint, { method: "GET" }, customBaseUrl);
    }

    async post(endpoint, body, customBaseUrl) {
        return this.request(endpoint, { method: "POST", body: JSON.stringify(body) }, customBaseUrl);
    }
}