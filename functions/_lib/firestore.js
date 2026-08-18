import { getGoogleAccessToken } from "./google-auth.js";

const BASE = "https://firestore.googleapis.com/v1/projects";

export async function getUserDoc(env, usernameLower) {

    let token = await getGoogleAccessToken(env);
    let url = BASE + "/" + env.FIREBASE_PROJECT_ID + "/databases/(default)/documents/users/" + usernameLower;

    let response = await fetch(url, {
        headers: { "Authorization": "Bearer " + token }
    });

    if (response.status === 404) return null;

    let data = await response.json();
    return data;

}

export async function createUserDoc(env, usernameLower, fields) {

    let token = await getGoogleAccessToken(env);
    let url = BASE + "/" + env.FIREBASE_PROJECT_ID + "/databases/(default)/documents:commit";

    let firestoreFields = {};
    for (let key in fields) {
        let val = fields[key];
        if (typeof val === "string") firestoreFields[key] = { stringValue: val };
        else if (typeof val === "number") firestoreFields[key] = { integerValue: String(val) };
    }

    let body = {
        writes: [
            {
                update: {
                    name: "projects/" + env.FIREBASE_PROJECT_ID + "/databases/(default)/documents/users/" + usernameLower,
                    fields: firestoreFields
                },
                currentDocument: { exists: false }
            }
        ]
    };

    let response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (response.status === 200) return { ok: true };

    let errData = await response.json();
    return { ok: false, error: errData };

}

export function extractFields(doc) {
    if (!doc || !doc.fields) return null;
    let result = {};
    for (let key in doc.fields) {
        let f = doc.fields[key];
        if (f.stringValue !== undefined) result[key] = f.stringValue;
        else if (f.integerValue !== undefined) result[key] = parseInt(f.integerValue);
    }
    return result;
}
