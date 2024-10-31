import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); 

import authenticateJWT from '../protected/authorization';

export default async function handler(req, res) {
    await authenticateJWT(req, res, async () => {
        if (req.method === "PUT") {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ message: 'Blog Post ID is required '});

            }

            const userId  = req.user.id;

            const { title, description, tags, linkToTemplates } = req.body;

            const existingBlogPost = await prisma.blogPost.findUnique({
                where: { id: parseInt(id) },
            });

            if (!existingBlogPost) {
                return res.status(400).json({ message: "Blog Post Not Found"});
            }

            const blogPost = await prisma.blogPost.update({
                where: {id: parseInt(id) },
                data: {
                    title: title || existingBlogPost.title,
                    description: description || existingBlogPost.description,
                    tags: tags || existingBlogPost.tags,
                    userId,
                    linkToTemplates: linkToTemplates || existingBlogPost.linkToTemplates,

                },
            });

            return res.status(200).json(blogPost);

        // generated by ChatGPT    
        } else if (req.method === "PATCH") {

            const { id } = req.query;

            const userId  = req.user.id;

            const { voteType } = req.body;

            const existingBlogPost = await prisma.blogPost.findUnique({
                where: { id: parseInt(id) },
                include: { // generated by ChatGPT
                    upvotedByUsers: true, 
                    downvotedByUsers: true,
                }
            });

            if (!existingBlogPost) {
                return res.status(400).json({ message: "Blog Post Not Found" });
            }

            let updatedBlogPost;

            // generated by ChatGPT
            const hasUpvoted = existingBlogPost.upvotedByUsers.some(user => user.id === userId);
            const hasDownvoted = existingBlogPost.downvotedByUsers.some(user => user.id === userId);

            // generated by ChatGPT
            if (voteType === 'upvote') {
                if (hasUpvoted) {
                    return res.status(400).json({ message: "User already upvoted" });
                }
                updatedBlogPost = await prisma.blogPost.update({
                    where: { id: parseInt(id) },
                    data: {
                        upvotedByUsers: {
                            connect: { id: userId },
                        },

                        rating: existingBlogPost.rating + 1,
                    },
                });

            } else if (voteType === 'downvote') {
                if (hasDownvoted) {
                    return res.status(400).json({ message: "User already downvoted" });
                }
                updatedBlogPost = await prisma.blogPost.update({
                    where: { id: parseInt(id) },
                    data: {
                        downvotedByUsers: {
                            connect: { id: userId },
                        },

                        rating: existingBlogPost.rating - 1,
                    },
                });

            } else {

                return res.status(400).json({ message: "Invalid vote type" });
            }

            // generated by ChatGPT
            updatedBlogPost = await prisma.blogPost.findUnique({
                where: { id: parseInt(id) },
                include: {
                    upvotedByUsers: true,
                    downvotedByUsers: true,
                },
            });

            return res.status(200).json(updatedBlogPost);


        } else if (req.method === "DELETE") {

            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ message: 'Blog Post ID is required '});

            }

            // const { title, description, tags, linkToTemplates } = req.body;

            const existingBlogPost = await prisma.blogPost.findUnique({
                where: { id: parseInt(id) },
            });

            if (!existingBlogPost) {
                return res.status(400).json({ message: "Blog Post Not Found"});
            }

            await prisma.blogPost.delete({
                where: { id: parseInt(id) },
            });

            return res.status(200).json({ message: "Blog Post deleted"} );


        } else {
            
            res.status(405).json({ message: "Method not allowed" });

        }
    });
}
