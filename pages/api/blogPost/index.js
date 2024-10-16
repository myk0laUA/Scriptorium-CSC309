export default async function handler(req, res) {
    if (req.method === "POST") {
        const { title, description, tags, linkToTemplates, userId } = req.body;

        if (!title || !description || !tags || !userId) {
            return res.status(400).json({ error: 'Missing items' });    

        }

        const blogPost = await prisma.blogPost.create({
            data: {
                title,
                description,
                tags,
                linkToTemplates,
                userId,
            },
        });

        return res.statust(201).json(blogPost);
    
    } else if (req.method == "GET") {

        const { title, description, tags, linkToTemplates } = req.query;

        const queryConditions = {};

        if (title) {
            queryConditions.title = { contains: title };
        }

        if (description) {
            queryConditions.description = { contains: description };
        }

        if (tags) {
            queryConditions.tags = { hasEvery: tags.split(',') }; 
        }

        if (linkToTemplates) {
            queryConditions.linkToTemplates = { hasEvery: linkToTemplates.split(',')};
        
        }

        const blogPosts = await prismaClient.blogPost.findMany( {
            where: queryConditions,
        });

        return res.status(200).json(blogPosts);

    
    } else {
        res.status(405).json({ message: "Method not allowed" });
    
    }
}