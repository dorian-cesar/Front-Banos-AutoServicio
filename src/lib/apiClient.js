// src/lib/apiClient.js
export class ApiClient {
    constructor({ baseUrl }) {
        this.baseUrl = baseUrl;
        this.token = null;
    }

    async fetchToken() {
        try {
            const url = `${this.baseUrl}/auth/login`;
            console.log('[ApiClient] fetchToken ->', url);
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: process.env.NEXT_PUBLIC_TOTEM_USER,
                    password: process.env.NEXT_PUBLIC_TOTEM_PASSWORD,
                }),
            });

            if (!res.ok) throw new Error("Error autenticando totem: " + res.status);
            const data = await res.json();
            this.token = data.token;
            if (typeof window !== "undefined" && window.localStorage) {
                try { localStorage.setItem("token", data.token); } catch (e) { console.warn("localStorage fallo", e); }
            }
            return this.token;
        } catch (err) {
            console.error('[ApiClient] fetchToken error:', err);
            throw err; // lo dejamos subir para que el llamador lo vea
        }
    }

    getTokenFromStorage() {
        if (this.token) return this.token;
        if (typeof window !== "undefined" && window.localStorage) {
            this.token = localStorage.getItem("token");
        }
        return this.token;
    }

    async readToken() {
        const t = this.getTokenFromStorage();
        if (t) return t;
        return this.fetchToken();
    }

    async request(endpoint, options = {}) {
        // 1) Asegurarse de tener token (readToken puede lanzar)
        try {
            await this.readToken();
        } catch (err) {
            throw new Error('No se pudo obtener token: ' + (err.message || err));
        }

        // 2) Construir URL y opciones
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
            ...(options.headers || {}),
        };

        const fetchOptions = {
            ...options,
            headers,
        };

        // si el método es GET, asegurarse de no enviar body (evita preflight raro)
        if ((fetchOptions.method || 'GET').toUpperCase() === 'GET') {
            delete fetchOptions.body;
        }

        // 3) Ejecutar fetch con try/catch para capturar errores de red
        let res;
        try {
            console.log('[ApiClient] fetch ->', url, fetchOptions.method || 'GET');
            res = await fetch(url, fetchOptions);
        } catch (err) {
            // aquí cae "Failed to fetch" u otros errores de red
            console.error('[ApiClient] fetch network error:', err);
            // devolvemos un Error descriptivo para depuración en el componente
            throw new Error('NetworkError: ' + (err.message || err));
        }

        // 4) Manejar 401 -> intentar renovar token y reintentar una vez
        if (res.status === 401) {
            console.warn('[ApiClient] 401 recibido, renovando token y reintentando...');
            this.token = null;
            try {
                await this.fetchToken();
            } catch (e) {
                throw new Error('No se pudo renovar token tras 401: ' + (e.message || e));
            }

            const retryOpts = { ...fetchOptions, headers: { ...headers, Authorization: `Bearer ${this.token}` } };
            const retry = await fetch(url, retryOpts);
            if (!retry.ok) throw new Error("Error en fetch (retry): " + retry.status);
            return retry.json();
        }

        if (!res.ok) {
            // intentar leer body para más info (si viene JSON)
            let text;
            try { text = await res.text(); } catch (_) { text = ''; }
            throw new Error(`Error en fetch: ${res.status} ${res.statusText} ${text}`);
        }

        // parsear JSON (si el endpoint no retorna JSON, puede fallar)
        try {
            return await res.json();
        } catch (err) {
            console.warn('[ApiClient] respuesta no JSON:', err);
            return null;
        }
    }

    async get(endpoint) { return this.request(endpoint, { method: "GET" }); }
    async post(endpoint, body) { return this.request(endpoint, { method: "POST", body: JSON.stringify(body) }); }
}
