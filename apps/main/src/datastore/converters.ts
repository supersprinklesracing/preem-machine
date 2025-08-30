import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import type { ClientCompat, Event, Preem, Race, Series } from './types';

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
      ...convertedData,
    } as unknown as ClientCompat<T>;
  },
});

export const preemConverter: FirestoreDataConverter<Preem> = {
  toFirestore(preem: Preem): DocumentData {
    return preem;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Preem {
    return snapshot.data() as Preem;
  },
};

export const raceConverter: FirestoreDataConverter<Race> = {
  toFirestore(race: Race): DocumentData {
    return race;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Race {
    return snapshot.data() as Race;
  },
};

export const eventConverter: FirestoreDataConverter<Event> = {
  toFirestore(event: Event): DocumentData {
    return event;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Event {
    return snapshot.data() as Event;
  },
};

export const seriesConverter: FirestoreDataConverter<Series> = {
  toFirestore(series: Series): DocumentData {
    return series;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Series {
    return snapshot.data() as Series;
  },
};
