import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); 
import authenticateJWT from "../../protected/authorization";
export default async function handler(req, res) {
    await authenticateJWT(req, res, async () => {
        if (req.method === "PUT") {
            const { id } = req.query;
            const { body } = req.body;
            if (!body || body === "") {
                return res.status(400).json({ message: "Comment Body is required" });
            }
            const comment = await prisma.comment.findUnique({
                where: { id: parseInt(id) },
            });
            if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }
            // Ensure that the user is the author of the comment
            if (comment.userId !== req.user.id) {
                return res.status(403).json({ message: "Unauthorized" });
            }
            try {
                const updatedComment = await prisma.comment.update({
                    where: { id: parseInt(id) },
                    data: { body },
                });
                return res.status(200).json(updatedComment);
            }
            catch (error) {
                return res.status(500).json({ message: "Failed to update comment" });
            }
        }
            else if (req.method === "DELETE") {
                const { id } = req.query;
                const comment = await prisma.comment.findUnique({
                    where: { id: parseInt(id) },
                });
                if (!comment) {
                    return res.status(404).json({ message: "Comment not found" });
                }
                // Ensure that the user is the author of the comment
                if (comment.userId !== req.user.id) {
                    return res.status(403).json({ message: "Unauthorized" });
                }
                try {
                    await prisma.comment.delete({
                        where: { id: parseInt(id) },
                    });
                    return res.status(204).json({ message: "Comment deleted" });
                }
                catch (error) {
                    return res.status(500).json({ message: "Failed to delete comment" });
                }
            }
            else {
                return res.status(405).json({ message: "Method Not Allowed" });
            }
        });
    }