import { orThrow } from '@/env/env';

export const clientConfig = {
  projectId: orThrow(process.env.NEXT_PUBLIC_PROJECT_ID),
  apiKey: orThrow(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: orThrow(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  messagingSenderId: orThrow(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  ),
  storageBucket: orThrow(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  // Optional
  // databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  // Optional – required if your app uses AppCheck – https://firebase.google.com/docs/app-check
  // appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
