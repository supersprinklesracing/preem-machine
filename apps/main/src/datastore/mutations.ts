'use server';

import { AuthContextUser } from '@/auth/AuthContext';
import { getFirestore } from '@/firebase-admin/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { unauthorized } from 'next/navigation';
import { getTimestampFromISODate } from '../firebase-admin/dates';
import { isUserAuthorized } from './access';
import type { Event, Organization, Series, User } from './types';

export const updateUser = async (
  path: string,
  user: Partial<User>,
  authUser: AuthContextUser
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const docRef = db.doc(path);
  await docRef.update({
    ...user,
    'metadata.lastModified': FieldValue.serverTimestamp(),
    'metadata.lastModifiedBy': docRef,
  });
};

export const updateOrganization = async (
  path: string,
  organization: Partial<Organization>,
  authUser: AuthContextUser
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const orgRef = db.doc(path);
  const userRef = db.collection('users').doc(authUser.uid);
  await orgRef.update({
    ...organization,
    'metadata.lastModified': FieldValue.serverTimestamp(),
    'metadata.lastModifiedBy': userRef,
  });
};

export const updateSeries = async (
  path: string,
  series: Partial<Omit<Series, 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
  authUser: AuthContextUser
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const seriesRef = db.doc(path);
  const userRef = db.collection('users').doc(authUser.uid);
  await seriesRef.update({
    ...series,
    startDate: getTimestampFromISODate(series.startDate),
    endDate: getTimestampFromISODate(series.endDate),
    'metadata.lastModified': FieldValue.serverTimestamp(),
    'metadata.lastModifiedBy': userRef,
  });
};

export const updateEvent = async (
  path: string,
  event: Partial<Omit<Event, 'startDate' | 'endDate'>> & {
    startDate?: string;
    endDate?: string;
  },
  authUser: AuthContextUser
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const eventRef = db.doc(path);
  const userRef = db.collection('users').doc(authUser.uid);
  await eventRef.update({
    ...event,
    startDate: getTimestampFromISODate(event.startDate),
    endDate: getTimestampFromISODate(event.endDate),
    'metadata.lastModified': FieldValue.serverTimestamp(),
    'metadata.lastModifiedBy': userRef,
  });
};
