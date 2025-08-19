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
  Pick<T, Extract<keyof T, 'id'>> & {
    // Make all other properties optional, recursively.
    [P in Exclude<keyof T, 'id'>]?: T[P] extends (infer U)[]
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

export interface User {
  id: string;
  metadata?: Metadata;

  termsAccepted?: boolean;

  name?: string;
  email?: string;
  avatarUrl?: string;
  role?: 'contributor' | 'organizer' | 'admin';
  affiliation?: string;
  raceLicenseId?: string;
  address?: string;

  organizationRefs?: DocumentReference<Organization>[];
}

export interface UserBrief extends Partial<User> {
  id: string;
  name?: string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  metadata?: Metadata;

  name?: string;
  website?: string;
  memberRefs?: DocumentReference<User>[];
  stripe: {
    connectAccountId?: string;
  };
}

export interface OrganizationBrief extends Partial<Organization> {
  id: string;
  name?: string;
}

export interface Contribution {
  id: string;
  metadata?: Metadata;

  contributor?: Partial<User>;
  amount?: number;
  date?: Timestamp;
  message?: string;

  preemBrief?: PreemBrief;
}

// ?
export interface ContributionBrief extends Partial<Contribution> {
  id: string;
  amount?: number;
  date?: Timestamp;
  message?: string;
}

export interface Preem {
  id: string;
  metadata?: Metadata;

  name?: string;
  type?: 'Pooled' | 'One-Shot';
  status?: 'Open' | 'Minimum Met' | 'Awarded';
  prizePool?: number;
  timeLimit?: Timestamp;
  minimumThreshold?: number;

  raceBrief?: RaceBrief;
}

export interface PreemBrief extends Partial<Preem> {
  id: string;
  name?: string;
}

export interface Race {
  id: string;
  metadata?: Metadata;

  name?: string;
  category?: string;
  gender?: 'Women' | 'Men' | 'Open';
  location?: string;
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

  eventBrief?: EventBrief;
}

export interface RaceBrief extends Partial<Race> {
  id: string;
  name?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
}

export interface Event {
  id: string;
  metadata?: Metadata;

  name?: string;
  website?: string;
  location?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;

  seriesBrief?: SeriesBrief;
}

export interface EventBrief extends Partial<Event> {
  id: string;
  name?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  seriesBrief?: SeriesBrief;
}

export interface Series {
  id: string;
  metadata?: Metadata;

  name?: string;
  location?: string;
  website?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;

  organizationBrief?: OrganizationBrief;
}

export interface SeriesBrief extends Partial<Series> {
  id: string;
  name?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  organizationBrief?: OrganizationBrief;
}
