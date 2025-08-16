'use server-only';

import type { DocumentReference, Timestamp } from 'firebase-admin/firestore';

/**
 * Represents the canonical data types stored in Firestore.
 * These types are normalized and use DocumentReferences to link between collections.
 * All fields are optional except for 'id' to allow for partial updates.
 */

export interface Metadata {
  created?: Timestamp;
  lastModified?: Timestamp;
  createdBy?: DocumentReference<User>;
  lastModifiedBy?: DocumentReference<User>;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role?: 'contributor' | 'organizer' | 'admin';
  organizationRefs?: DocumentReference<Organization>[];
  metadata?: Metadata;
}

export interface Organization {
  id: string;
  name?: string;
  memberRefs?: DocumentReference<User>[];
  stripeConnectAccountId?: string;
  metadata?: Metadata;
}

export interface Contribution {
  id: string;
  contributorRef?: DocumentReference<User> | null;
  amount?: number;
  date?: Timestamp;
  message?: string;
  metadata?: Metadata;
}

export interface Preem {
  id: string;
  name?: string;
  type?: 'Pooled' | 'One-Shot';
  status?: 'Open' | 'Minimum Met' | 'Awarded';
  prizePool?: number;
  sponsorUserRef?: DocumentReference<User> | null;
  timeLimit?: Timestamp;
  minimumThreshold?: number;
  metadata?: Metadata;
}

export interface Race {
  id: string;
  status?: 'Upcoming' | 'Live' | 'Finished';
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
  metadata?: Metadata;
}

export interface Event {
  id: string;
  status?: 'Upcoming' | 'Live' | 'Finished';
  name?: string;
  website?: string;
  location?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  metadata?: Metadata;
}

export interface RaceSeries {
  id: string;
  name?: string;
  region?: string;
  website?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  metadata?: Metadata;
}

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
