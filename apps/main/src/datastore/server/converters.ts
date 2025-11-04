import {
  type DocumentData,
  DocumentReference,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore';
import { z } from 'zod';

// Recursive helper to convert Firestore Timestamps to JS Dates
const firestoreToZodRecursive = (
  data: DocumentData,
  memo: WeakMap<object, DocumentData>,
): DocumentData => {
  if (memo.has(data)) {
    // memo.has ensures the value.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return memo.get(data)!;
  }

  const converted: DocumentData = {};
  memo.set(data, converted);

  for (const key in data) {
    const value = data[key];
    if (value instanceof DocumentReference) {
      converted[key] = { id: value.id, path: value.path };
    } else if (value instanceof Timestamp) {
      converted[key] = value.toDate();
    } else if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      converted[key] = firestoreToZodRecursive(value, memo);
    } else {
      // Supported primitive.
      converted[key] = value;
    }
  }
  return converted;
};

const firestoreToSerializable = (data: DocumentData): DocumentData => {
  return firestoreToZodRecursive(data, new WeakMap<object, DocumentData>());
};

/**
 * A generic Firestore data converter that uses a Zod schema for validation.
 *
 * @template T - A Zod object schema.
 * @param schema - The Zod schema to use for parsing and validation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const converter = <T extends z.ZodObject<any, any>>(
  schema: T,
): FirestoreDataConverter<z.infer<T>> => ({
  toFirestore(modelObject: z.infer<T>): DocumentData {
    const dataToWrite = schema.parse(modelObject);
    return dataToWrite;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): z.infer<T> {
    const data = snapshot.data();

    // Convert to compatible client types
    const convertedData = firestoreToSerializable(data);

    const dataWithMetadata = {
      ...convertedData,
      id: snapshot.id,
      path: snapshot.ref.path,
    };

    const result = schema.safeParse(dataWithMetadata);

    if (!result.success) {
      throw new Error(
        `Data from Firestore ${snapshot.ref.path} failed Zod validation: ${z.prettifyError(result.error)}`,
      );
    }

    return result.data;
  },
});
