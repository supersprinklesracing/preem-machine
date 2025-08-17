import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import { DeepClient } from './types';

/**
 * Recursively finds and converts all complex Firestore objects (Timestamp, DocumentReference)
 * within a data object into serializable primitives. This function is robust and handles
 * nested objects and arrays.
 * @param data The data object or array to traverse.
 * @returns A new, fully serializable object or array.
 */
function serializeFirestoreData(data: DocumentData): DeepClient<DocumentData> {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Timestamp) {
    // @ts-expect-error Not sure why there is an error here, but it works.
    return data.toDate().toISOString();
  }

  if (data instanceof DocumentReference) {
    return { id: data.id, path: data.path };
  }

  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData);
  }

  if (typeof data === 'object') {
    const newData: DocumentData = {};
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
export const genericConverter = <T>(): FirestoreDataConverter<
  DeepClient<T>
> => ({
  toFirestore: (data: DeepClient<T>) => {
    // Note: This direction (writing to Firestore) is not fully implemented.
    return data as DocumentData;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): DeepClient<T> => {
    const data = snapshot.data();
    const convertedData = serializeFirestoreData(data);
    return {
      id: snapshot.id,
      ...convertedData,
    } as unknown as DeepClient<T>;
  },
});
