'use server';

import { AuthContextUser } from '@/auth/user';
import { getFirestore } from '@/firebase/server/firebase-admin';
import {
  DocumentData,
  FieldValue,
  type DocumentReference,
  type Transaction,
} from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { NotFoundError, unauthorized } from '../../errors';
import { asDocPath, getSubCollectionPath } from '../../paths';
import {
  ContributionSchema,
  EventSchema,
  OrganizationSchema,
  PreemSchema,
  RaceSchema,
  SeriesSchema,
  UserSchema,
  type Event,
  type EventBrief,
  type Organization,
  type OrganizationBrief,
  type Preem,
  type PreemBrief,
  type Race,
  type RaceBrief,
  type Series,
  type SeriesBrief,
  type User,
} from '../../schema';
import { isUserAuthorized } from '../access';
import { getCollectionRefInternal, getDocRefInternal } from '../util';
import { validateEventDateRange, validateRaceDateRange } from '../validation';

interface DocUpdate<T> {
  ref: DocumentReference<T>;
  updates: Partial<T>;
}

const getUpdateMetadata = (userRef: DocumentReference<DocumentData>) => ({
  'metadata.lastModified': new Date(),
  'metadata.lastModifiedBy': userRef,
});

export const updateUser = async (
  path: string,
  user: Pick<User, 'name' | 'affiliation' | 'raceLicenseId' | 'address'>,
  authUser: AuthContextUser,
) => {
  if (!(await isUserAuthorized(authUser, path))) {
    unauthorized();
  }

  const docRef = await getDocRefInternal(UserSchema, path);
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
  const orgRef = await getDocRefInternal(OrganizationSchema, path);
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
  const orgRef = await getDocRefInternal(
    OrganizationSchema,
    `organizations/${organizationId}`,
  );
  await orgRef.update({
    'stripe.connectAccountId': account.id,
    'stripe.account': account,
    'metadata.lastModified': FieldValue.serverTimestamp(),
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
    const ref = await getDocRefInternal(OrganizationSchema, path);
    const doc = await transaction.get(ref);
    const existingData = doc.data();
    if (!existingData) {
      throw new NotFoundError("Organization doesn't exist");
    }
    const { name } = existingData;
    const organizationBrief: OrganizationBrief = {
      id: ref.id,
      path: asDocPath(ref.path),
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
    await getCollectionRefInternal(
      SeriesSchema,
      getSubCollectionPath(path, 'series'),
    ),
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
    const ref = await getDocRefInternal(SeriesSchema, path);
    const doc = await transaction.get(ref);
    const existingData = doc.data();
    if (!existingData) {
      throw new NotFoundError("Series doesn't exist");
    }
    const { name, startDate, endDate, organizationBrief } = existingData;
    const seriesBrief: SeriesBrief = {
      id: ref.id,
      path: asDocPath(ref.path),
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
    await getCollectionRefInternal(
      EventSchema,
      getSubCollectionPath(path, 'events'),
    ),
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
    const ref = await getDocRefInternal(EventSchema, path);
    const doc = await transaction.get(ref);
    const existingData = doc.data();
    if (!existingData) {
      throw new NotFoundError("Event doesn't exist");
    }
    const { name, startDate, endDate, seriesBrief } = existingData;
    await validateEventDateRange(updates, seriesBrief.path);
    const eventBrief: EventBrief = {
      id: ref.id,
      path: asDocPath(ref.path),
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
    await getCollectionRefInternal(
      RaceSchema,
      getSubCollectionPath(path, 'races'),
    ),
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
    const ref = await getDocRefInternal(RaceSchema, path);
    const doc = await transaction.get(ref);
    const existingData = doc.data();
    if (!existingData) {
      throw new NotFoundError("Race doesn't exist");
    }
    const { name, startDate, endDate, eventBrief } = existingData;
    await validateRaceDateRange(updates, eventBrief.path);
    const raceBrief: RaceBrief = {
      id: ref.id,
      path: asDocPath(ref.path),
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
    await getCollectionRefInternal(
      PreemSchema,
      getSubCollectionPath(path, 'preems'),
    ),
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
    const ref = await getDocRefInternal(PreemSchema, path);
    const doc = await transaction.get(ref);
    const fullPreem = doc.data();
    if (!fullPreem) {
      throw new NotFoundError("Preem doesn't exist");
    }
    const { name, raceBrief } = fullPreem;
    const preemBrief: PreemBrief = {
      id: ref.id,
      path: asDocPath(ref.path),

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
    await getCollectionRefInternal(
      ContributionSchema,
      getSubCollectionPath(path, 'contributions'),
    ),
  );
  contributionSnap.docs.forEach((doc) => {
    updates.push({ ref: doc.ref, updates: { preemBrief } });
  });
  return updates;
};
