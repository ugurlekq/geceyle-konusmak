// data/authors.ts
export type Author = {
    id: string;
    name: string;
    handle: string;      // "@leon" vb.
    color: string;
    tagline: string;
    bio: string;         // 2–3 cümle
    email?: string;
    links?: { x?: string; ig?: string; web?: string };
};

export const authors: Author[] = [
    {
        id: "leon-varis",
        name: "Leon Varis",
        handle: "@leon",
        color: "#f9b64c",
        tagline: "Melankoli ve estetik arasında yürüyen bir kalem.",
        bio: "Melankoliyi bir kusur değil, biçim verme çağrısı olarak görür. Yazarken çizgi gibi davranır; sözcükleri ağır ağır koyar, gölgenin hangi biçimde görünür olduğuyla ilgilenir. Varlık, sessizlik ve estetik üçgeninde dolaşır.",
        email: "leon@geceylekonusmak.net",
    },
    {
        id: "arin-kael",
        name: "Arin Kael",
        handle: "@arin",
        color: "#58e3ff",
        tagline: "Bilinç, nörobilim ve sistem düşüncesi.",
        bio: "Bilinç üzerine yazar; sinaptan kültüre uzanan bağları bulmaya çalışır. Matematiğin netliğiyle şiirin belirsizliğini barıştırmak ister. Sistem düşüncesi, dikkat hijyeni ve öz-düzenleme temel alanlarıdır.",
        email: "Arin@geceylekonusmak.net",
    },
    {
        id: "noura-es",
        name: "Noura Es",
        handle: "@noura",
        color: "#c58bff",
        tagline: "Duyguların hafızasını yazıya çeviren bir ses.",
        bio: "Psikolojinin yumuşak dilinde, hatıranın duygusunu—zorlamadan—onurlandırır.",
        email: "Noura@geceylekonusmak.net",
    },
    {
        id: "rix-av",
        name: "Rix Av",
        handle: "@rix",
        color: "#39ff69",
        tagline: "Genç kültür ve sokağın metafiziği.",
        bio: "Sokağın metafiziği ve genç kültürün ritmi. Gündelik jestlerdeki felsefeyi arar. “Önce dinle, sonra isim ver.”",
        email: "Rix@geceylekonusmak.net",
    },
];

export const getAllAuthorIds = () => authors.map(a => a.id);
export const getAuthorById = (id: string) => authors.find(a => a.id === id) ?? null;
export const byId = Object.fromEntries(authors.map(a => [a.id, a]));
