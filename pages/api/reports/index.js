import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import authenticateJWT from "../protected/authorization";

export default async function handler(req, res) {
    await authenticateJWT(req, res, async () => {
        if (req.method === "POST") {

            const user = req.user;

            const { contentId, contentType, explanation } = req.body;

            if (!contentId || !contentType || !["post", "comment"].includes(contentType)) {
                return res.status(400).json({ message: "Content ID and Content Type are required" });
            }

            const content = contentType === "post"
                ? await prisma.blogPost.findUnique({ where: { id: parseInt(contentId) } })
                : await prisma.comment.findUnique({ where: { id: parseInt(contentId) } });

            if (!content) {
                return res.status(404).json({ message: "Content not found" });
            }

            // Check that the user hasn't already reported
            const existingReport = await prisma.report.findFirst({
                where: {
                    userId: user.id,
                    blogPostId: contentType === "post" ? parseInt(contentId) : null,
                    commentId: contentType === "comment" ? parseInt(contentId) : null,
                    contentType,
                },
            });
            if (existingReport) {
                return res.status(400).json({ message: "User has already reported this content" });
            }

            try {
                const report = await prisma.report.create({
                    data: {
                        explanation,
                        contentType,
                        BlogPost : contentType === "post"
                            ? { connect: { id: parseInt(contentId) } }
                            : undefined,
                        Comment: contentType === "comment"
                            ? { connect: { id: parseInt(contentId) } }
                            : undefined,
                        User: {
                            connect: { id: user.id },
                        },
                    },
                });

                if (contentType === "post") {
                    await prisma.blogPost.update({
                        where: { id: parseInt(contentId) },
                        data: { numReports: { increment: 1 }
                        },
                    });
                } else {
                    await prisma.comment.update({
                        where: { id: parseInt(contentId) },
                        data: { numReports: { increment: 1 }
                        },
                    });
                }

                return res.status(201).json(report);
            }
            catch (error) {
                return res.status(500).json({ message: "Failed to create report" + error + content });
            }
        }
        else {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
    });
}
