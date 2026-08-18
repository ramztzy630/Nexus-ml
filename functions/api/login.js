import { verifyPassword, createSessionToken } from "../_lib/crypto-utils.js";
import { getUserDoc, extractFields } from "../_lib/firestore.js";

export async function onRequestPost(context) {

    const { request, env } = context;
    const body = await request.json();

    let username = (body.username || "").trim();
    let password = body.password || "";

    if (!username || !password) {
        return jsonResponse({ error: "Username dan password wajib diisi." }, 400);
    }

    let usernameLower = username.toLowerCase();

    let doc = await getUserDoc(env, usernameLower);

    if (!doc) {
        return jsonResponse({ error: "Username atau password salah." }, 401);
    }

    let fields = extractFields(doc);

    let valid = await verifyPassword(password, fields.passwordSalt, fields.passwordHash);

    if (!valid) {
        return jsonResponse({ error: "Username atau password salah." }, 401);
    }

    let sessionToken = await createSessionToken(
        { username: fields.username, exp: Date.now() + (7 * 24 * 60 * 60 * 1000) },
        env.SESSION_SECRET
    );

    let response = jsonResponse({ success: true, username: fields.username });

    response.headers.append(
        "Set-Cookie",
        "nexus_session=" + sessionToken + "; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800"
    );

    return response;

}

function jsonResponse(obj, status) {
    return new Response(JSON.stringify(obj), {
        status: status || 200,
        headers: { "Content-Type": "application/json" }
    });
}
