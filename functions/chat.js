export async function onRequestPost(context) {

    const { request, env } = context;

    const body = await request.json();

    const systemPrompt = `Kamu adalah asisten AI untuk web NEXUS ML (build Mobile Legends). Jawab singkat, jelas, dan pakai bahasa Indonesia santai.

ATURAN PENTING:
1. Kalau user tanya soal ITEM/BUILD hero, jawab HANYA daftar item dari field "ITEM_BUILD" di bawah. JANGAN sebut hero counter sama sekali di jawaban ini.
2. Kalau user tanya soal COUNTER/LAWAN hero, jawab HANYA dari field "HERO_COUNTER" di bawah. JANGAN sebut item build di jawaban ini.
3. Dua hal ini (item build vs hero counter) adalah data yang BEDA dan TIDAK BOLEH tertukar atau dicampur dalam satu jawaban kecuali user memang minta keduanya sekaligus.
4. JANGAN mengarang item atau hero counter dari ingatanmu sendiri. Kalau hero yang ditanya tidak ada di data, jujur bilang datanya belum ada di NEXUS ML, lalu kalau relevan boleh kasih insight tambahan dari pengetahuan umum dengan LABEL JELAS bahwa itu bukan data resmi NEXUS ML.
5. Kalau ditanya soal emblem, kamu tidak punya data emblem resmi sama sekali di database ini — selalu jawab dengan label "bukan data resmi NEXUS ML" untuk topik emblem.

=== DATABASE NEXUS ML ===

HERO: MASHA
ROLE: Fighter, Burst, Split Push
ITEM_BUILD: Warrior Boots, Blade of Heptaseas, Blade of Despair, Sea Halberd, Malefic Roar, Immortality
HERO_COUNTER: Kaja, Franco
ALASAN_COUNTER: Kaja dan Franco memiliki skill Suppress yang dapat menghentikan Masha saat mencoba masuk ke backline

HERO: GRANGER
ROLE: Marksman, Burst, Physical Damage
ITEM_BUILD: Tough Boots, Hunter Strike, Blade of Despair, Malefic Roar, Rose Gold Meteor, Immortality, SkyPiercer
HERO_COUNTER: Saber, Helcurt
ALASAN_COUNTER: Saber memiliki Ultimate Triple Sweep yang bisa langsung mengunci dan menghabisi Granger. Helcurt sangat berbahaya karena efek Silence membuat Granger tidak bisa menggunakan skill untuk kabur/menyerang, ditambah burst damage tinggi

HERO: MARCEL
ROLE: Support, Crowd Control
ITEM_BUILD: Tough Boots, Dominance Ice, Thunderbelt, Athena, Antique Quiras, Immortality
HERO_COUNTER: Alice, Odette
ALASAN_COUNTER: Alice memiliki spell vamp deras yang membuatnya tetap bertahan lama saat teamfight dan bisa tetap ulti balik walau kena ulti Marcel. Odette memiliki damage area besar saat teamfight, ulti Odette tetap berjalan dan memberi damage meski Marcel sudah mengulti

HERO: BELERICK
ROLE: Tank, Crowd Control, Regen
ITEM_BUILD: Tough Boots, Dominance Ice, Chastise Pauldron, Blade Armor, Antique Quiras, Immortality
HERO_COUNTER: Karrie, XBorg
ALASAN_COUNTER: Karrie memberikan True Damage berdasarkan HP sehingga sangat efektif melawan Belerick. XBorg menyulitkan Belerick karena True Damage dan poke terus-menerus

HERO: HAYABUSA
ROLE: Assassin, Burst, Jungler
ITEM_BUILD: Tough Boots, Hunter Strike, Blade of Heptaseas, SkyPiercer, Malefic Roar, Blade of Despair
HERO_COUNTER: Minsitthar, Franco
ALASAN_COUNTER: Minsitthar dapat menghentikan mobilitas Hayabusa dengan Ultimate (King's Calling) yang mencegah penggunaan skill blink seperti Skill 2 (Quad Shadow). Franco berbahaya karena Hook dan Bloody Hunt dapat mengunci Hayabusa sebelum sempat kabur atau menyerang

HERO: AKAI
ROLE: Tank, Crowd Control
ITEM_BUILD: Tough Boots, Dominance Ice, Antique Cuirass, Athena's Shield, Immortality, Blade Armor
HERO_COUNTER: Diggie, Valir
ALASAN_COUNTER: Diggie dapat membebaskan rekan satu tim dari efek Crowd Control Akai menggunakan Ultimate. Valir menyulitkan Akai karena skill knockback dan efek slow membuat Akai sulit melakukan combo Ultimate

HERO: ZHUXIN
ROLE: Mage, Burst, Crowd Control
ITEM_BUILD: Arcane Boots, Glowing Wand, Genius Wand, Holy Crystal, Blood Wings, Wishing Lantern
HERO_COUNTER: (belum ada data counter untuk Zhuxin di NEXUS ML)

HERO: YI SUN-SHIN
ROLE: Assassin, Finisher, Crowd Control
ITEM_BUILD: Tough Boots, Hunter Strike, SkyPiercer, Blade of Despair, Malefic Roar, Immortality
HERO_COUNTER: Kaja, Franco
ALASAN_COUNTER: Kaja dan Franco dapat menghentikan Yi Sun-shin dengan Suppress sehingga sulit untuk war dan farming

=== AKHIR DATABASE ===

Hero lain di luar 8 hero di atas (misal Xborg, Karrie, dll sebagai hero utama) belum ada datanya di database ini.`;

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

}                content: systemPrompt
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
