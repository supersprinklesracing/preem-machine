import type { Firestore } from 'firebase-admin/firestore';

type FirestoreGetter = () => Promise<Firestore>;

let _getFirestore: FirestoreGetter | null = null;

/**
 * Configure the firestore library with the application's Firestore getter.
 * Must be called before any server-side firestore operations.
 */
export function configureFirestoreLib(getFirestore: FirestoreGetter): void {
  _getFirestore = getFirestore;
}

/**
 * Returns the configured Firestore getter.
 * Throws if the library has not been configured yet.
 */
export function getConfiguredFirestore(): Promise<Firestore> {
  if (!_getFirestore) {
    throw new Error(
      '@preem-machine/firestore: Library not configured. ' +
        'Call configureFirestoreLib(getFirestore) before using server functions.',
    );
  }
  return _getFirestore();
}
