import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import authenticateJWT from '../protected/authorization';

export default async function handler(req, res) {
    
    if (req.method === "POST") {
        await authenticateJWT(req, res, async () => {

            const userId  = req.user.id;
            const { title, description, tags, linkToTemplates } = req.body;

            if (!title || !description || !tags || !userId) {
                return res.status(400).json({ error: 'Missing items' });    

            }

            // generated by ChatGPT
            if (linkToTemplates && linkToTemplates.length > 0) {
                const templates = await prisma.template.findMany({
                    where: { id: { in: linkToTemplates } },
                });
                if (templates.length !== linkToTemplates.length) {
                    return res.status(400).json({ error: 'Template IDs do not match exisiting Templates' });
                }
            }

            const blogPost = await prisma.blogPost.create({
                data: {
                    title,
                    description,
                    tags,
                    userId,
                    linkToTemplates: linkToTemplates
                        ? {connect: linkToTemplates.map(id => ({ templateId: id })),}
                        : undefined,
                    },
            });

            return res.status(201).json(blogPost);
        });
    
    } else if (req.method == "GET") {

        const { title, description, tags, linkToTemplates } = req.query;

        const queryConditions = {
            AND: [] // generated by ChatGPT
        };

        if (title) {
            queryConditions.AND.push({
                title: { contains: title }
            });
        }

        if (description) {
            queryConditions.AND.push({
                description: { contains: description }
            });
        }

        if (tags) {
            // generated by ChatGPT
            const tagArray = tags.split(',').map(tag => tag.trim());
            tagArray.forEach(tag => {
                queryConditions.AND.push({
                    tags: { contains: tag }
                });
            });


        }

        // generated by ChatGPT
        let blogPosts;
        if (linkToTemplates) {
            const templateIds = linkToTemplates.split(',').map(id => parseInt(id.trim()));
    
            
            blogPosts = await prisma.blogPost.findMany({
                where: queryConditions,
                // include: {
                //     linkToTemplates: {
                //         include: {
                //             template: true, 
                //         },
                //     },
                // },
            });
    
            
            blogPosts = blogPosts.filter(blogPost => {
                const linkedTemplateIds = blogPost.linkToTemplates.map(link => link.templateId);
                return templateIds.every(id => linkedTemplateIds.includes(id)); 
            });

        } else {
            blogPosts = await prisma.blogPost.findMany({
                where: queryConditions,
                // include: {
                //     linkToTemplates: {
                //         include: {
                //             template: true, 
                //         },
                //     },
                // },
            });
        }

        
        // if (tags) {
        //     const tagArray = tags.split(',').map(tag => tag.trim()); 
    
        //     const filteredPosts = blogPosts.filter(blogPost => {
        //         const dbTagsArray = blogPost.tags.split(',').map(tag => tag.trim());
                
        //         return tagArray.every(tag => dbTagsArray.includes(tag));
        //     });
    
        //     return res.status(200).json(filteredPosts);
        // }

        return res.status(200).json(blogPosts);

    
    } else {
        res.status(405).json({ message: "Method not allowed" });
    
    }
}
