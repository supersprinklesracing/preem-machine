'use server';

import { AuthContextUser } from '@/auth/AuthContext';
import { getFirestore } from '@/firebase-admin/firebase-admin';
import {
  DocumentData,
  FieldValue,
  type DocumentReference,
  type Transaction,
} from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { isUserAuthorized } from './access';
import { serverConverter } from './converters';
import { NotFoundError, unauthorized } from './errors';
import { asDocPath, getSubCollectionPath } from './paths';
import type {
  Contribution,
  Event,
  EventBrief,
  Organization,
  OrganizationBrief,
  Preem,
  PreemBrief,
  Race,
  RaceBrief,
  Series,
  SeriesBrief,
  User,
} from './types';

interface DocUpdate<T> {
  ref: DocumentReference<T>;
  updates: Partial<T>;
}

const getDocRef = async <T>(path: string) => {
  const db = await getFirestore();
  return db.doc(path).withConverter(serverConverter<T>());
};

const getCollectionRef = async <T>(path: string) => {
  const db = await getFirestore();
  return db.collection(path).withConverter(serverConverter<T>());
};

const getUpdateMetadata = (userRef: DocumentReference<DocumentData>) => ({
  'metaupdates.lastModified': FieldValue.serverTimestamp(),
  'metaupdates.lastModifiedBy': userRef,
});

export const updateUser = async (
  path: string,
  user: Pick<User, 'name' | 'affiliation' | 'raceLicenseId' | 'address'>,
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const docRef = db.doc(path);
  await docRef.update({
    ...user,
    ...getUpdateMetadata(docRef),
  });
};

export const updateOrganizationStripeConnectAccount = async (
  organizationId: string,
  account: Stripe.Account,
  authUser: AuthContextUser,
) => {
  const path = `organizations/${organizationId}`;
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  const orgRef = db.doc(path);
  const userRef = db.collection('users').doc(authUser.uid);
  await orgRef.update({
    'stripe.connectAccountId': account.id,
    'stripe.account': account,
    ...getUpdateMetadata(userRef),
  });
};

export const updateOrganizationStripeConnectAccountForWebhook = async (
  organizationId: string,
  account: Stripe.Account,
) => {
  const db = await getFirestore();
  const orgRef = db.doc(`organizations/${organizationId}`);
  await orgRef.update({
    'stripe.connectAccountId': account.id,
    'stripe.account': account,
    'metaupdates.lastModified': FieldValue.serverTimestamp(),
  });
};

export const updateOrganization = async (
  path: string,
  updates: Pick<Organization, 'name' | 'website' | 'description'>,
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  return await db.runTransaction(async (transaction) => {
    const ref = await getDocRef<Organization>(path);
    const doc = await transaction.get(ref);
    const existingData = doc.data();
    if (!existingData) {
      throw new NotFoundError("Organization doesn't exist");
    }
    const { name } = existingData;
    const organizationBrief: OrganizationBrief = {
      id: ref.id,
      path: ref.path,
      name: updates.name ?? name,
    };
    transaction.update(ref, updates);

    let descendantUpdates: DocUpdate<unknown>[] = [];
    if (updates.name) {
      descendantUpdates = await prepareOrganizationDescendantUpdates(
        transaction,
        path,
        organizationBrief,
      );
      for (const { ref, updates } of descendantUpdates) {
        transaction.update(ref, updates);
      }
    }

    return [{ ref, updates }, ...descendantUpdates];
  });
};

const prepareOrganizationDescendantUpdates = async (
  transaction: Transaction,
  path: string,
  organizationBrief: OrganizationBrief,
): Promise<DocUpdate<unknown>[]> => {
  let updates: DocUpdate<unknown>[] = [];
  const seriesSnap = await transaction.get(
    await getCollectionRef<Series>(getSubCollectionPath(path, 'series')),
  );

  for (const doc of seriesSnap.docs) {
    updates.push({ ref: doc.ref, updates: { organizationBrief } });
    const newSeriesBrief: SeriesBrief = {
      id: doc.id,
      path: asDocPath(doc.ref.path),
      name: doc.data().name,
      startDate: doc.data().startDate,
      endDate: doc.data().endDate,
      organizationBrief,
    };
    const descendantUpdates = await prepareSeriesDescendantUpdates(
      transaction,
      doc.ref.path,
      newSeriesBrief,
    );
    updates = updates.concat(descendantUpdates);
  }
  return updates;
};

