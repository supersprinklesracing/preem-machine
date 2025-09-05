import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import { asDocPath } from './paths';
import type { ClientCompat } from './types';

/**
 * Recursively finds and converts all complex Firestore objects (Timestamp, DocumentReference)
 * within a data object into serializable primitives. This function is robust and handles
 * nested objects and arrays.
 * @param data The data object or array to traverse.
 * @returns A new, fully serializable object or array.
 */
function serializeFirestoreData(
  data: DocumentData,
): ClientCompat<DocumentData> {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Timestamp) {
    // @ts-expect-error Not sure why there is an error here, but it works.
    return data.toDate().toISOString();
  }

  if (data instanceof DocumentReference) {
    return { id: data.id, path: asDocPath(data.path) };
  }

  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData);
  }

  if (typeof data === 'object') {
    const newData: DocumentData = {};
    for (const key in data) {
      if (key === 'path' && typeof data[key] === 'string') {
        newData[key] = asDocPath(data[key]);
      } else {
        newData[key] = serializeFirestoreData(data[key]);
      }
    }
    return newData;
  }

  return data;
}

/**
 * A generic Firestore converter that can be used for any data type.
 * It handles two main tasks:
 * 1. Automatically adds the document `id` to the object.
 * 2. Recursively converts all Firestore Timestamps and DocumentReferences to serializable types.
 */
export const clientConverter = <T>(): FirestoreDataConverter<
  ClientCompat<T>
> => ({
  toFirestore: (data: ClientCompat<T>) => {
    // Note: This direction (writing to Firestore) is not fully implemented.
    return data as DocumentData;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): ClientCompat<T> => {
    const data = snapshot.data();
    const convertedData = serializeFirestoreData(data);
    return {
      id: snapshot.id,
      path: asDocPath(snapshot.ref.path),
      ...convertedData,
    } as unknown as ClientCompat<T>;
  },
});

export const serverConverter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore(data: T): DocumentData {
    return data as DocumentData;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): T {
    return snapshot.data() as T;
  },
});
