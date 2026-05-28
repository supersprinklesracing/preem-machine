import { FirestoreAdapter } from '@auth/firebase-adapter';
import {
  getAuthSecret,
  getGoogleClientId,
  getGoogleClientSecret,
} from '@preem-machine/env/server';
import NextAuth, { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import {
  getFirebaseAdminApp,
  getFirestore,
} from '@/firebase/server/firebase-admin';

declare module 'next-auth' {
  interface Session {
    firebaseToken?: string;
  }
}

const getConfig = async (): Promise<NextAuthConfig> => {
  const firestore = await getFirestore();
  const authSecret = getAuthSecret();

  if (!authSecret && process.env.NODE_ENV === 'production') {
    console.error(
      '🚨 AUTH_SECRET is not configured! Session tokens will be insecure.',
    );
  }

  const providers = [];

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

  const firestoreAdapter = FirestoreAdapter({
    firestore,
    collections: {
      users: 'services/authjs/users',
      accounts: 'services/authjs/accounts',
      sessions: 'services/authjs/sessions',
      verificationTokens: 'services/authjs/verificationTokens',
    },
  });

  return {
    providers,
    adapter: firestoreAdapter as NextAuthConfig['adapter'],
    session: {
      strategy: (process.env.E2E_TESTING === 'true' ? 'jwt' : 'database') as
        | 'jwt'
        | 'database',
    },
    callbacks: {
      async signIn({ user }) {
        const isE2eTesting = process.env.E2E_TESTING === 'true';
        if (
          user?.email?.toLowerCase() !== 'jlapenna@gmail.com' &&
          !isE2eTesting
        ) {
          console.warn(`Denied sign-in attempt for email: ${user?.email}`);
          return false;
        }
        return true;
      },
      async jwt({ token, user }) {
        if (user) {
          token.sub = user.id;
        }
        return token;
      },
      async session({ session, user, token }) {
        if (session.user) {
          session.user.id = user?.id || (token?.sub as string) || '';

          try {
            const adminApp = await getFirebaseAdminApp();
            session.firebaseToken = await adminApp
              .auth()
              .createCustomToken(session.user.id, {
                // Add any custom claims for Firestore rules here
              });
          } catch (error) {
            console.error('Failed to create Firebase custom token:', error);
          }
        }
        return session;
      },
    },
    secret: authSecret,
    trustHost: true,
  };
};

// Workaround for TypeScript inferred type limits
const nextAuthResult = NextAuth(getConfig);

export const handlers = nextAuthResult.handlers;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth: any = nextAuthResult.auth;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signIn: any = nextAuthResult.signIn;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signOut: any = nextAuthResult.signOut;
