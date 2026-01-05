// pages/issues.tsx
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type IssueCard = {
    number: number;
    title: string;
    description: string;
    href: string;
};

const ISSUES: IssueCard[] = [
    {
        number: 1,
        title: "İlk Gece",
        href: "/issue01",
        description:
            "Derginin başlangıç sayısı. Tonu, ritmi ve “yaşayan metinler” fikrini kuran ilk eşik.",
    },
    {
        number: 2,
        title: "Sessiz Aklın Çağı",
        href: "/issues/02",
        description:
            "Gürültünün içinde düşüncenin nasıl inceldiğine; iç ritmi korumanın yeni yollarına bakan sayımız.",
    },
    {
        number: 3,
        title: "İyileşmek",
        href: "/issues/03",
        description:
            "İyileşmeyi bir “geçip gitme” değil, yön bulma olarak ele alan; daha sakin, daha dürüst bir sayı.",
    },
    {
        number: 4,
        title: "Ritmi Geri Almak",
        href: "/issues/04",
        description:
            "Sürekli tetikte yaşamanın çağında, insanın kendi temposunu hatırlamasına dair bir yeniden bağlanma çağrısı.",
    },
];

export default function IssuesPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Header />

            <main className="flex-1 px-6 py-12 max-w-5xl mx-auto w-full">
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl text-amber-300">Sayılar</h1>

                    <p className="text-white/60 mt-2">
                        Yeniysen <span className="text-white/80">Sayı 01</span>’den başlamanı öneririz.
                    </p>

                    <div className="mt-4 flex gap-3 flex-wrap text-sm">
                        <Link
                            href="/issue01"
                            className="rounded-xl px-3.5 py-2 border border-amber-400/70 text-amber-300 bg-black/30 hover:bg-amber-400 hover:text-black transition"
                        >
                           Anasayfaya Dön
                        </Link>
                        
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    {ISSUES.map((iss) => (
                        <div
                            key={iss.number}
                            className="rounded-2xl border border-white/10 bg-white/5 p-6"
                        >
                            <div className="text-white/50 text-sm">
                                Sayı {String(iss.number).padStart(2, "0")}
                            </div>

                            <div className="mt-1 text-xl text-white/90 font-semibold">
                                {iss.title}
                            </div>

                            <p className="mt-3 text-white/65 leading-relaxed">
                                {iss.description}
                            </p>

                            <div className="mt-5 flex items-center gap-3">
                                <Link
                                    href={iss.href}
                                    className="inline-flex items-center rounded-xl border border-amber-400/70 text-amber-300 px-4 py-2 hover:bg-amber-400 hover:text-black transition text-sm"
                                >
                                    Sayıya git →
                                </Link>

                                {/* küçük yönlendirme: sırayla okuma fikri */}
                                {iss.number !== 1 && (
                                    <span className="text-xs text-white/40">
                    Öneri: Sayı 01’den sonra
                  </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
