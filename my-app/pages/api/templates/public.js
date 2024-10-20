import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get search query
    const { search } = req.query;

    try {
      // Fetch public templates with optional search
      const templates = await prisma.template.findMany({
        where: {
          hidden: false,
          OR: search
            ? [
                { title: { contains: search, mode: 'insensitive' } },
                { explanation: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } },
                { code: { contains: search, mode: 'insensitive' } },
              ]
            : undefined,
        },
        include: {
          user: {
            select: { firstName: true, lastName: true, avatar: true },
          },
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