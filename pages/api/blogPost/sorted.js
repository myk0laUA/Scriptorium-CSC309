import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    
    // sorts blog posts by their rating
    if (req.method === "GET") {
        const { sort, page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit; 
        const take = parseInt(limit);

        let blogPosts;

        if (sort === 'valued') { // sorts with highest rated posts at top

            blogPosts = await prisma.blogPost.findMany({
                orderBy: { // generated by ChatGPT
                    rating: 'desc',
                },
                skip: skip,
                take: take,
            });
        
        } else if (sort === 'controversial') { // sorts with lowest rated posts at top

            blogPosts = await prisma.blogPost.findMany({
                orderBy: { // generated by ChatGPT
                    rating: 'asc',
                },
                skip: skip,
                take: take,
            });

        } else {
            return res.status(400).json({ error: "Sorting Type is not valid" });
        }

        return res.status(200).json({
            page: parseInt(page),       
            limit: take,                
            data: blogPosts,
        });

    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}