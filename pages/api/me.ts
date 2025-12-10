// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // NextAuth üzerinden oturumu oku
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
        return res.status(200).json({});
    }

    const u = session.user as any;

    return res.status(200).json({
        email: u.email,
        name: u.name ?? null,
        role: u.role ?? "user",
        isSubscribed: !!u.isSubscribed,
    });
}
