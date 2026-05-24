import {
  getGoogleClientId,
  getGoogleClientSecret,
  getStravaClientId,
  getStravaClientSecret,
} from '@preem-machine/env/server';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import StravaProvider from 'next-auth/providers/strava';

import { filterStandardClaims } from '@/auth/server/auth-context-user';
import { clientConfig } from '@/firebase/client/config';
import { getFirebaseAdminApp } from '@/firebase/server/firebase-admin';

const nextAuth = NextAuth({
  providers: [
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
            throw new Error('Token verification failed');
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
    StravaProvider({
      clientId: getStravaClientId(),
      clientSecret: getStravaClientSecret(),
    }),
    GoogleProvider({
      clientId: getGoogleClientId(),
      clientSecret: getGoogleClientSecret(),
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        (token as { token?: string }).token = (
          user as { token?: string }
        ).token;

        let customClaims = (user as { customClaims?: Record<string, unknown> })
          .customClaims;
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
        (token as { customClaims?: Record<string, unknown> }).customClaims =
          customClaims || {};
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        (session as { token?: string }).token = (
          token as { token?: string }
        ).token;
        (session as { customClaims?: Record<string, unknown> }).customClaims = (
          token as { customClaims?: Record<string, unknown> }
        ).customClaims;
      }
      return session;
    },
  },
  secret:
    process.env.AUTH_SECRET ||
    'fallback-secret-for-development-only-1234567890',
  trustHost: true,
});

export const handlers = nextAuth.handlers;
export const auth: typeof nextAuth.auth = nextAuth.auth;
export const signIn: typeof nextAuth.signIn = nextAuth.signIn;
export const signOut: typeof nextAuth.signOut = nextAuth.signOut;
