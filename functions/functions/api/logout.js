export async function onRequestPost(context) {

    let response = new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
    });

    response.headers.append(
        "Set-Cookie",
        "nexus_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
    );

    return response;

}
