export class ApiClient {
    constructor({ baseUrl }) {
        this.baseUrl = baseUrl;
        this.token = null;
    }

    async getToken() {
        const res = await fetch(`${this.baseUrl}/auth/login`, {
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
        return this.token;
    }

    async get(endpoint) {
        if (!this.token) {
            await this.getToken();
        }

        const res = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.token}`,
            },
        });

        if (!res.ok) throw new Error("Error en fetch: " + res.status);
        return res.json();
    }

}
