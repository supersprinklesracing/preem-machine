import {
  getAuthSecret,
  getGoogleClientId,
  getGoogleClientSecret,
} from '@preem-machine/env/server';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import { filterStandardClaims } from '@/auth/server/auth-context-user';
import { clientConfig } from '@/firebase/client/config';
import { getFirebaseAdminApp } from '@/firebase/server/firebase-admin';

/**
 * Build the list of providers dynamically.
 * OAuth providers are only registered when their required env vars are present.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildProviders(): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providers: any[] = [
    CredentialsProvider({
      id: 'credentials',
      name: 'Firebase Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        if (credentials?.token) {
          try {
            const adminApp = await getFirebaseAdminApp();
            const decodedToken = await adminApp
              .auth()
              .verifyIdToken(credentials.token as string);
            const customClaims = filterStandardClaims(
              decodedToken as unknown as Record<string, unknown>,
            );
            return {
              id: decodedToken.uid,
              email: decodedToken.email || null,
              name: decodedToken.name || null,
              image: decodedToken.picture || null,
              token: credentials.token as string,
              customClaims,
            };
          } catch (error) {
            console.error('Error verifying credentials token:', error);
            throw new Error('Token verification failed', { cause: error });
          }
        }

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const res = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${clientConfig.apiKey}`,
          {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              returnSecureToken: true,
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        );

        const data = await res.json();
        if (res.ok && data.localId) {
          let customClaims = {};
          try {
            const adminApp = await getFirebaseAdminApp();
            const decodedToken = await adminApp
              .auth()
              .verifyIdToken(data.idToken);
            customClaims = filterStandardClaims(
              decodedToken as unknown as Record<string, unknown>,
            );
          } catch (error) {
            console.error(
              'Error verifying email/password token for custom claims:',
              error,
            );
          }
          return {
            id: data.localId,
            email: data.email,
            name: data.displayName || null,
            image: data.photoUrl || null,
            token: data.idToken,
            customClaims,
          };
        }

        throw new Error(data.error?.message || 'Authentication failed');
      },
    }),
  ];

  // Only register Google OAuth if both client ID and secret are configured
  const googleId = getGoogleClientId();
  const googleSecret = getGoogleClientSecret();
  if (googleId && googleSecret) {
    providers.push(
      GoogleProvider({
        clientId: googleId,
        clientSecret: googleSecret,
      }),
    );
  }

  return providers;
}

const authSecret = getAuthSecret();
if (!authSecret && process.env.NODE_ENV === 'production') {
  console.error(
    '🚨 AUTH_SECRET is not configured! Session tokens will be insecure.',
  );
}

const nextAuth = NextAuth({
  providers: buildProviders(),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user }) {
      const isE2eTesting = process.env.E2E_TESTING === 'true';
      if (user.email?.toLowerCase() !== 'jlapenna@gmail.com' && !isE2eTesting) {
        console.warn(`Denied sign-in attempt for email: ${user.email}`);
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.token = user.token;

        let customClaims = user.customClaims;
        if (!customClaims && user.email) {
          try {
            const adminApp = await getFirebaseAdminApp();
            const firebaseUser = await adminApp
              .auth()
              .getUserByEmail(user.email);
            customClaims = filterStandardClaims(
              firebaseUser.customClaims as Record<string, unknown>,
            );
          } catch {
            console.log(
              'Firebase user not found by email for custom claims:',
              user.email,
            );
          }
        }
        token.customClaims = customClaims || {};
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.token = token.token as string | undefined;
        session.customClaims = token.customClaims as
          | Record<string, unknown>
          | undefined;
      }
      return session;
    },
  },
  secret: authSecret,
  trustHost: true,
});

export const handlers = nextAuth.handlers;
export const auth: typeof nextAuth.auth = nextAuth.auth;
export const signIn: typeof nextAuth.signIn = nextAuth.signIn;
export const signOut: typeof nextAuth.signOut = nextAuth.signOut;
