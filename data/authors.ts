// data/authors.ts
export type Author = {
    id: string;
    name: string;
    handle: string;
    color: string;

    tagline: string;  // kart üst cümle
    bio: string;      // profil sayfası uzun bio

    // ✅ homepage kartında kullanılacak kısa bio
    cardBio?: string;

    email?: string;
    links?: { x?: string; ig?: string; web?: string };

    // ✅ yeni alanlar
    traits?: string[];
    profileImage?: string;  
    heroImage?: string;
    signature?: string;
    highlightQuote?: string; // yazar sayfası alıntı (istersen)
};

export const authors: Author[] = [
    {
        id: "leon-varis",
        name: "Leon Varis",
        handle: "@leon",
        color: "#f9b64c",
        tagline: "Güncel hayatın görünmez baskılarını görünür kılan bir kalem.",
        bio:
            "Günümüz insanının ‘normal’ sandığı yükleri yazıya çevirir; okuru kendine geri döndüren bir ayna kurar. Çözüm satmaz—bakışı yerinden oynatır; sorumluluğu ve iç merkezi geri çağırır.",
        cardBio:
            "Modern insanın alıştığı ‘normal’i bozar; okuru kendi payına düşen gerçekle yüzleştirir. Sessiz ama net bir çarpışma alanı açar.",
        traits: ["Yüzleşme", "Merkez", "Ağırlık"],
        profileImage: "/images/authors/leon-varis.png",
        email: "leon@geceylekonusmak.net",
        signature:
            "Leon, güncel hayatın görünmez baskılarını yazıyla görünür kılar; okuru kendine geri döndüren bir ayna kurar. Çözüm satmaz—bakışı yerinden oynatır; sorumluluğu ve iç merkezi geri çağırır.",
    },

    {
        id: "arin-kael",
        name: "Arin Kael",
        handle: "@arin",
        color: "#58e3ff",
        tagline: "Zihnin işleyişini sakin bir netlikle açan bir göz.",
        bio: "Bilinç, sinir sistemi ve ritim üzerine yazar; modern hayatın dikkat, beden ve kararlarımızı nasıl şekillendirdiğini çözümler. Karmaşık olanı sadeleştirir ve okura uygulanabilir bir farkındalık bırakır.",
        traits: ["Zihin", "Dikkat", "Ritim"],
        profileImage: "/images/authors/arin-kael.png",
        email: "arin@geceylekonusmak.net",

        signature:
            "Arin, zihnin nasıl dağıldığını değil, nasıl toplandığını anlatır. Bilimsel dili, gündelik hayata çevirecek kadar yakındır.",
    },

    {
        id: "noura-es",
        name: "Noura Es",
        handle: "@noura",
        color: "#c58bff",
        tagline: "İç dünyanın nabzını tutan yumuşak bir ses.",
        bio: "Yargıların gürültüsünü, iyileşmenin sessiz ritmini ve iki zaman arasında kalan insanı yazar. Sertleşmeden derinleşir; okuru kendine karşı daha incelikli bir dile çağırır.",
        traits: ["Duygu", "Hatıra", "Onarma"],
        profileImage: "/images/authors/noura-es.png",
        email: "noura@geceylekonusmak.net",

        signature:
            "Noura, duyguyu açıklamaz; duyulur hale getirir. Okuru yargıdan değil, şefkatten konuşmaya çağırır.",
    },

    {
        id: "rix-av",
        name: "Rix Av",
        handle: "@rix",
        color: "#39ff69",
        tagline: "Boşlukta anlam arayan, kısa ama yoğun bir akış.",
        bio: "Hiçlik, cam, sınır ve iç ses üzerine yazar; büyük cümlelerden çok küçük aralıkların dilini kurar. İsim vermeden önce dinler—okura durma ve yeniden ayarlanma alanı açar.",
        traits: ["Sokak", "Dil", "Sinyal"],
        profileImage: "/images/authors/rix-av.png",
        email: "rix@geceylekonusmak.net",

        signature:
            "Rix, kültürü ‘trend’ diye geçmez; işaretlerini okur. Küçük şeylerden büyük bir his çıkarır.",
    },
];

export const getAllAuthorIds = () => authors.map((a) => a.id);
export const getAuthorById = (id: string) => authors.find((a) => a.id === id) ?? null;
export const byId = Object.fromEntries(authors.map((a) => [a.id, a]));
