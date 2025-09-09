import {
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore';
import { z } from 'zod';
import { asDocPath } from './paths';
import * as schema from './schema';

// Server Converter
export const serverConverter = <T extends z.ZodTypeAny>(
  schema: T,
): FirestoreDataConverter<z.infer<T>> => ({
  toFirestore: (data: z.infer<T>): DocumentData => {
    return schema.parse(data);
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): z.infer<T> => {
    const data = snapshot.data();
    return schema.parse({
      ...data,
      id: snapshot.id,
      path: asDocPath(snapshot.ref.path),
    });
  },
});

// Client Converter
function serialize(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }
  if (data instanceof DocumentReference) {
    return { id: data.id, path: asDocPath(data.path) };
  }
  if (Array.isArray(data)) {
    return data.map(serialize);
  }
  if (typeof data === 'object') {
    const newData: { [key: string]: any } = {};
    for (const key in data) {
      newData[key] = serialize(data[key]);
    }
    return newData;
  }
  return data;
}

export const clientConverter = <
  S extends z.ZodTypeAny,
  C extends z.ZodTypeAny
>(
  serverSchema: S,
  clientSchema: C,
): FirestoreDataConverter<z.infer<C>> => ({
  toFirestore: (data: z.infer<C>): DocumentData => {
    // This is not implemented as it's not needed for client-side operations.
    return data as DocumentData;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): z.infer<C> => {
    const serverData = serverSchema.parse({
      ...snapshot.data(),
      id: snapshot.id,
      path: asDocPath(snapshot.ref.path),
    });
    const clientData = serialize(serverData);
    return clientSchema.parse(clientData);
  },
});

// Specific Server Converters
export const userConverter = serverConverter(schema.ServerUserSchema);
export const organizationConverter = serverConverter(schema.ServerOrganizationSchema);
export const seriesConverter = serverConverter(schema.ServerSeriesSchema);
export const eventConverter = serverConverter(schema.ServerEventSchema);
export const raceConverter = serverConverter(schema.ServerRaceSchema);
export const preemConverter = serverConverter(schema.ServerPreemSchema);
export const contributionConverter = serverConverter(schema.ServerContributionSchema);

// Specific Client Converters
export const clientUserConverter = clientConverter(
  schema.ServerUserSchema,
  schema.ClientUserSchema,
);
export const clientOrganizationConverter = clientConverter(
  schema.ServerOrganizationSchema,
  schema.ClientOrganizationSchema,
);
export const clientSeriesConverter = clientConverter(
  schema.ServerSeriesSchema,
  schema.ClientSeriesSchema,
);
export const clientEventConverter = clientConverter(
  schema.ServerEventSchema,
  schema.ClientEventSchema,
);
export const clientRaceConverter = clientConverter(
  schema.ServerRaceSchema,
  schema.ClientRaceSchema,
);
export const clientPreemConverter = clientConverter(
  schema.ServerPreemSchema,
  schema.ClientPreemSchema,
);
export const clientContributionConverter = clientConverter(
  schema.ServerContributionSchema,
  schema.ClientContributionSchema,
);
