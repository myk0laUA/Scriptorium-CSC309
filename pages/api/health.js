import prisma from '../../utils/db';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).end();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ status: 'ok' });
  } catch {
    return res.status(503).json({ status: 'unavailable' });
  }
}
