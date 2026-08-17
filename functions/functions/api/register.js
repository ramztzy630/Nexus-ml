import { hashPassword } from "../_lib/crypto-utils.js";
import { createUserDoc } from "../_lib/firestore.js";

export async function onRequestPost(context) {

    const { request, env } = context;
    const body = await request.json();

    let username = (body.username || "").trim();
    let password = body.password || "";
    let confirmPassword = body.confirmPassword || "";

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return jsonResponse({ error: "Username harus 3-20 karakter, hanya huruf, angka, dan underscore." }, 400);
    }

    if (password.length < 6) {
        return jsonResponse({ error: "Password minimal 6 karakter." }, 400);
    }

    if (password !== confirmPassword) {
        return jsonResponse({ error: "Konfirmasi password tidak cocok." }, 400);
    }

    let usernameLower = username.toLowerCase();

    let { salt, hash } = await hashPassword(password);

    let result = await createUserDoc(env, usernameLower, {
    username: username,
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: Date.now()
});

    if (!result.ok) {
    return jsonResponse({ error: "Username sudah digunakan." }, 409);
}

    return jsonResponse({ success: true, message: "Registrasi berhasil, silakan login." });

}

function jsonResponse(obj, status) {
    return new Response(JSON.stringify(obj), {
        status: status || 200,
        headers: { "Content-Type": "application/json" }
    });
}
