import authenticateJWT from '../protected/authorization';
import prisma from '../../../utils/db';

export default async function handler(req, res) {
  await authenticateJWT(req, res, async () => {
    if (req.method === 'POST') {    
      // Get the authenticated user ID from req.user.id
      const userId = req.user.id;
      // Extract data from the request body
      let { title, explanation, tags, code } = req.body;

      // Validate data
      if (!title || !code) {
        return res.status(400).json({ message: 'Title and code are required.' });
      }

      // Ensure tags is a string
      if (Array.isArray(tags)) {
        tags = tags.join(','); // Convert array to comma-separated string
      }

      try {
        // Create the template
        const newTemplate = await prisma.template.create({
          data: {
            title,
            explanation,
            tags,
            code,
            user: { connect: { id: userId } },
          },
        });
        res.status(201).json(newTemplate);
      } catch (error) {
        if (error.code === 'P2002') {
          // Unique constraint failed
          return res.status(400).json({ message: 'A template with this title already exists.' });
        }
        res.status(500).json({ message: 'Error creating template.', error: error.message });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed.' });
    }
  });
}
