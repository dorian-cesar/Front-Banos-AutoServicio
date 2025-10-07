import https from "https";
import fetch from "node-fetch"; // <- node-fetch permite usar https.Agent

const BASE_URL = process.env.NEXT_PUBLIC_BASE_TOTEM;
const TOKEN = process.env.API_TOKEN;

export async function GET() {

  try {
    const agent = new https.Agent({ rejectUnauthorized: false });

    const response = await fetch(`${BASE_URL}/get_credentials`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-auth": TOKEN, // token correcto
      },
      agent,
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Error obteniendo credenciales: ${response.status}` }),
        { status: response.status }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("[API] getCredentials error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
