import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); 

import authenticateJWT from '../../protected/authorization';

export default async function handler(req, res) {
    await authenticateJWT(req, res, async () => {

        if (req.method === "GET") {

            const userId  = req.user.id;

            const existingUser = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!existingUser) {
                return res.status(400).json({ error: "User Not Found"});
            }

            return res.status(200).json(existingUser);

        } else {
            res.status(405).json({ message: "Method not allowed" });
        }
    });
}






