//import { getSession } from 'next-auth/client'; // Adjust the import based on your auth setup
import prisma from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Authenticate the user
    //const session = await getSession({ req });
    //if (!session || !session.user) {
    //  return res.status(401).json({ message: 'Unauthorized' });
    //}
    //const userId = session.user.id;
    const userId = 1; // Hardcoded user ID for testing
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
            ],
          }
        : {};

      // Fetch user's templates with optional search
      const templates = await prisma.template.findMany({
        where: {
          userId,
          ...searchConditions,
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