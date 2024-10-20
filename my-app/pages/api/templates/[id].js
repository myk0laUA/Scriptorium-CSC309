import { getSession } from 'next-auth/client';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const templateId = parseInt(req.query.id);
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = session.user.id;

  // Verify that the template belongs to the user
  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!template || template.userId !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    // Extract data from the request body
    const { title, explanation, tags, code } = req.body;

    try {
      // Update the template
      const updatedTemplate = await prisma.template.update({
        where: { id: templateId },
        data: { title, explanation, tags, code },
      });
      res.status(200).json(updatedTemplate);
    } catch (error) {
      res.status(500).json({ message: 'Error updating template', error });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Delete the template
      await prisma.template.delete({
        where: { id: templateId },
      });
      res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting template', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}