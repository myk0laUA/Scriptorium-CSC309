import jwt from 'jsonwebtoken';
import prisma from '../../../../utils/db';
import { linkCookie } from '../../../../utils/oauth';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.NEXTAUTH_URL || req.headers.origin !== new URL(process.env.NEXTAUTH_URL).origin) {
    return res.status(403).json({ error: 'Invalid request origin' });
  }
  // Normal login clears any abandoned account-linking intent.
  if (req.body?.clear) {
    res.setHeader('Set-Cookie', linkCookie('', 0));
    return res.status(204).end();
  }
  if (!['github', 'google'].includes(req.body?.provider)) return res.status(400).json({ error: 'Invalid provider' });
  try {
    const claim = jwt.verify(req.headers.authorization?.replace(/^Bearer /, '') || '', process.env.ACCESS_TOKEN, { algorithms: ['HS256'] });
    const user = await prisma.user.findUnique({ where: { id: claim.id } });
    if (!user) return res.status(401).json({ error: 'Please sign in again' });
    const intent = jwt.sign({ userId: user.id, provider: req.body.provider }, process.env.NEXTAUTH_SECRET, {
      algorithm: 'HS256', audience: 'oauth-link', expiresIn: '10m',
    });
    res.setHeader('Set-Cookie', linkCookie(intent, 600));
    return res.status(204).end();
  } catch {
    return res.status(401).json({ error: 'Please sign in again before linking an account' });
  }
}
