'use client';
import Link from 'next/link';

export default function AboutMag(){
    return (
        <section className="relative z-10 mx-auto max-w-3xl px-6 mt-16">
            <h2 className="text-2xl text-amber-300 mb-3">Biz kimiz?</h2>
            <p className="text-white/80">
                Felsefe, psikoloji ve estetik arasında gezinen dört kalem: gecenin ritminde yazıyor,
                her sayıda bir tema etrafında buluşuyoruz. Amacımız; okuru hızdan kurtarıp,
                düşüncenin kendi ritmine geri getirmek.
            </p>

            <div className="mt-4 text-white/70">
                <p>Kimlere dokunmak istiyoruz?</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Zihnini yavaşlatıp derin okumaya özlem duyanlara</li>
                    <li>Müziği metnin “ikinci anlatıcısı” olarak hissedenlere</li>
                    <li>Genç kültürle felsefe arasında köprü arayanlara</li>
                </ul>
            </div>

            <div className="mt-5">
                <Link href="/issue01" className="underline text-amber-300 hover:text-amber-200">
                    İlk sayıya göz at →
                </Link>
            </div>
        </section>
    );
}
