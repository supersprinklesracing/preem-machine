import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore';
import { z } from 'zod';

// Recursive helper to convert Firestore Timestamps to JS Dates
const firestoreToZod = (data: DocumentData): DocumentData => {
  const converted: DocumentData = {};
  for (const key in data) {
    const value = data[key];
    if (value instanceof Timestamp) {
      converted[key] = value.toDate();
    } else if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      // Recursively process nested objects
      converted[key] = firestoreToZod(value);
    } else {
      converted[key] = value;
    }
  }
  return converted;
};

/**
 * A generic Firestore data converter that uses a Zod schema for validation.
 *
 * @template T - A Zod object schema.
 * @param schema - The Zod schema to use for parsing and validation.
 */
export const converter = <T extends z.ZodObject<any, any>>(
  schema: T,
): FirestoreDataConverter<z.infer<T>> => ({
  toFirestore(modelObject: z.infer<T>): DocumentData {
    const dataToWrite = schema.parse(modelObject);
    return dataToWrite;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): z.infer<T> {
    const data = snapshot.data();

    // Convert all Timestamps to JS Dates before parsing
    const convertedData = firestoreToZod(data);

    const dataWithMetadata = {
      ...convertedData,
      id: snapshot.id,
      path: snapshot.ref.path,
    };

    const result = schema.safeParse(dataWithMetadata);

    if (!result.success) {
      console.error('Zod validation failed:', result.error.format());
      throw new Error('Data from Firestore failed Zod validation.');
    }

    return result.data;
  },
});
