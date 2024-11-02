import prisma from "@/utils/db";
import authenticateJWT from "../protected/authorization";

export default async function handler(req, res) {
    
    if (req.method === "POST") {
        await authenticateJWT(req, res, async () => {
            const user = req.user;

            const { postId, body, parentCommentId } = req.body;

            if (!postId || !body || body === "") {
                return res.status(400).json({ message: "Post ID and Comment Body are required" });
            }

            const post = await prisma.blogPost.findUnique({
                where: { id: parseInt(postId) },
            });
            if (!post) {
                return res.status(404).json({ message: "Blog Post not found" });
            }
            
            if (parentCommentId) {
                const parentComment = await prisma.comment.findUnique({
                    where: { id: parseInt(parentCommentId) },
                });
                if (!parentComment) {
                    return res.status(404).json({ message: "Parent Comment not found" });
                }
                if (parentComment.hidden) {
                    return res.status(403).json({ message: "Parent Comment is hidden" });
                }
                if (parentComment.parentCommentId) {
                    return res.status(403).json({ message: "Parent Comment is a reply" });
                }
            }

            try {
                const comment = await prisma.comment.create({
                    data: {
                        body,
                        rating: 0,
                        ParentComment: parentCommentId
                            ? { connect: { id: parseInt(parentCommentId) } }
                            : undefined,
                        BlogPost: {
                            connect: { id: parseInt(postId) },
                        },
                        User: {
                            connect: { id: user.id },
                        },
                    },
                });

                return res.status(201).json(comment);
            }
            catch (error) {
                return res.status(500).json({ message: "Failed to create comment" + error});
            }
        });
    }
    else if (req.method === "GET") {
        const { postId, sortBy, page = 1, limit = 10 } = req.query; // pagination logic influenced by ChatGPT

        if (!postId) {
            return res.status(400).json({ message: "Blog Post ID is required" });
        }
        
        const post = await prisma.blogPost.findUnique({
            where: { id: parseInt(postId) },
        });
        if (!post) {
            return res.status(404).json({ message: "Blog Post not found" });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        try {
            const comments = await prisma.comment.findMany({
                where: { postId: parseInt(postId), hidden: false, parentCommentId: null },
                include: {
                    User: {
                        select: { id: true, firstName: true, email: true },
                    },
                    Replies: {
                        where: { hidden: false },
                        include: {
                            User: {
                                select: { id: true, firstName: true, email: true },
                            },
                        },
                    },
                },
                orderBy: sortBy === "top" ? { rating: "desc" } : { rating: "asc" },
                skip: skip,
                take: parseInt(limit),
            });
        
            return res.status(200).json({
                comments,
                page: parseInt(page),
                limit: parseInt(limit),
            });
        } catch (error) {
            return res.status(500).json({ message: "Error fetching comment." + error });
        }
    }
    else {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
}
