import prisma from "@/utils/db";
import authenticateJWT from "../../protected/authorization";

export default async function handler(req, res) {
    await authenticateJWT(req, res, async () => {
        if (req.method === "POST") {
            const { id } = req.query;
            const userId = req.user.id;
            const { vote } = req.body;

            if (!id || !vote || !["upvote", "downvote"].includes(vote)) {
                return res.status(400).json({ message: "Comment ID and Vote are required" });
            }

            const comment = await prisma.comment.findUnique({
                where: { id: parseInt(id) },
                include: {
                    upvotedByUsers: true,
                    downvotedByUsers: true,
                },
            });

            if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            let updatedComment;

            const hasUpvoted = comment.upvotedByUsers.some(user => user.id === userId);
            const hasDownvoted = comment.downvotedByUsers.some(user => user.id === userId);

            if (vote === 'upvote') {
                if (hasUpvoted) {
                    updatedComment = await prisma.comment.update({
                        where: { id: parseInt(id) },
                        data: {
                            upvotedByUsers: {
                                disconnect: { id: userId },
                            },
                            rating: comment.rating - 1,
                        },
                    });
                } else if (hasDownvoted) {
                    updatedComment = await prisma.comment.update({
                        where: { id: parseInt(id) },
                        data: {
                            downvotedByUsers: {
                                disconnect: { id: userId },
                            },
                            upvotedByUsers: {
                                connect: { id: userId },
                            },
                            rating: comment.rating + 2,
                        },
                    });
                } else {
                    updatedComment = await prisma.comment.update({
                        where: { id: parseInt(id) },
                        data: {
                            upvotedByUsers: {
                                connect: { id: userId },
                            },
                            rating: comment.rating + 1,
                        },
                    });
                }
            } else if (vote === 'downvote') {
                if (hasDownvoted) {
                    updatedComment = await prisma.comment.update({
                        where: { id: parseInt(id) },
                        data: {
                            downvotedByUsers: {
                                disconnect: { id: userId },
                            },
                            rating: comment.rating + 1,
                        },
                    });
                } else if (hasUpvoted) {
                    updatedComment = await prisma.comment.update({
                        where: { id: parseInt(id) },
                        data: {
                            upvotedByUsers: {
                                disconnect: { id: userId },
                            },
                            downvotedByUsers: {
                                connect: { id: userId },
                            },
                            rating: comment.rating - 2,
                        },
                    });
                } else {
                    updatedComment = await prisma.comment.update({
                        where: { id: parseInt(id) },
                        data: {
                            downvotedByUsers: {
                                connect: { id: userId },
                            },
                            rating: comment.rating - 1,
                        },
                    });
                }
            } else {
                return res.status(400).json({ message: "Invalid vote type" });
            }

            updatedComment = await prisma.comment.findUnique({
                where: { id: parseInt(id) },
                include: {
                    upvotedByUsers: true,
                    downvotedByUsers: true,
                },
            });

            return res.status(200).json(updatedComment);
        }
        else {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
    });
}
