import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import jwt from 'jsonwebtoken';
import prisma from './db';
import { resolveOAuthUser } from './oauth-accounts.cjs';

export const linkCookieName = process.env.NODE_ENV === 'production'
  ? '__Host-scriptorium-link' : 'scriptorium-link';

export function linkCookie(value, maxAge) {
  return `${linkCookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

export function authOptions(req) {
  const providers = [];
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET,
      checks: ['state'],
      authorization: { params: { scope: 'read:user user:email' } },
    }));
  }
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      checks: ['pkce', 'state'],
      authorization: { params: { scope: 'openid email profile', prompt: 'select_account' } },
    }));
  }
  return {
    secret: process.env.NEXTAUTH_SECRET,
    providers,
    session: { strategy: 'jwt', maxAge: 10 * 60 },
    pages: { signIn: '/login', error: '/login' },
    callbacks: {
      async signIn({ user, account, profile }) {
        try {
          let linkUserId = null;
          const intent = req.cookies[linkCookieName];
          if (intent) {
            const claim = jwt.verify(intent, process.env.NEXTAUTH_SECRET, {
              algorithms: ['HS256'], audience: 'oauth-link',
            });
            if (claim.provider !== account.provider) throw new Error('InvalidLink');
            linkUserId = claim.userId;
          }
          let email = user.email;
          let emailVerified = profile.email_verified === true;
          if (account.provider === 'github') {
            const response = await fetch('https://api.github.com/user/emails', {
              headers: { Authorization: `Bearer ${account.access_token}`, Accept: 'application/vnd.github+json' },
              signal: AbortSignal.timeout(10000),
            });
            if (!response.ok) throw new Error('VerifiedEmailRequired');
            const emails = await response.json();
            const verified = emails.find(item => item.primary && item.verified)
              || emails.find(item => item.verified);
            email = verified?.email;
            emailVerified = !!verified;
          }
          const appUser = await resolveOAuthUser(prisma, {
            provider: account.provider, providerAccountId: String(account.providerAccountId),
            email, emailVerified, name: user.name,
          }, linkUserId);
          user.appUserId = appUser.id;
          return true;
        } catch (error) {
          const known = ['OAuthAccountNotLinked', 'AccountAlreadyLinked', 'VerifiedEmailRequired'];
          return `/login?error=${known.includes(error.message) ? error.message : 'OAuthSignin'}`;
        }
      },
      async jwt({ token, user }) {
        if (user) token.appUserId = user.appUserId;
        return token;
      },
      async redirect({ url, baseUrl }) {
        // Only these application destinations are allowed after OAuth.
        const target = new URL(url, baseUrl);
        if (target.origin === new URL(baseUrl).origin && ['/auth/complete', '/login', '/'].includes(target.pathname)) {
          return target.href;
        }
        return `${baseUrl}/auth/complete`;
      },
    },
  };
}
