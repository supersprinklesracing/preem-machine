/** Represents the canonical data types stored in data store.
 *
 * Additional types, used specifically to build responses to frontend components should live in data-access.ts
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'contributor' | 'organizer' | 'admin';
  organizationMemberships?: {
    organizationId: string;
    role: 'admin' | 'member';
  }[];
}

export interface Organization {
  id: string;
  name: string;
}

export interface Contribution {
  id: string;
  contributorId: string | null;
  amount: number;
  date: string;
  message?: string;
}

export interface Preem {
  id: string;
  raceId: string;
  name: string;
  type: 'Pooled' | 'One-Shot';
  status: 'Open' | 'Minimum Met' | 'Awarded';
  prizePool: number;
  sponsorInfo: { userId: string } | null;
  timeLimit?: string;
  minimumThreshold?: number;
  contributionHistory: Contribution[];
}

export interface Race {
  id: string;
  eventId: string;
  status: 'Upcoming' | 'Live' | 'Finished';
  name: string;
  category: string;
  gender: 'Women' | 'Men' | 'Open';
  location: string;
  courseDetails: string;
  maxRacers: number;
  currentRacers: number;
  ageCategory: string;
  duration: string;
  laps: number;
  podiums: number;
  sponsors: string[];
  startDate: string;
  preems: Preem[];
}

export interface Event {
  id: string;
  seriesId: string;
  status: 'Upcoming' | 'Live' | 'Finished';
  name: string;
  website?: string;
  location: string;
  startDate: string;
  races: Race[];
}

export interface RaceSeries {
  id: string;
  organizationId: string;
  name: string;
  region: string;
  website?: string;
  startDate: string;
  endDate: string;
  events: Event[];
}

export type View =
  | { type: 'race'; id: string }
  | { type: 'preem'; id: string }
  | { type: 'organizer-hub' }
  | { type: 'organizer-race'; id: string }
  | { type: 'big-screen'; id: string }
  | { type: 'profile'; id: string }
  | { type: 'admin' };
