import {
  type DocumentData,
  DocumentReference,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore';
import { z } from 'zod';

import { DocPath } from '../paths';

/**
 * Checks if a value is a Firebase Timestamp.
 */
function isTimestamp(val: unknown): val is Timestamp {
  return (
    val !== null &&
    typeof val === 'object' &&
    typeof (val as { toDate?: unknown }).toDate === 'function'
  );
}

/**
 * Checks if a value is a plain object.
 */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (typeof v !== 'object' || v === null) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

type Traversable = Record<string, unknown> | unknown[];

/**
 * Removes all keys with undefined values from an object using a stack-safe, iterative approach.
 * Handles circular references and circular data structures seamlessly.
 */
export function stripUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  const clones = new Map<unknown, unknown>();

  const stripLeaf = (
    val: unknown,
  ):
    | { result: unknown; shouldRecurse: false }
    | { result: Traversable; shouldRecurse: true; val: Traversable } => {
    if (val === null || typeof val !== 'object')
      return { result: val, shouldRecurse: false };
    if (
      isTimestamp(val) ||
      val instanceof DocumentReference ||
      (!Array.isArray(val) && !isPlainObject(val))
    ) {
      return { result: val, shouldRecurse: false };
    }
    if (clones.has(val))
      return { result: clones.get(val), shouldRecurse: false };

    const clone = Array.isArray(val) ? [] : {};
    clones.set(val, clone);
    return { result: clone, shouldRecurse: true, val };
  };

  const leaf = stripLeaf(obj);
  if (!leaf.shouldRecurse) return leaf.result as T;

  interface StackEntry {
    original: Traversable;
    clone: Traversable;
    keys: (string | number)[];
    index: number;
  }

  const stack: StackEntry[] = [
    {
      original: leaf.val,
      clone: leaf.result,
      keys: Array.isArray(leaf.val)
        ? Array.from(leaf.val.keys())
        : Object.keys(leaf.val),
      index: 0,
    },
  ];

  while (stack.length > 0) {
    const top = stack[stack.length - 1];
    const { original, clone, keys, index } = top;

    if (index >= keys.length) {
      stack.pop();
      continue;
    }

    const key = keys[index];
    top.index++;

    let val: unknown;
    if (Array.isArray(original)) {
      if (typeof key === 'number') {
        val = original[key];
      } else {
        continue;
      }
    } else {
      if (typeof key === 'string') {
        val = original[key];
      } else {
        continue;
      }
    }
    if (val === undefined) continue;

    const leafVal = stripLeaf(val);
    if (Array.isArray(clone)) {
      clone.push(leafVal.result);
    } else {
      if (typeof key === 'string') {
        clone[key] = leafVal.result;
      }
    }

    if (leafVal.shouldRecurse) {
      stack.push({
        original: leafVal.val,
        clone: leafVal.result,
        keys: Array.isArray(leafVal.val)
          ? Array.from(leafVal.val.keys())
          : Object.keys(leafVal.val),
        index: 0,
      });
    }
  }

  return leaf.result as T;
}

/**
 * Recursively converts Firestore Timestamps to native JS Dates.
 * Iterative stack-safe implementation to handle circular references.
 */
export function convertTimestamps<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  const clones = new Map<unknown, unknown>();

  const convertLeaf = (
    val: unknown,
  ):
    | { result: unknown; shouldRecurse: false }
    | { result: Traversable; shouldRecurse: true; val: Traversable } => {
    if (val === null || typeof val !== 'object')
      return { result: val, shouldRecurse: false };
    if (isTimestamp(val)) return { result: val.toDate(), shouldRecurse: false };
    if (
      val instanceof DocumentReference ||
      (!Array.isArray(val) && !isPlainObject(val))
    )
      return { result: val, shouldRecurse: false };
    if (clones.has(val))
      return { result: clones.get(val), shouldRecurse: false };

    const clone = Array.isArray(val) ? [] : {};
    clones.set(val, clone);
    return { result: clone, shouldRecurse: true, val };
  };

  const leaf = convertLeaf(obj);
  if (!leaf.shouldRecurse) return leaf.result as T;

  interface StackEntry {
    original: Traversable;
    clone: Traversable;
    keys: (string | number)[];
    index: number;
  }

  const stack: StackEntry[] = [
    {
      original: leaf.val,
      clone: leaf.result,
      keys: Array.isArray(leaf.val)
        ? Array.from(leaf.val.keys())
        : Object.keys(leaf.val),
      index: 0,
    },
  ];

  while (stack.length > 0) {
    const top = stack[stack.length - 1];
    const { original, clone, keys, index } = top;

    if (index >= keys.length) {
      stack.pop();
      continue;
    }

    const key = keys[index];
    top.index++;

    let val: unknown;
    if (Array.isArray(original)) {
      if (typeof key === 'number') {
        val = original[key];
      } else {
        continue;
      }
    } else {
      if (typeof key === 'string') {
        val = original[key];
      } else {
        continue;
      }
    }
    const leafVal = convertLeaf(val);

    if (Array.isArray(clone)) {
      clone.push(leafVal.result);
    } else {
      if (typeof key === 'string') {
        clone[key] = leafVal.result;
      }
    }

    if (leafVal.shouldRecurse) {
      stack.push({
        original: leafVal.val,
        clone: leafVal.result,
        keys: Array.isArray(leafVal.val)
          ? Array.from(leafVal.val.keys())
          : Object.keys(leafVal.val),
        index: 0,
      });
    }
  }

  return leaf.result as T;
}

/**
 * A generic, type-safe Firestore data converter following the premium patterns of the members project.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const converter = <T extends z.ZodObject<any, any>>(
  schema: T,
  options: { idField?: string; logWarnings?: boolean } = { logWarnings: true },
): FirestoreDataConverter<z.infer<T>> => ({
  toFirestore(modelObject: z.infer<T>): DocumentData {
    const dataToWrite = schema.parse(modelObject);
    return stripUndefined(dataToWrite);
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): z.infer<T> {
    const rawData = snapshot.data();

    // Convert Firestore native types
    const convertedData = convertTimestamps(rawData);

    // Assign directly as DocPath to support raw mock paths in testing environments
    const dataWithMetadata = {
      ...convertedData,
      id: snapshot.id,
      path: snapshot.ref.path as DocPath,
    };

    const result = schema.safeParse(dataWithMetadata);

    if (!result.success) {
      if (options.logWarnings) {
        console.warn(
          `⚠️ [FirestoreConverter] Validation failed for document ${snapshot.ref.path}:\n` +
            z.prettifyError(result.error) +
            `\nReturning raw data as a fallback to prevent frontend crashes.`,
        );
      }
      return dataWithMetadata as z.infer<T>;
    }

    return result.data;
  },
});
