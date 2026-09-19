import { getToken } from 'next-auth/jwt';
import prisma from '../../../../utils/db';
import { issueTokens } from '../../../../utils/tokens';
import { linkCookie } from '../../../../utils/oauth';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.NEXTAUTH_URL || req.headers.origin !== new URL(process.env.NEXTAUTH_URL).origin) {
    return res.status(403).json({ error: 'Invalid request origin' });
  }
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!Number.isInteger(token?.appUserId)) return res.status(401).json({ error: 'Please sign in again' });
  const user = await prisma.user.findUnique({ where: { id: token.appUserId } });
  if (!user) return res.status(401).json({ error: 'Account no longer exists' });
  res.setHeader('Set-Cookie', linkCookie('', 0));
  return res.status(200).json(issueTokens(user));
}
