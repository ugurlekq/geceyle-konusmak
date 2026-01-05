// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 bg-black/80">
            <div className="max-w-5xl mx-auto px-4 py-8 md:py-10 flex flex-col md:flex-row gap-6 md:gap-10 justify-between">
                {/* Sol blok – logo & slogan */}
                <div className="space-y-2 max-w-sm">
                    <div className="flex items-baseline gap-2">
                        <span className="text-amber-300 text-lg md:text-xl font-semibold tracking-wide">
                            Geceyle Konuşmak
                        </span>
                        <span className="text-xs md:text-sm text-white/50">
                            — Yaşayan Metinler
                        </span>
                    </div>
                    <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                        Gecenin ritminde, yavaş okunan metinler.
                        Düşünceyi aceleye getirmeyen; okuru da yazarı da
                        biraz olsun yavaşlatan bir dijital dergi.
                    </p>
                </div>

                {/* Orta blok – hızlı linkler */}
                <div className="flex-1 md:flex md:justify-center">
                    <nav className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <Link
                            href="/"
                            className="text-white/70 hover:text-amber-300 transition"
                        >
                            Anasayfa
                        </Link>
                        <Link
                            href="/issue01"
                            className="text-white/70 hover:text-amber-300 transition"
                        >
                            İlk Sayı
                        </Link>
                        <Link
                            href="/authors/leon-varis"
                            className="text-white/70 hover:text-amber-300 transition"
                        >
                            Yazarlar
                        </Link>
                        <Link
                            href="/about"
                            className="text-white/70 hover:text-amber-300 transition"
                        >
                            Hakkında
                        </Link>
                        <a
                            href="/contact"
                            className="text-white/70 hover:text-amber-300 transition"
                        >
                            İletişim
                        </a>
                    </nav>
                </div>

                {/* Sağ blok – küçük not */}
                <div className="text-xs md:text-sm text-white/60 space-y-2 max-w-xs">
                    <p>
                        Bu dergi, sohbetlerin içinden süzülen metinlerle
                        yavaş yavaş büyüyen bir alan. Her sayı, geceyle
                        yapılan yeni bir konuşma.
                    </p>
                    <p className="text-white/40">
                        © {year} Geceyle Konuşmak. Tüm hakları saklıdır.
                    </p>
                </div>
            </div>
        </footer>
    );
}
