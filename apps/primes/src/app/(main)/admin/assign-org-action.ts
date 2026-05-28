'use server';

import { revalidatePath } from 'next/cache';

import { OrganizationSchema, UserSchema } from '@/datastore/schema';
import { converter } from '@/datastore/server/converters';
import { getFirestore } from '@/firebase/server/firebase-admin';

export async function assignOrg(userId: string, orgId: string) {
  const db = await getFirestore();
  const userRef = db.collection('users').doc(userId);
  const orgRef = db.collection('organizations').doc(orgId);

  const userSnap = await userRef.withConverter(converter(UserSchema)).get();
  const orgSnap = await orgRef
    .withConverter(converter(OrganizationSchema))
    .get();

  if (!userSnap.exists || !orgSnap.exists) {
    throw new Error('User or Organization not found');
  }

  const user = userSnap.data();
  const org = orgSnap.data();

  if (!user || !org) {
    throw new Error('User or Organization data not found');
  }

  const orgRefArray = user.organizationRefs || [];
  if (!orgRefArray.find((ref) => ref.id === orgId)) {
    await userRef.update({
      organizationRefs: [...orgRefArray, orgRef],
    });
  }

  const memberRefArray = org.memberRefs || [];
  if (!memberRefArray.find((ref) => ref.id === userId)) {
    await orgRef.update({
      memberRefs: [...memberRefArray, userRef],
    });
  }

  revalidatePath('/admin');
}
