import { orThrow } from '@/env/env';

export const clientConfig = {
  apiKey: orThrow(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: orThrow(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  databaseURL: orThrow(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL),
  projectId: orThrow(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  messagingSenderId: orThrow(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  ),
  // Optional – required if your app uses AppCheck – https://firebase.google.com/docs/app-check
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // Optional – required if your app uses Multi-Tenancy – https://cloud.google.com/identity-platform/docs/multi-tenancy-authentication
  tenantId: process.env.NEXT_PUBLIC_FIREBASE_AUTH_TENANT_ID,
};
