import prisma from "@/utils/db";
import authenticateJWT from "../../protected/authorization";

export default async function handler(req, res) {
    await authenticateJWT(req, res, async () => {
        if (req.method === "POST") {
            if (req.user.role !== "ADMIN") {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const { contentId, contentType, hidden } = req.body;

            if (!contentId || !contentType || !["post", "comment"].includes(contentType)) {
                return res.status(400).json({ message: "Content ID and Content Type are required" });
            }

            const content = contentType === "post"
                ? await prisma.blogPost.findUnique({ where: { id: parseInt(contentId) } })
                : await prisma.comment.findUnique({ where: { id: parseInt(contentId) } });
            
            if (!content) {
                return res.status(404).json({ message: "Content not found" });
            }

            const isHidden = hidden !== undefined ? hidden : true;

            try {
                const updatedContent = contentType === "post"
                    ? await prisma.blogPost.update({
                        where: { id: parseInt(contentId) },
                        data: { hidden: isHidden },
                    })
                    : await prisma.comment.update({
                        where: { id: parseInt(contentId) },
                        data: { hidden: isHidden },
                    });

                return res.status(200).json(updatedContent);
            }
            catch (error) {
                return res.status(500).json({ message: "Failed to update content" });
            }
        }
        else {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
    });
}