import { getSession } from 'next-auth/client';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Authenticate the user
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = session.user.id;

    // Extract data from the request body
    const { title, explanation, tags, code } = req.body;

    // Validate data
    if (!title || !code) {
      return res.status(400).json({ message: 'Title and code are required' });
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
      res.status(500).json({ message: 'Error creating template', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}