export const updateSeries = async (
  path: string,
  updates: Pick<
    Series,
    'name' | 'website' | 'location' | 'description' | 'startDate' | 'endDate'
  >,
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  return await db.runTransaction(async (transaction) => {
    const ref = await getDocRef<Series>(path);
    const doc = await transaction.get(ref);
    const existingData = doc.data();
    if (!existingData) {
      throw new NotFoundError("Series doesn't exist");
    }
    const { name, startDate, endDate, organizationBrief } = existingData;
    const seriesBrief: SeriesBrief = {
      id: ref.id,
      path: ref.path,
      name: updates.name ?? name,
      startDate: updates.startDate ?? startDate,
      endDate: updates.endDate ?? endDate,
      organizationBrief: organizationBrief,
    };
    transaction.update(ref, updates);

    let descendantUpdates: DocUpdate<unknown>[] = [];
    if (updates.name || updates.startDate || updates.endDate) {
      descendantUpdates = await prepareSeriesDescendantUpdates(
        transaction,
        path,
        seriesBrief,
      );
      for (const { ref, updates } of descendantUpdates) {
        transaction.update(ref, updates);
      }
    }

    return [{ ref, updates }, ...descendantUpdates];
  });
};

const prepareSeriesDescendantUpdates = async (
  transaction: Transaction,
  path: string,
  seriesBrief: SeriesBrief,
): Promise<DocUpdate<unknown>[]> => {
  let updates: DocUpdate<unknown>[] = [];
  const eventSnap = await transaction.get(
    await getCollectionRef<Event>(getSubCollectionPath(path, 'events')),
  );

  for (const doc of eventSnap.docs) {
    updates.push({ ref: doc.ref, updates: { seriesBrief } });
    const newEventBrief: EventBrief = {
      id: doc.id,
      path: asDocPath(doc.ref.path),
      name: doc.data().name,
      startDate: doc.data().startDate,
      endDate: doc.data().endDate,
      seriesBrief,
    };
    const descendantUpdates = await prepareEventDescendantUpdates(
      transaction,
      doc.ref.path,
      newEventBrief,
    );
    updates = updates.concat(descendantUpdates);
  }
  return updates;
};

export const updateEvent = async (
  path: string,
  updates: Pick<
    Event,
    'name' | 'description' | 'website' | 'location' | 'startDate' | 'endDate'
  >,
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  return await db.runTransaction(async (transaction) => {
    const ref = await getDocRef<Event>(path);
    const doc = await transaction.get(ref);
    const existingData = doc.data();
    if (!existingData) {
      throw new NotFoundError("Event doesn't exist");
    }
    const { name, startDate, endDate, seriesBrief } = existingData;
    const eventBrief: EventBrief = {
      id: ref.id,
      path: ref.path,
      name: updates.name ?? name,
      startDate: updates.startDate ?? startDate,
      endDate: updates.endDate ?? endDate,
      seriesBrief: seriesBrief,
    };
    transaction.update(ref, updates);

    let descendantUpdates: DocUpdate<unknown>[] = [];
    if (updates.name || updates.startDate || updates.endDate) {
      descendantUpdates = await prepareEventDescendantUpdates(
        transaction,
        path,
        eventBrief,
      );
      for (const { ref, updates } of descendantUpdates) {
        transaction.update(ref, updates);
      }
    }

    return [{ ref, updates }, ...descendantUpdates];
  });
};

const prepareEventDescendantUpdates = async (
  transaction: Transaction,
  path: string,
  eventBrief: EventBrief,
): Promise<DocUpdate<unknown>[]> => {
  let updates: DocUpdate<unknown>[] = [];
  const raceSnap = await transaction.get(
    await getCollectionRef<Race>(getSubCollectionPath(path, 'races')),
  );

  for (const doc of raceSnap.docs) {
    updates.push({ ref: doc.ref, updates: { eventBrief } });
    const newRaceBrief: RaceBrief = {
      id: doc.id,
      path: asDocPath(doc.ref.path),
      name: doc.data().name,
      startDate: doc.data().startDate,
      endDate: doc.data().endDate,
      eventBrief,
    };
    const descendantUpdates = await prepareRaceDescendantUpdates(
      transaction,
      doc.ref.path,
      newRaceBrief,
    );
    updates = updates.concat(descendantUpdates);
  }
  return updates;
};

