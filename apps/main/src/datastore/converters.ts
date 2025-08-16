import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';

/**
 * Recursively finds and converts all complex Firestore objects (Timestamp, DocumentReference)
 * within a data object into serializable primitives. This function is robust and handles
 * nested objects and arrays.
 * @param data The data object or array to traverse.
 * @returns A new, fully serializable object or array.
 */
function serializeFirestoreData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }

  if (data instanceof DocumentReference) {
    return { id: data.id, path: data.path };
  }

  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData);
  }

  if (typeof data === 'object') {
    const newData: { [key: string]: any } = {};
    for (const key in data) {
      newData[key] = serializeFirestoreData(data[key]);
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
export const genericConverter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: T) => {
    // Note: This direction (writing to Firestore) is not fully implemented.
    return data as DocumentData;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): T => {
    const data = snapshot.data();
    const convertedData = serializeFirestoreData(data);
    return {
      id: snapshot.id,
      ...convertedData,
    } as T;
  },
});
