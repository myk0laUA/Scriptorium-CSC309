const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveOAuthUser } = require('../utils/oauth-accounts.cjs');

const identity = { provider: 'google', providerAccountId: '123', email: 'User@Example.com', emailVerified: true, name: 'Demo User' };
function database({ account = null, collision = null } = {}) {
  let created;
  return {
    oAuthAccount: {
      findUnique: async () => account,
      create: async ({ data }) => ({ user: { id: data.userId, role: 'ADMIN' } }),
    },
    user: {
      findFirst: async () => collision,
      create: async ({ data }) => { created = data; return { id: 10, ...data }; },
    },
    created: () => created,
  };
}
test('existing provider ID retains the original account even if email changed', async () => {
  const db = database({ account: { userId: 8, user: { id: 8 } } });
  assert.equal((await resolveOAuthUser(db, { ...identity, email: 'changed@example.com' })).id, 8);
  assert.equal(db.created(), undefined);
});
test('email collision never silently links an existing password account', async () => {
  await assert.rejects(resolveOAuthUser(database({ collision: { id: 1 } }), identity), /OAuthAccountNotLinked/);
});
test('new provider account requires a verified email', async () => {
  await assert.rejects(resolveOAuthUser(database(), { ...identity, emailVerified: false }), /VerifiedEmailRequired/);
});
test('new accounts have USER role, normalized email and no invented password or phone', async () => {
  const user = await resolveOAuthUser(database(), identity);
  assert.equal(user.role, 'USER');
  assert.equal(user.email, 'user@example.com');
  assert.equal(user.password, undefined);
  assert.equal(user.phoneNum, undefined);
  assert.deepEqual(user.oauthAccounts.create, { provider: 'google', providerAccountId: '123' });
});
test('authenticated linking retains the existing account and role', async () => {
  const user = await resolveOAuthUser(database(), identity, 20);
  assert.equal(user.id, 20);
  assert.equal(user.role, 'ADMIN');
});
test('cannot link a provider belonging to a different user', async () => {
  await assert.rejects(resolveOAuthUser(database({ account: { userId: 8, user: { id: 8 } } }), identity, 20), /AccountAlreadyLinked/);
});
test('concurrent callback resolves the already-created provider account', async () => {
  const db = database();
  let calls = 0;
  db.oAuthAccount.findUnique = async () => ++calls === 1 ? null : { user: { id: 40 } };
  db.user.create = async () => { throw Object.assign(new Error('duplicate'), { code: 'P2002' }); };
  assert.equal((await resolveOAuthUser(db, identity)).id, 40);
});
