import jwt from 'jsonwebtoken';

export function issueTokens(user) {
  const payload = { id: user.id, username: user.username, role: user.role || 'USER' };
  return {
    accessToken: jwt.sign(payload, process.env.ACCESS_TOKEN, {
      algorithm: 'HS256', expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    }),
    refreshToken: jwt.sign(payload, process.env.REFRESH_TOKEN, {
      algorithm: 'HS256', expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    }),
  };
}
