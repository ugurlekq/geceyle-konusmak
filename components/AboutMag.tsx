'use client';
import Link from 'next/link';

export default function AboutMag() {
    return (
        <section className="relative z-10 mx-auto max-w-3xl px-6 mt-16">
            <h2 className="text-2xl text-amber-300 mb-3">Biz kimiz?</h2>

            <p className="text-white/80 leading-relaxed">
                Aynı masada oturmasak da aynı sessizliği paylaşan dört kalemiz.
                Geceyle Konuşmak’ta her sayıda başka bir temanın peşine düşüyor,
                düşüncenin acele etmediği küçük bir alan açıyoruz.
                Amacımız bir şey öğretmek değil; okuru hızdan uzak,
                daha dürüst bir düşünce ritmine davet etmek.
            </p>

            <div className="mt-5 text-white/70 leading-relaxed">
                <p>Kimlere dokunmak istiyoruz?</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Kafasını toparlamak için sessizliğe ihtiyaç duyanlara</li>
                    <li>Derin ve sakin okumayı bir alışkanlık olarak görenlere</li>
                    <li>Metni sadece metin değil, bir eşlik olarak hissedenlere</li>
                </ul>
            </div>

            <div className="mt-6">
                <Link
                    href="/issue01"
                    className="underline text-amber-300 hover:text-amber-200"
                >
                    İlk sayıya göz at →
                </Link>
            </div>
        </section>
    );
}
