import prisma from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get search query and pagination parameters
    const { search, page = 1, limit = 10 } = req.query;

    // Convert search term to lowercase for case-insensitive search
    const lowerSearch = search ? search.toLowerCase() : "";

    // Calculate pagination values
    const take = parseInt(limit, 10); // Number of items per page
    const skip = (parseInt(page, 10) - 1) * take; // Offset for pagination

    try {
      // Fetch the total count of public templates with optional search
      const totalItems = await prisma.template.count({
        where: {
          hidden: false,
          OR: lowerSearch
            ? [
                { title: { contains: lowerSearch } },
                { explanation: { contains: lowerSearch } },
                { tags: { contains: lowerSearch } },
                { code: { contains: lowerSearch } },
              ]
            : undefined,
        },
      });

      // Fetch paginated public templates
      const templates = await prisma.template.findMany({
        where: {
          hidden: false,
          OR: lowerSearch
            ? [
                { title: { contains: lowerSearch } },
                { explanation: { contains: lowerSearch } },
                { tags: { contains: lowerSearch } },
                { code: { contains: lowerSearch } },
              ]
            : undefined,
        },
        include: {
          user: {
            select: { firstName: true, lastName: true, avatar: true },
          },
        },
        take,
        skip,
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalItems / take);

      // Send response with templates and pagination info
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
}