import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method == 'POST') {

        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token is required' });
        }

        try {
            const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);

            const payload = {
                id: user.id,
                username: user.username,
                role: user.role,
            };

            const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });

            return res.status(200).json({
                accessToken
            });

        } catch (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}