import { getSession } from 'next-auth/client';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const templateId = parseInt(req.query.id);
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = session.user.id;

    // Fetch the original template
    const originalTemplate = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!originalTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Extract data from the request body
    const { title, explanation, tags, code } = req.body;

    // Validate data
    if (!title || !code) {
      return res.status(400).json({ message: 'Title and code are required' });
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
      res.status(500).json({ message: 'Error forking template', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}