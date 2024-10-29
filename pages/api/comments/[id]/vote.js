import prisma from "@/utils/db";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { id } = req.query;
        const { vote } = req.body;

        if (!id || !vote || !["upvote", "downvote"].includes(vote)) {
            return res.status(400).json({ message: "Comment ID and Vote are required" + id + vote});
        }

        // Authentication placeholder
        const user = { id: 1 }; // placeholder

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

        // Check that the user hasn't already voted
        const hasUpvoted = comment.upvotedByUsers.some(userVote => userVote.id === user.id);
        const hasDownvoted = comment.downvotedByUsers.some(userVote => userVote.id === user.id);

        if ((hasUpvoted && vote === "upvote" ) || (hasDownvoted && vote === "downvote")) {
            return res.status(400).json({ message: "User has already voted on this comment" });
        }

        let updateData = {};
        if (vote === "upvote") {
        updateData = { rating: comment.rating + 1, upvotedByUsers: { connect: { id: user.id } } };
        } else if (vote === "downvote") {
        updateData = { rating: comment.rating - 1, downvotedByUsers: { connect: { id: user.id } } };
        }

        try {
            const updatedComment = await prisma.comment.update({
                where: { id: parseInt(id) },
                data: updateData,
            });
            return res.status(200).json(updatedComment);
        } catch (error) {
            return res.status(500).json({ error: "Failed to update vote" + error + updateData.upvotes});
        }
    }
    else {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    
}