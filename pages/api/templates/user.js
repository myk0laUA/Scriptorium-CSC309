
import prisma from '../../../utils/db';
import authenticateJWT from '../protected/authorization';

export default async function handler(req, res) {
  await authenticateJWT(req, res, async () => {
    if (req.method === 'GET') {
      // Get the authenticated user ID from req.user.id
      const userId = req.user.id;

      // Get search query and pagination parameters
      const { search, page = 1, limit = 10 } = req.query;
      const lowerSearch = search ? search.toLowerCase() : "";
      const take = parseInt(limit, 10); // Number of items per page
      const skip = (parseInt(page, 10) - 1) * take;

      try {
        // Fetch total count of templates for the authenticated user
        const totalItems = await prisma.template.count({
          where: {
            userId,
            OR: lowerSearch
              ? [
                  { title: { contains: lowerSearch } },
                  { explanation: { contains: lowerSearch } },
                  { tags: { contains: lowerSearch } },
                ]
              : undefined,
          },
        });

        // Fetch paginated templates
        const templates = await prisma.template.findMany({
          where: {
            userId,
            OR: lowerSearch
              ? [
                  { title: { contains: lowerSearch } },
                  { explanation: { contains: lowerSearch } },
                  { tags: { contains: lowerSearch } },
                ]
              : undefined,
          },
          take,
          skip,
        });

        const totalPages = Math.ceil(totalItems / take);

        // Respond with templates and pagination info
        res.status(200).json({
          templates,
          pagination: {
            totalItems,
            totalPages,
            currentPage: parseInt(page, 10),
            perPage: take,
          },
        });
      } catch (error) {
        res.status(500).json({ message: 'Error fetching templates.', error: error.message });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed.' });
    }
  });
}
