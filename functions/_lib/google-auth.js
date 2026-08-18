import { bufToBase64Url } from "./crypto-utils.js";

function pemToArrayBuffer(pem) {
    let clean = pem
        .replace(/-----BEGIN PRIVATE KEY-----/, "")
        .replace(/-----END PRIVATE KEY-----/, "")
        .replace(/\s/g, "");
    let binary = atob(clean);
    let bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}

export async function getGoogleAccessToken(env) {

    let privateKeyPem = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
    let clientEmail = env.FIREBASE_CLIENT_EMAIL;

    let now = Math.floor(Date.now() / 1000);

    let header = { alg: "RS256", typ: "JWT" };
    let claims = {
        iss: clientEmail,
        scope: "https://www.googleapis.com/auth/datastore",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now
    };

    let encodedHeader = bufToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
    let encodedClaims = bufToBase64Url(new TextEncoder().encode(JSON.stringify(claims)));
    let unsignedToken = encodedHeader + "." + encodedClaims;

    let cryptoKey = await crypto.subtle.importKey(
        "pkcs8",
        pemToArrayBuffer(privateKeyPem),
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
    );

    let signature = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        cryptoKey,
        new TextEncoder().encode(unsignedToken)
    );

    let jwt = unsignedToken + "." + bufToBase64Url(signature);

    let response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + jwt
    });

    let data = await response.json();

    if (!data.access_token) {
        throw new Error("Gagal mendapat access token Google: " + JSON.stringify(data));
    }

    return data.access_token;

}
