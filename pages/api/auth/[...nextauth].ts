// pages/api/auth/[...nextauth].ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@geceylekonusmak.org").toLowerCase();

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // İstersen zorunlu kıl: allowDangerousEmailAccountLinking: false,
        }),
    ],

    secret: process.env.NEXTAUTH_SECRET,

    // ✅ 404’ü bitiren kritik kısım:
    // NextAuth bir hata yakalarsa /api/auth/error’a yönlenmek yerine login’e döner.
    pages: {
        signIn: "/login?mode=signin",
        error: "/login?mode=signin",
    },

    // ✅ Netlik için (opsiyonel ama iyi):
    session: {
        strategy: "jwt",
    },

    // ✅ Prod’da hata ayıklamak için (dev’de true, prod’da kapalı)
    debug: false,

    callbacks: {
        async jwt({ token, account, profile }) {
            // sadece ilk login anında (account geldiğinde) rol set et
            if (account && profile) {
                const email = ((profile as any).email as string | undefined)?.toLowerCase();
                (token as any).role = email && email === ADMIN_EMAIL ? "admin" : "user";
            }

            // token.role yoksa default olsun (eski session’lar için)
            if (!(token as any).role) (token as any).role = "user";

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = (token as any).role ?? "user";
            }
            return session;
        },
    },
};

export default NextAuth(authOptions);
