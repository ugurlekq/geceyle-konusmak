// // pages/api/logout.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { serialize } from 'cookie';
//
// export default function handler(_req: NextApiRequest, res: NextApiResponse) {
//     res.setHeader(
//         'Set-Cookie',
//         serialize('gkm_user', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
//     );
//     res.status(200).json({ ok: true });
// }
