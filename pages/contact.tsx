// pages/contact.tsx
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Header />

            <main className="flex-1 px-6 py-12 max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl text-amber-300 mb-4">
                    İletişim
                </h1>

                <p className="text-white/70 mb-4">
                    Geceyle Konuşmak, okuruyla diyaloğu önemseyen bir dergi. Bir
                    yazı hakkında düşünceni paylaşmak, dergiyle ilgili öneride
                    bulunmak ya da birlikte bir şey üretmek istersen bize yazabilirsin.
                </p>

                <p className="text-white/70 mb-4">
                    Şimdilik en doğrudan iletişim yolu e-posta:
                </p>

                <div className="mb-6">
                    <a
                        href="mailto:admin@geceylekonusmak.org"
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-400/70 px-3.5 py-2 text-amber-200 bg-black/40 hover:bg-amber-400 hover:text-black transition"
                    >
                        📮 admin@geceylekonusmak.org
                    </a>
                </div>

                <p className="text-white/60 text-sm mb-8">
                    Dilersen, yazılarınla bu evrene katkı sunmak için de
                    ulaşabilirsin. Henüz herkese açık bir “yazı gönder” sistemi
                    kurmadık; ama iyi yazılmış, derginin ruhuna uygun metinlere
                    kapımız açık.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                    <Link
                        href="/"
                        className="rounded-xl px-3.5 py-2 border border-amber-400/70 text-amber-300 bg-black/30 hover:bg-amber-400 hover:text-black transition"
                    >
                        ← Anasayfaya Dön
                    </Link>
                    <Link
                        href="/about"
                        className="rounded-xl px-3.5 py-2 border border-white/20 text-white/80 bg-white/5 hover:bg-white/10 transition"
                    >
                        Hakkında Sayfasına Git
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
