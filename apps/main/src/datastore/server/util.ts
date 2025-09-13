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

export const getDocRefInternal = async <T extends z.ZodObject<any, any>>(
  schema: T,
  path: string,
): Promise<DocumentReference<z.infer<T>>> => {
  const db = await getFirestore();
  return db.doc(path).withConverter(converter(schema));
};

export const getCollectionRefInternal = async <T extends z.ZodObject<any, any>>(
  schema: T,
  path: string,
): Promise<CollectionReference<z.infer<T>>> => {
  const db = await getFirestore();
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
    notFound('Doc not found');
  }
  return data;
};
