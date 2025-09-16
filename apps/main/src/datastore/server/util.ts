/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFirestore } from '@/firebase/server';
import {
  CollectionReference,
  DocumentReference,
  type DocumentSnapshot,
} from 'firebase-admin/firestore';
import { z } from 'zod';
import { notFound } from '../errors';
import { converter } from './converters';
import { ENV_DEBUG_DATASTORE } from '@/env/env';

export const getDocRefInternal = async <T extends z.ZodObject<any, any>>(
  schema: T,
  path: string,
): Promise<DocumentReference<z.infer<T>>> => {
  const db = await getFirestore();
  if (ENV_DEBUG_DATASTORE) console.debug(`getDocRef: ${path}`);
  return db.doc(path).withConverter(converter(schema));
};

export const getCollectionRefInternal = async <T extends z.ZodObject<any, any>>(
  schema: T,
  path: string,
): Promise<CollectionReference<z.infer<T>>> => {
  const db = await getFirestore();
  if (ENV_DEBUG_DATASTORE) console.debug(`getCollectionRef: ${path}`);
  return db.collection(path).withConverter(converter(schema));
};

export const getDocSnapInternal = async <T extends z.ZodObject<any, any>>(
  schema: T,
  path: string,
): Promise<DocumentSnapshot<z.infer<T>>> => {
  const ref = await getDocRefInternal(schema, path);
  return ref.get();
};

export const getDocInternal = async <T extends z.ZodObject<any, any>>(
  schema: T,
  path: string,
): Promise<z.infer<T>> => {
  const data = (await getDocSnapInternal(schema, path)).data();
  if (!data) {
    notFound(`Doc not found: ${path}`);
  }
  return data;
};
