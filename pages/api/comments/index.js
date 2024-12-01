import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); 
import authenticateJWT from "../protected/authorization";

function buildRepliesInclude(depth) {
    if (depth === 0) return {};
    return {
        Replies: {
            include: {
                User: {
                    select: { id: true, firstName: true, email: true, avatar: true },
                },
                ...buildRepliesInclude(depth - 1),
            },
            where: { hidden: false },
        },
    };
}

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
        const { postId, depth = 10, page = 1, limit = 10, sort = 'recent' } = req.query;
    
        if (!postId) {
            return res.status(400).json({ message: "Blog Post ID is required" });
        }

        let orderBy;
        if (sort === 'top') {
            orderBy = { rating: 'desc' };
        } else if (sort === 'controversial') {
            orderBy = { rating: 'asc' };
        } else {
            orderBy = { createdAt: 'desc' }; // Default to sorting by recent
        }
    
        try {
            // Fetch top-level comments with dynamic depth of replies
            const comments = await prisma.comment.findMany({
                where: { postId: parseInt(postId), hidden: false, parentCommentId: null },
                include: {
                    User: {
                        select: { id: true, firstName: true, email: true, avatar: true },
                    },
                    upvotedByUsers: true, 
                    downvotedByUsers: true,
                    ...buildRepliesInclude(depth), // Dynamically include replies
                },
                orderBy,
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });
        
            return res.status(200).json({
                comments,
                page: parseInt(page),
                limit: parseInt(limit),
            });
        } catch (error) {
            return res.status(500).json({ message: "Error fetching comments." + error });
        }
    }
    else {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
}