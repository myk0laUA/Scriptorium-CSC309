const { randomUUID } = require('node:crypto');

// Provider IDs, not email addresses, are the durable authentication identity.
async function resolveOAuthUser(db, identity, linkUserId = null) {
  const { provider, providerAccountId, email, emailVerified, name } = identity;
  if (!['github', 'google'].includes(provider) || !providerAccountId) {
    throw new Error('InvalidProvider');
  }
  const where = { provider_providerAccountId: { provider, providerAccountId } };
  const existing = await db.oAuthAccount.findUnique({ where, include: { user: true } });
  if (existing) {
    if (linkUserId && existing.userId !== linkUserId) throw new Error('AccountAlreadyLinked');
    return existing.user;
  }
  if (linkUserId) {
    const linked = await db.oAuthAccount.create({
      data: { provider, providerAccountId, userId: linkUserId }, include: { user: true },
    });
    return linked.user;
  }
  if (!email || emailVerified !== true) throw new Error('VerifiedEmailRequired');
  const normalizedEmail = email.trim().toLowerCase();
  const collision = await db.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
  });
  if (collision) throw new Error('OAuthAccountNotLinked');
  const words = (name || 'Scriptorium User').trim().split(/\s+/);
  try {
    return await db.user.create({
      data: {
        username: `${provider}_${randomUUID().replaceAll('-', '')}`,
        firstName: words.shift() || 'Scriptorium', lastName: words.join(' '),
        email: normalizedEmail, role: 'USER',
        avatar: '/avatars/avatar1.png',
        oauthAccounts: { create: { provider, providerAccountId } },
      },
    });
  } catch (error) {
    // Concurrent callbacks must not create two users for the same identity.
    if (error.code === 'P2002') {
      const winner = await db.oAuthAccount.findUnique({ where, include: { user: true } });
      if (winner) return winner.user;
      throw new Error('OAuthAccountNotLinked');
    }
    throw error;
  }
}

module.exports = { resolveOAuthUser };
