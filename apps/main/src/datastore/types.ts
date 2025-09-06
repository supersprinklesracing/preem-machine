/**
 * Represents the canonical data types stored in Firestore.
 * These types are normalized and use DocumentReferences to link between collections.
 * All fields are optional except for 'id' to allow for partial updates.
 *
 * Brief fields are semi-denormalized versions of another doc; for examle a userBrief would represent a pointer to a user.
 * Typically, if the source document of a Brief is updated, all Briefs related to that doc will need updating.
 */

'use server-only';

import type { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import type Stripe from 'stripe';
import { DocPath } from './paths';

type RecursiveReplace<T, X, Y> = T extends X
  ? Y // If T is the type we're looking for, replace it with Y.
  : T extends (infer A)[]
    ? RecursiveReplace<A, X, Y>[] // If T is an array, recurse on its element type.
    : T extends object
      ? { [P in keyof T]: RecursiveReplace<T[P], X, Y> } // If T is an object, recurse on its properties.
      : T; // Otherwise, leave the type as is.

type ForClient<T> = RecursiveReplace<
  RecursiveReplace<T, Timestamp, string>,
  DocumentReference,
  { id: string; path: string }
>;

type DeepPartial<T> =
  // Don't change "id"
  Pick<
    T,
    Extract<
      keyof T,
      | 'id'
      | 'path'
      | 'organizationBrief'
      | 'seriesBrief'
      | 'eventBrief'
      | 'raceBrief'
      | 'preemBrief'
      | 'userBrief'
    >
  > & {
    // Make all other properties optional, recursively.
    [P in Exclude<
      keyof T,
      | 'id'
      | 'path'
      | 'organizationBrief'
      | 'seriesBrief'
      | 'eventBrief'
      | 'raceBrief'
      | 'preemBrief'
      | 'userBrief'
    >]?: T[P] extends (infer U)[]
      ? DeepPartial<U>[] // Recurse with the same "skip id" logic
      : T[P] extends object
        ? DeepPartial<T[P]> // Recurse with the same "skip id" logic
        : T[P];
  };

export type ClientCompat<T> = DeepPartial<ForClient<T>>;

export interface Metadata {
  created?: Timestamp;
  lastModified?: Timestamp;
  createdBy?: DocumentReference<User>;
  lastModifiedBy?: DocumentReference<User>;
}

export interface BaseDoc {
  id: string;
  path: DocPath;
  metadata?: Metadata;
}

export interface BaseBrief {
  id: string;
  path: DocPath;
}

export interface User extends BaseDoc {
  termsAccepted?: boolean;

  name?: string;
  email?: string;
  avatarUrl?: string;
  affiliation?: string;
  raceLicenseId?: string;
  address?: string;

  organizationRefs?: DocumentReference<Organization>[];
}

export interface UserBrief {
  id: string;
  path: string;

  name?: string;
  avatarUrl?: string;
}

export interface Organization extends BaseDoc {
  id: string;
  path: DocPath;
  metadata?: Metadata;

  name?: string;
  description?: string;
  website?: string;

  memberRefs?: DocumentReference<User>[];
  stripe?: {
    connectAccountId?: string;
    account?: Stripe.Account;
  };
}

export interface OrganizationBrief extends BaseBrief {
  name?: string;
}

export interface Series {
  id: string;
  path: DocPath;
  metadata?: Metadata;

  name?: string;
  description?: string;
  website?: string;
  location?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;

  organizationBrief: OrganizationBrief;
}

export interface SeriesBrief extends BaseBrief {
  name?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;

  organizationBrief: OrganizationBrief;
}

export interface Event extends BaseDoc {
  id: string;
  path: DocPath;
  metadata?: Metadata;

  name?: string;
  description?: string;
  website?: string;
  location?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;

  seriesBrief: SeriesBrief;
}

export interface EventBrief extends BaseBrief {
  name?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;

  seriesBrief: SeriesBrief;
}

export interface Race extends BaseDoc {
  id: string;
  path: DocPath;
  metadata?: Metadata;

  name?: string;
  description?: string;
  website?: string;
  location?: string;
  category?: string;
  gender?: string;
  courseDetails?: string;
  maxRacers?: number;
  currentRacers?: number;
  ageCategory?: string;
  duration?: string;
  laps?: number;
  podiums?: number;
  sponsors?: string[];
  startDate?: Timestamp;
  endDate?: Timestamp;

  eventBrief: EventBrief;
}

export interface RaceBrief extends BaseBrief {
  name?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;

  eventBrief: EventBrief;
}

export interface Preem extends BaseDoc {
  id: string;
  path: DocPath;
  metadata?: Metadata;

  name?: string;
  description?: string;
  type?: 'Pooled' | 'One-Shot';
  status?: 'Open' | 'Minimum Met' | 'Awarded';
  prizePool?: number;
  timeLimit?: Timestamp;
  minimumThreshold?: number;

  raceBrief: RaceBrief;
}

export interface PreemBrief extends BaseBrief {
  name?: string;

  raceBrief: RaceBrief;
}

export interface Contribution extends BaseDoc {
  status?: 'pending' | 'confirmed' | 'failed';

  contributor?: Partial<User>;
  amount?: number;
  date?: Timestamp;
  message?: string;
  isAnonymous?: boolean;
  stripe?: {
    paymentIntent: Stripe.PaymentIntent;
  };

  preemBrief: PreemBrief;
}

export interface ContributionBrief extends BaseBrief {
  amount?: number;
  date?: Timestamp;
  message?: string;

  preemBrief: PreemBrief;
}
