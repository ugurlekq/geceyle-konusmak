import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@geceylekonusmak.org";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, account, profile }) {
            // İlk login anında account + profile dolu olur
            if (account && profile) {
                const email = (profile as any).email as string | undefined;
                if (
                    email &&
                    ADMIN_EMAIL &&
                    email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
                ) {
                    token.role = "admin";
                } else {
                    token.role = "user";
                }
            }
            return token;
        },
        async session({ session, token }) {
            // role bilgisini session.user içine taşıyoruz
            if (session.user) {
                (session.user as any).role = token.role ?? "user";
            }
            return session;
        },
    },
};

export default NextAuth(authOptions);
