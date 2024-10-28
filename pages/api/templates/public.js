import prisma from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get search query
    const { search } = req.query;

    try {
      // Build search conditions
      const searchConditions = search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { explanation: { contains: search, mode: 'insensitive' } },
              { tags: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {};

      // Fetch public templates with optional search
      const templates = await prisma.template.findMany({
        where: {
          hidden: false,
          ...searchConditions,
        },
        include: {
          user: {
            select: { firstName: true, lastName: true, avatar: true },
          },
        },
      });
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching templates.', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}