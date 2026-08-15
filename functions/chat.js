export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();

    const systemPrompt =
"Kamu adalah asisten AI untuk web NEXUS ML (build Mobile Legends). " +
"Jawab singkat, jelas, dan pakai bahasa Indonesia santai.\n\n" +

"ATURAN UTAMA:\n" +
"1. DATABASE NEXUS ML adalah sumber utama untuk data yang sudah tersedia.\n" +
"2. Kalau user menanyakan ITEM/BUILD hero yang ADA di DATABASE NEXUS ML, gunakan HANYA ITEM_BUILD dari database. Jangan mengganti atau mengarang item.\n" +
"3. Kalau user menanyakan COUNTER/LAWAN hero yang ADA di DATABASE NEXUS ML, gunakan HANYA HERO_COUNTER dari database.\n" +
"4. ITEM_BUILD dan HERO_COUNTER adalah data yang berbeda. Jangan mencampurnya kecuali user memang meminta keduanya.\n" +
"5. Kalau hero yang ditanyakan TIDAK ADA di database, gunakan WEB SEARCH untuk mencari informasi terbaru.\n" +
"6. Kalau menggunakan WEB SEARCH, beri tahu user bahwa informasi tersebut berasal dari pencarian web dan BUKAN data resmi DATABASE NEXUS ML.\n" +
"7. Jangan mengarang data. Kalau hasil web tidak jelas atau sumbernya tidak cukup terpercaya, katakan bahwa informasinya belum dapat dipastikan.\n" +
"8. Untuk pertanyaan tentang EMBLEM, DATABASE NEXUS ML tidak memiliki data emblem resmi. Jika perlu, gunakan WEB SEARCH untuk mencari informasi terbaru dan beri label bahwa itu bukan data resmi NEXUS ML.\n" +
"9. Untuk informasi Mobile Legends yang bisa berubah karena patch/update, prioritaskan informasi terbaru dari web jika memang diperlukan.\n" +
"10. Jangan melakukan web search jika pertanyaan sudah bisa dijawab dengan jelas menggunakan DATABASE NEXUS ML.\n\n" +

"=== DATABASE NEXUS ML ===\n\n" +

"HERO: MASHA\n" +
"ROLE: Fighter, Burst, Split Push\n" +
"ITEM_BUILD: Warrior Boots, Blade of Heptaseas, Blade of Despair, Sea Halberd, Malefic Roar, Immortality\n" +
"HERO_COUNTER: Kaja, Franco\n" +
"ALASAN_COUNTER: Kaja dan Franco memiliki skill Suppress yang dapat menghentikan Masha saat mencoba masuk ke backline\n\n" +

"HERO: GRANGER\n" +
"ROLE: Marksman, Burst, Physical Damage\n" +
"ITEM_BUILD: Tough Boots, Hunter Strike, Blade of Despair, Malefic Roar, Rose Gold Meteor, Immortality, SkyPiercer\n" +
"HERO_COUNTER: Saber, Helcurt\n" +
"ALASAN_COUNTER: Saber memiliki Ultimate Triple Sweep yang bisa langsung mengunci dan menghabisi Granger. Helcurt sangat berbahaya karena efek Silence membuat Granger tidak bisa menggunakan skill untuk kabur atau menyerang, ditambah burst damage tinggi\n\n" +

"HERO: MARCEL\n" +
"ROLE: Support, Crowd Control\n" +
"ITEM_BUILD: Tough Boots, Dominance Ice, Thunderbelt, Athena, Antique Quiras, Immortality\n" +
"HERO_COUNTER: Alice, Odette\n" +
"ALASAN_COUNTER: Alice memiliki spell vamp deras yang membuatnya tetap bertahan lama saat teamfight dan bisa tetap ulti balik walau kena ulti Marcel. Odette memiliki damage area besar saat teamfight, ulti Odette tetap berjalan dan memberi damage meski Marcel sudah mengulti\n\n" +

"HERO: BELERICK\n" +
"ROLE: Tank, Crowd Control, Regen\n" +
"ITEM_BUILD: Tough Boots, Dominance Ice, Chastise Pauldron, Blade Armor, Antique Quiras, Immortality\n" +
"HERO_COUNTER: Karrie, XBorg\n" +
"ALASAN_COUNTER: Karrie memberikan True Damage berdasarkan HP sehingga sangat efektif melawan Belerick. XBorg menyulitkan Belerick karena True Damage dan poke terus-menerus\n\n" +

"HERO: HAYABUSA\n" +
"ROLE: Assassin, Burst, Jungler\n" +
"ITEM_BUILD: Tough Boots, Hunter Strike, Blade of Heptaseas, SkyPiercer, Malefic Roar, Blade of Despair\n" +
"HERO_COUNTER: Minsitthar, Franco\n" +
"ALASAN_COUNTER: Minsitthar dapat menghentikan mobilitas Hayabusa dengan Ultimate King's Calling yang mencegah penggunaan skill blink seperti Skill 2 Quad Shadow. Franco berbahaya karena Hook dan Bloody Hunt dapat mengunci Hayabusa sebelum sempat kabur atau menyerang\n\n" +

"HERO: AKAI\n" +
"ROLE: Tank, Crowd Control\n" +
"ITEM_BUILD: Tough Boots, Dominance Ice, Antique Cuirass, Athena's Shield, Immortality, Blade Armor\n" +
"HERO_COUNTER: Diggie, Valir\n" +
"ALASAN_COUNTER: Diggie dapat membebaskan rekan satu tim dari efek Crowd Control Akai menggunakan Ultimate. Valir menyulitkan Akai karena skill knockback dan efek slow membuat Akai sulit melakukan combo Ultimate\n\n" +

"HERO: ZHUXIN\n" +
"ROLE: Mage, Burst, Crowd Control\n" +
"ITEM_BUILD: Arcane Boots, Glowing Wand, Genius Wand, Holy Crystal, Blood Wings, Wishing Lantern\n" +
"HERO_COUNTER: belum ada data counter untuk Zhuxin di NEXUS ML\n\n" +

"HERO: YI SUN-SHIN\n" +
"ROLE: Assassin, Finisher, Crowd Control\n" +
"ITEM_BUILD: Tough Boots, Hunter Strike, SkyPiercer, Blade of Despair, Malefic Roar, Immortality\n" +
"HERO_COUNTER: Kaja, Franco\n" +
"ALASAN_COUNTER: Kaja dan Franco dapat menghentikan Yi Sun-shin dengan Suppress sehingga sulit untuk war dan farming\n\n" +

"=== AKHIR DATABASE ===\n\n" +

"Jika informasi tidak tersedia di database, gunakan WEB SEARCH sesuai aturan di atas.";

    const payload = {
        model: "google/gemini-2.5-flash-lite",
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            ...(body.messages
                ? body.messages.filter(function(m) {
                    return m.role !== "system";
                })
                : [])
        ],
        tools: [
            {
                type: "openrouter:web_search"
            }
        ]
    };

    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + env.OPENROUTER_API_KEY,
                "HTTP-Referer": "https://nexus-eaq.pages.dev",
                "X-Title": "NEXUS ML"
            },
            body: JSON.stringify(payload)
        }
    );

    const data = await response.json();

    return new Response(
        JSON.stringify(data),
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}
