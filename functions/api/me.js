import { verifySessionToken } from "../_lib/crypto-utils.js";

export async function onRequestGet(context) {

    const { request, env } = context;

    let cookieHeader = request.headers.get("Cookie") || "";
    let match = cookieHeader.match(/nexus_session=([^;]+)/);

    if (!match) {
        return new Response(JSON.stringify({ loggedIn: false }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    let data = await verifySessionToken(match[1], env.SESSION_SECRET);

    if (!data) {
        return new Response(JSON.stringify({ loggedIn: false }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ loggedIn: true, username: data.username }), {
        headers: { "Content-Type": "application/json" }
    });

}
