import prisma from "@/utils/db";
import authenticateJWT from "../../protected/authorization";

export default async function handler(req, res) {
    await authenticateJWT(req, res, async () => {
        if (req.method === "GET") {
            if (req.user.role !== "ADMIN") {
                return res.status(403).json({ message: "Unauthorized" });
            }
            const { contentType, sortByReports, page = 1, limit = 10 } = req.query; // pagination logic influenced by ChatGPT

            if (!contentType || !["post", "comment"].includes(contentType)) {
                return res.status(400).json({ message: "Content Type is required" });
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            let content, totalItems;
            if (contentType === "post") {
                content = await prisma.blogPost.findMany({
                    // order by number of reports if sortByReports is true
                    orderBy: sortByReports === "true" ? { numReports: "desc" } : undefined,
                    skip: skip,
                    take: parseInt(limit),
                });
                totalItems = await prisma.blogPost.count();
            }
            else {
                content = await prisma.comment.findMany({
                    // order by number of reports if sortByReports is true
                    orderBy: sortByReports === "true" ? { numReports: "desc" } : undefined,
                    skip: skip,
                    take: parseInt(limit),
                });
                totalItems = await prisma.comment.count();
            }

            return res.status(200).json({
                content,
                totalItems,
                page: parseInt(page),
                totalPages: Math.ceil(totalItems / parseInt(limit)),
            });
        }

        else {
            return res.status(405).json({ message: "Method Not Allowed" });
        }
    });
}
