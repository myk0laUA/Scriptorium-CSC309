//import { getSession } from 'next-auth/client'; // Adjust the import based on your auth setup
import prisma from '../../../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const templateId = parseInt(req.query.id);

    // Authenticate the user
    //const session = await getSession({ req });
    //if (!session || !session.user) {
    //  return res.status(401).json({ message: 'Unauthorized' });
    //}
    //const userId = session.user.id;
    const userId = 1; // Hardcoded user ID for testing
    // Fetch the original template
    const originalTemplate = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!originalTemplate) {
      return res.status(404).json({ message: 'Template not found.' });
    }

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
      // Create the forked template
      const forkedTemplate = await prisma.template.create({
        data: {
          title,
          explanation,
          tags,
          code,
          user: { connect: { id: userId } },
          forkedFrom: originalTemplate.id,
        },
      });
      res.status(201).json(forkedTemplate);
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint failed
        return res.status(400).json({ message: 'A template with this title already exists.' });
      }
      res.status(500).json({ message: 'Error forking template.', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}