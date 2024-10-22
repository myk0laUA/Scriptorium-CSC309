import prisma from "@/utils/db";
import { use } from "react";

export default async function handler(req, res) {
    if (req.method === "POST") {

        // Authentication placeholder

        const { postId, body, parentCommentId } = req.body;

        if (!postId || !body || body === "") {
            return res.status(400).json({ message: "Blog Post ID and Comment Body are required" });
        }

        try {
            const comment = await prisma.comment.create({
                data: {
                    body,
                    postId: parseInt(postId),
                    userId: 1, // Hardcoded for now
                    parentCommentId: parentCommentId ? parseInt(parentCommentId) : null,
                },
            });

            return res.status(201).json(comment);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    else if (req.method === "GET") {
        const { postId, sortBy } = req.query;
        // sortBy will be one of "top" (highest rated, upvotes - downvotes), and "controversial" (roughly equal upvotes and downvotes)

        if (!postId) {
            return res.status(400).json({ message: "Blog Post ID is required" });
        }

        try {
            const comments = await prisma.comment.findMany({
                where: { postId: parseInt(postId) },
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                    comments: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true },
                            },
                        },
                    },
                },
                orderBy: sortBy === "top" ? { rating: "desc" } : { rating: "asc" },
            });
        
            return res.status(200).json(comments);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error creatin" });
        }
    }
    else {
        return res.status(405).
