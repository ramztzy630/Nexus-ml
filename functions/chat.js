export async function onRequestPost(context) {

    const { request, env } = context;

    const body = await request.json();

    const systemPrompt = `Kamu adalah asisten AI untuk web NEXUS ML (build Mobile Legends). Jawab singkat, jelas, dan pakai bahasa Indonesia santai.

ATURAN PENTING:
1. Untuk pertanyaan soal BUILD/ITEM hero, WAJIB pakai HANYA data resmi di bawah ini. JANGAN mengarang item dari ingatan kamu sendiri, karena data build MLBB berubah tiap patch dan ingatanmu bisa sudah usang/salah.
2. Kalau hero yang ditanya BELUM ada di daftar data di bawah, bilang jujur: "Build untuk hero itu belum ada di database NEXUS ML, coba cek langsung di halaman hero-nya atau tanya hal lain." JANGAN mengarang build untuknya.
3. Untuk pertanyaan di luar build (tips gameplay umum, penjelasan skill, dll), boleh jawab dari pengetahuan umum kamu, tapi tetap beri catatan kalau itu bukan data resmi NEXUS ML kalau relevan.

=== DATA BUILD RESMI NEXUS ML ===

MASHA (Fighter)
Build: Tough Boots, Hunter Strike, Blade of Despair, Malefic Roar, Rose Gold Meteor, Immortality
Counter hero: Kaja, Franco (keduanya punya skill Suppress yang menghentikan Masha saat mencoba masuk ke backline)

GRANGER (Marksman)
Build: Tough Boots, Hunter Strike, Blade of Despair, Malefic Roar, Rose Gold Meteor, Immortality, SkyPiercer
Counter hero: Saber (Ultimate Triple Sweep bisa mengunci dan menghabisi Granger), Helcurt (efek Silence membuat Granger tidak bisa menggunakan skill untuk kabur/menyerang, ditambah burst damage tinggi)

MARCEL (Support)
Build: Athena, Antique Quiras, Immortality
Counter hero: Alice (spell vamp deras membuatnya tetap bertahan dan bisa ulti balik walau kena ulti Marcel), Odette (damage area besar saat Marcel mengeluarkan ulti, ulti Odette tetap jalan dan memberi damage)

=== AKHIR DATA ===

Hero lain (Hayabusa, Zhuxin, Akai, Belerick, Yi Sun-shin, Hirara) belum punya data build resmi di sistem ini.`;

    const payload = {
        model: "nvidia/nemotron-3.5-lightning:free",
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            ...(body.messages ? body.messages.filter(m => m.role !== "system") : [])
        ]
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + env.OPENROUTER_API_KEY,
            "HTTP-Referer": "https://nexus-eaq.pages.dev",
            "X-Title": "NEXUS ML"
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
    });

}
