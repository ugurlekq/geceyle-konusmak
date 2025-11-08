import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    // /subscribe sayfasını koru
    if (req.nextUrl.pathname.startsWith('/subscribe')) {
        const email = req.cookies.get('sa_email')?.value;
        if (!email) {
            const url = req.nextUrl.clone();
            url.pathname = '/auth';
            url.searchParams.set('next', '/subscribe'); // döndüğünde buraya yönlendirmek için istersen kullan
            return NextResponse.redirect(url);
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/subscribe'],
};
