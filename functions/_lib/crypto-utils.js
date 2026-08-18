// ============ BASE64URL HELPERS ============

export function bufToBase64Url(buf) {
    let bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlToBuf(str) {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    let binary = atob(base64);
    let bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}

// ============ PASSWORD HASHING (PBKDF2) ============

export async function hashPassword(password) {

    let salt = crypto.getRandomValues(new Uint8Array(16));

    let keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    let derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    );

    return {
        salt: bufToBase64Url(salt),
        hash: bufToBase64Url(derivedBits)
    };

}

export async function verifyPassword(password, saltB64, hashB64) {

    let salt = new Uint8Array(base64UrlToBuf(saltB64));

    let keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    let derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    );

    let computedHash = bufToBase64Url(derivedBits);

    return computedHash === hashB64;

}

// ============ SESSION TOKEN (HMAC SIGNED) ============

export async function createSessionToken(payloadObj, secret) {

    let payload = bufToBase64Url(new TextEncoder().encode(JSON.stringify(payloadObj)));

    let key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    let signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));

    return payload + "." + bufToBase64Url(signature);

}

export async function verifySessionToken(token, secret) {

    if (!token || token.indexOf(".") === -1) return null;

    let parts = token.split(".");
    let payload = parts[0];
    let signature = parts[1];

    let key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );

    let valid = await crypto.subtle.verify(
        "HMAC",
        key,
        base64UrlToBuf(signature),
        new TextEncoder().encode(payload)
    );

    if (!valid) return null;

    let data = JSON.parse(new TextDecoder().decode(base64UrlToBuf(payload)));

    if (data.exp && Date.now() > data.exp) return null;

    return data;

      }
