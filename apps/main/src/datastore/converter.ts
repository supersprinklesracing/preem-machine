import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { z } from 'zod';
import { asDocPath } from './paths';

function serialize(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  if (data.constructor.name === 'Timestamp') {
    return data.toDate().toISOString();
  }
  if (data.constructor.name === 'DocumentReference') {
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

function deserialize(data: any, firestore: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  if (typeof data === 'object' && 'id' in data && 'path' in data) {
    return firestore.doc(data.path);
  }
  if (typeof data === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(data)) {
    const { Timestamp } = require('firebase-admin/firestore');
    return Timestamp.fromDate(new Date(data));
  }
  if (Array.isArray(data)) {
    return data.map((item) => deserialize(item, firestore));
  }
  if (typeof data === 'object') {
    const newData: { [key: string]: any } = {};
    for (const key in data) {
      newData[key] = deserialize(data[key], firestore);
    }
    return newData;
  }
  return data;
}

export const converter = <T extends z.ZodTypeAny>(
  schema: T,
  firestore: any,
): FirestoreDataConverter<z.infer<T>> => ({
  toFirestore: (data: z.infer<T>): DocumentData => {
    const parsedData = schema.parse(data);
    const deserializedData = deserialize(parsedData, firestore);
    return deserializedData;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): z.infer<T> => {
    const serverData = {
      ...snapshot.data(),
      id: snapshot.id,
      path: asDocPath(snapshot.ref.path),
    };
    const clientData = serialize(serverData);
    return schema.parse(clientData);
  },
});