export const updateRace = async (
  path: string,
  updates: Pick<
    Race,
    'name' | 'location' | 'description' | 'startDate' | 'endDate'
  >,
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  return await db.runTransaction(async (transaction) => {
    const ref = await getDocRef<Race>(path);
    const doc = await transaction.get(ref);
    const existingData = doc.data();
    if (!existingData) {
      throw new NotFoundError("Race doesn't exist");
    }
    const { name, startDate, endDate, eventBrief } = existingData;
    const raceBrief: RaceBrief = {
      id: ref.id,
      path: ref.path,
      name: updates.name ?? name,
      startDate: updates.startDate ?? startDate,
      endDate: updates.endDate ?? endDate,
      eventBrief: eventBrief,
    };
    transaction.update(ref, updates);

    let descendantUpdates: DocUpdate<unknown>[] = [];
    if (updates.name || updates.startDate || updates.endDate) {
      descendantUpdates = await prepareRaceDescendantUpdates(
        transaction,
        path,
        raceBrief,
      );
      for (const { ref, updates } of descendantUpdates) {
        transaction.update(ref, updates);
      }
    }

    return [{ ref, updates }, ...descendantUpdates];
  });
};

const prepareRaceDescendantUpdates = async (
  transaction: Transaction,
  path: string,
  raceBrief: RaceBrief,
): Promise<DocUpdate<unknown>[]> => {
  let updates: DocUpdate<unknown>[] = [];
  const preemSnap = await transaction.get(
    await getCollectionRef<Preem>(getSubCollectionPath(path, 'preems')),
  );

  for (const doc of preemSnap.docs) {
    updates.push({ ref: doc.ref, updates: { raceBrief } });
    const newPreemBrief: PreemBrief = {
      id: doc.id,
      path: asDocPath(doc.ref.path),
      name: doc.data().name,
      raceBrief,
    };
    const descendantUpdates = await preparePreemDescendantUpdates(
      transaction,
      doc.ref.path,
      newPreemBrief,
    );
    updates = updates.concat(descendantUpdates);
  }
  return updates;
};

export const updatePreem = async (
  path: string,
  updates: Pick<Preem, 'name' | 'description'>,
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const db = await getFirestore();
  return await db.runTransaction(async (transaction) => {
    const ref = await getDocRef<Preem>(path);
    const doc = await transaction.get(ref);
    const fullPreem = doc.data();
    if (!fullPreem) {
      throw new NotFoundError("Preem doesn't exist");
    }
    const { name, raceBrief } = fullPreem;
    const preemBrief: PreemBrief = {
      id: ref.id,
      path: ref.path,

      name: updates.name ?? name,
      raceBrief,
    };
    transaction.update(ref, updates);

    // We only need to prepare descendent updates if the preem changed in a way
    // to affect the descendent briefs.
    let descendantUpdates: DocUpdate<unknown>[] = [];
    if (updates.name) {
      descendantUpdates = await preparePreemDescendantUpdates(
        transaction,
        path,
        preemBrief,
      );
      for (const { ref, updates } of descendantUpdates) {
        transaction.update(ref, updates);
      }
    }

    return [{ ref, updates }, ...descendantUpdates];
  });
};

const preparePreemDescendantUpdates = async (
  transaction: Transaction,
  path: string,
  preemBrief: PreemBrief,
): Promise<DocUpdate<unknown>[]> => {
  const updates: DocUpdate<unknown>[] = [];
  const contributionSnap = await transaction.get(
    await getCollectionRef<Contribution>(
      getSubCollectionPath(path, 'contributions'),
    ),
  );
  contributionSnap.docs.forEach((doc) => {
    updates.push({ ref: doc.ref, updates: { preemBrief } });
  });
  return updates;
};
