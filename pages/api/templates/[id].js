//import { getSession } from 'next-auth/client'; // Adjust the import based on your auth setup
import prisma from '../../../utils/db';

export default async function handler(req, res) {
  const templateId = parseInt(req.query.id);

  // Authenticate the user
  //const session = await getSession({ req });
  //if (!session || !session.user) {
  //  return res.status(401).json({ message: 'Unauthorized' });
  //}
  //const userId = session.user.id;
  const userId = 1; // Hardcoded user ID for testing
  // Verify that the template belongs to the user
  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!template || template.userId !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    // Extract data from the request body
    let { title, explanation, tags, code } = req.body;

    // Ensure tags is a string
    if (Array.isArray(tags)) {
      tags = tags.join(','); // Convert array to comma-separated string
    }

    try {
      // Update the template
      const updatedTemplate = await prisma.template.update({
        where: { id: templateId },
        data: { title, explanation, tags, code },
      });
      res.status(200).json(updatedTemplate);
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint failed
        return res.status(400).json({ message: 'A template with this title already exists.' });
      }
      res.status(500).json({ message: 'Error updating template.', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Delete the template
      await prisma.template.delete({
        where: { id: templateId },
      });
      res.status(200).json({ message: 'Template deleted successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting template.', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}