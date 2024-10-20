import { getSession } from 'next-auth/client';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Authenticate the user
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = session.user.id;

    // Get search query
    const { search } = req.query;

    try {
      // Fetch user's templates with optional search
      const templates = await prisma.template.findMany({
        where: {
          userId,
          OR: search
            ? [
                { title: { contains: search, mode: 'insensitive' } },
                { explanation: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } },
              ]
            : undefined,
        },
      });
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching templates', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}