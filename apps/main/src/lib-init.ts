/**
 * Configures shared libraries with application-specific dependencies.
 * This module must be imported early (e.g., in server-side layout or instrumentation)
 * to ensure libraries are ready before any server-side operations.
 */

import { configureFirestoreLib } from '@preem-machine/firestore/server';
import { configureStripeLib } from '@preem-machine/stripe';

import { getFirestore } from '@/firebase/server/firebase-admin';
import { getSecrets } from '@/secrets';

// Initialize @preem-machine/firestore with the app's Firestore getter
configureFirestoreLib(getFirestore);

// Initialize @preem-machine/stripe with the app's secrets getter
configureStripeLib(getSecrets);
