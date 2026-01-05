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
                    <span className="text-amber-300">Geceyle Konuşmak</span>, gündüzün hızından
                    kaçan cümlelerin geceyle yeniden nefes aldığı bir okuma alanı.
                    Burada metin “içerik” gibi tüketilsin istemiyoruz; okurun zihninde
                    bir süre kalsın, dönüp dolaşıp başka bir yerden tekrar açılsın.
                </p>

                <p className="text-white/70 mb-4">
                    Yazılarımızı bu yüzden{' '}
                    <span className="text-amber-300">“Yaşayan Metinler”</span> diye anıyoruz:
                    Her okunuşta anlamı biraz yer değiştiren, okurla birlikte derinleşen metinler.
                    Kimsenin üzerine konuşmayan; sadece yanında duran bir dil.
                </p>

                <p className="text-white/70 mb-4">
                    Tonumuz net: İsyanla parlamaya, dayatmayla ikna etmeye, “ben biliyorum”la üstünlük
                    kurmaya çalışmıyoruz. Derdimiz bağırmak değil; doğru cümleyi doğru yerde
                    bırakmak. Bazen bir paragraf, bazen tek bir soru… bazen de yalnızca “durma”
                    hâlinin kendisi.
                </p>

                <p className="text-white/70 mb-6">
                    Eğer kendini kalabalıkların ortasında bile biraz yalnız, biraz da “fazla düşünen”
                    tarafta hissediyorsan; burası senin için sessiz bir masa, sıcak bir ışık ve
                    yanında açık duran bir defter olsun istiyoruz.
                </p>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-8">
                    <div className="text-white/85 font-semibold mb-2">
                        Bu alan nasıl yaşar?
                    </div>
                    <p className="text-white/65 text-sm leading-relaxed">
                        Okur kalabilirsin. Dilersen yazılara küçük bir destek bırakabilirsin.
                        Ve belki bir gün, bu kolektif düşünce alanına katkı sunmak istersin.
                    </p>
                    <p className="text-white/45 text-xs mt-2">
                        Not: Destek, bir “ücret” değil; bu ritmin sürmesine eşlik eden bir katkıdır.
                    </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                    <Link
                        href="/"
                        className="rounded-xl px-3.5 py-2 border border-amber-400/70 text-amber-300 bg-black/30 hover:bg-amber-400 hover:text-black transition"
                    >
                        Anasayfaya Dön →
                    </Link>
                    
                </div>

                {/* İleride açacağız: yazar başvuru akışı */}
                {/* 
        <div className="mt-6">
          <Link
            href="/write"
            className="text-white/60 hover:text-white/80 underline underline-offset-4 text-sm"
          >
            Yazar olmak ister misin?
          </Link>
        </div>
        */}
            </main>

            <Footer />
        </div>
    );
}
