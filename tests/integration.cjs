const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');
const { encode } = require('next-auth/jwt');
const jwt = require('jsonwebtoken');
const { resolveOAuthUser } = require('../utils/oauth-accounts.cjs');
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const prisma = new PrismaClient();
const suffix = Date.now().toString();
const ids = [];
async function post(path, body, headers = {}) {
  const response = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}
(async () => {
  assert.equal((await fetch(base + '/api/health')).status, 200);
  const signup = await post('/api/users/signup', {
    username: `test_${suffix}`, firstName: 'CI', lastName: 'User', email: `test_${suffix}@example.com`,
    phoneNum: suffix, password: 'test-password-123', role: 'ADMIN',
  });
  assert.equal(signup.status, 201);
  ids.push(signup.body.id);
  assert.equal(signup.body.role, 'USER');
  assert.equal(signup.body.password, undefined);
  const login = await post('/api/users/login', { username: signup.body.username, password: 'test-password-123' });
  assert.equal(login.status, 200);
  const profile = await fetch(base + '/api/users/retrieve', { headers: { Authorization: `Bearer ${login.body.accessToken}` } });
  assert.equal(profile.status, 200);
  assert.equal((await profile.json()).password, undefined);
  const edited = await fetch(base + '/api/users/edit-profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.body.accessToken}` },
    body: JSON.stringify({ avatar: '/avatars/avatar2.png' }),
  });
  assert.equal(edited.status, 200);
  assert.equal((await edited.json()).password, undefined);
  const oauth = await resolveOAuthUser(prisma, {
    provider: 'google', providerAccountId: `ci-${suffix}`, email: `oauth_${suffix}@example.com`,
    emailVerified: true, name: 'OAuth Test',
  });
  ids.push(oauth.id);
  assert.equal(oauth.password, null);
  const denied = await post('/api/users/login', { username: oauth.username, password: 'anything' });
  assert.equal(denied.status, 401);
  const linked = await resolveOAuthUser(prisma, { provider: 'github', providerAccountId: `ci-${suffix}` }, signup.body.id);
  assert.equal(linked.id, signup.body.id);
  const forged = await post('/api/users/oauth/complete', {}, { Origin: 'https://attacker.invalid' });
  assert.equal(forged.status, 403);
  const unauthenticated = await post('/api/users/oauth/complete', {}, { Origin: new URL(base).origin });
  assert.equal(unauthenticated.status, 401);
  const session = await encode({ secret: process.env.NEXTAUTH_SECRET, token: { appUserId: oauth.id }, maxAge: 600 });
  const exchange = await post('/api/users/oauth/complete', {}, {
    Origin: new URL(base).origin, Cookie: `next-auth.session-token=${session}`,
  });
  assert.equal(exchange.status, 200);
  const appToken = jwt.verify(exchange.body.accessToken, process.env.ACCESS_TOKEN);
  assert.equal(appToken.id, oauth.id);
  assert.equal(appToken.role, 'USER');
  const linkIntent = await fetch(base + '/api/users/oauth/link', {
    method: 'POST', headers: { Origin: new URL(base).origin, 'Content-Type': 'application/json', Authorization: `Bearer ${login.body.accessToken}` },
    body: JSON.stringify({ provider: 'github' }),
  });
  assert.equal(linkIntent.status, 204);
  assert.match(linkIntent.headers.get('set-cookie'), /HttpOnly/);
  assert.match(linkIntent.headers.get('set-cookie'), /SameSite=Lax/);
  console.log('Integration checks passed: DB, password login, OAuth accounts/linking, role safety, profile privacy, origin checks.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
});
