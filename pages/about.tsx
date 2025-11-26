// pages/about.tsx
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Header />

            <main className="flex-1 px-6 py-12 max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl text-amber-300 mb-4">
                    Hakkında — Geceyle Konuşmak
                </h1>

                <p className="text-white/70 mb-4">
                    <span className="text-amber-300">Geceyle Konuşmak</span>, gündüzün
                    hızından kaçan cümlelerin gecede yeniden nefes aldığı bir alan.
                    Bu dergi; içe doğru bakan, kendiyle ve dünya ile sohbet etmeyi
                    seven okurlar için tasarlanmış bir düşünce ve his mekânı.
                </p>

                <p className="text-white/70 mb-4">
                    Burada yazılar sadece okunmaz; zaman zaman geri dönülür, yeniden
                    düşünülür, altı çizilir, belki bir gece ansızın yeniden açılır.
                    Bu yüzden kendimize{' '}
                    <span className="text-amber-300">“Yaşayan Metinler”</span> diyoruz:
                    Her okuru ile birlikte anlamı değişen, derinliği artan metinler.
                </p>

                <p className="text-white/70 mb-4">
                    Derginin tonu; gösterişten uzak, samimi ve ağırbaşlıdır. Ne
                    hızlı tüketilen içerik peşindeyiz, ne de kimseye hazır cevaplar
                    sunmanın. Amacımız, okurun zihninde küçük de olsa bir kıvılcım
                    bırakmak: Bir cümle, belki tek bir soru, belki de sadece “durma”
                    hâlinin kendisi.
                </p>

                <p className="text-white/70 mb-8">
                    Eğer kendini kalabalıkların ortasında bile biraz yalnız, biraz da
                    “fazla düşünen” tarafta hissediyorsan; burası senin için sessiz
                    bir masa, sıcak bir ışık ve yanında hep açık duran bir defter
                    olsun istiyoruz.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                    <Link
                        href="/"
                        className="rounded-xl px-3.5 py-2 border border-amber-400/70 text-amber-300 bg-black/30 hover:bg-amber-400 hover:text-black transition"
                    >
                        ← Anasayfaya Dön
                    </Link>
                    <Link
                        href="/subscribe"
                        className="rounded-xl px-3.5 py-2 border border-white/20 text-white/80 bg-white/5 hover:bg-white/10 transition"
                    >
                        Abonelik Hakkında
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
