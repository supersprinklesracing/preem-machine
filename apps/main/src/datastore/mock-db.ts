'use server-only';

import { getTimestampFromISODate } from '@/firebase-admin/dates';
import type {
  DocumentData,
  DocumentReference,
  Firestore,
} from 'firebase-admin/firestore';
import {
  EventBrief,
  Metadata,
  OrganizationBrief,
  PreemBrief,
  RaceBrief,
  SeriesBrief,
  User,
} from './types';

interface DatabaseDocument extends DocumentData {
  id: string;
  _collections?: DatabaseCollections;
}

interface DatabaseCollections {
  [collectionName: string]: Array<DatabaseDocument> | undefined;
}

const createDocRef = <T>(
  firestore: Firestore,
  collection: string,
  id: string
): DocumentReference<T> => {
  return firestore.doc(`${collection}/${id}`) as DocumentReference<T>;
};

// Helper to create mock metadata
const createMetadata = (firestore: Firestore, dateString: string): Metadata => {
  const timestamp = getTimestampFromISODate(dateString);
  return {
    created: timestamp,
    lastModified: timestamp,
    createdBy: createDocRef<User>(firestore, 'users', 'user-test-admin'),
    lastModifiedBy: createDocRef<User>(firestore, 'users', 'user-test-admin'),
  };
};

const postProcessDatabase = (db: DatabaseCollections): DatabaseCollections => {
  const organizations = db.organizations;
  if (!organizations) return db;
  const users = db.users as User[];
  const usersMap = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, User>);

  organizations.forEach((organization) => {
    const organizationBrief: OrganizationBrief = {
      id: organization.id,
      name: organization.name,
    };

    const series = organization._collections?.series;
    if (!series) return;

    series.forEach((series) => {
      series.organizationBrief = organizationBrief;
      const seriesBrief: SeriesBrief = {
        id: series.id,
        name: series.name,
        startDate: series.startDate,
        endDate: series.endDate,
        organizationBrief,
      };

      const events = series._collections?.events;
      if (!events) return;

      events.forEach((event) => {
        event.seriesBrief = seriesBrief;
        const eventBrief: EventBrief = {
          id: event.id,
          name: event.name,
          startDate: event.startDate,
          endDate: event.endDate,
          seriesBrief,
        };

        const races = event._collections?.races;
        if (!races) return;

        races.forEach((race) => {
          race.eventBrief = eventBrief;
          const raceBrief: RaceBrief = {
            id: race.id,
            name: race.name,
            startDate: race.startDate,
            endDate: race.endDate,
            eventBrief,
          };

          const preems = race._collections?.preems;
          if (!preems) return;

          preems.forEach((preem) => {
            preem.raceBrief = raceBrief;
            const preemBrief: PreemBrief = {
              id: preem.id,
              name: preem.name,
              raceBrief,
            };

            const contributions = preem._collections?.contributions;
            if (!contributions) return;

            contributions.forEach((contribution) => {
              contribution.preemBrief = preemBrief;
              const contributorId = contribution.id;
              if (contributorId) {
                const contributor = usersMap[contributorId];
                if (contributor) {
                  contribution.contributorBrief = {
                    id: contributor.id,
                    name: contributor.name,
                    avatarUrl: contributor.avatarUrl,
                    preemBrief,
                  };
                }
              }
              delete contribution.contributorId;
            });
          });
        });
      });
    });
  });

  return db;
};

export const createMockDb = (firestore: Firestore): DatabaseCollections =>
  postProcessDatabase({
    users: [
      {
        id: 'eygr7FzGzsb987AVm5uavrYTP7Q2',
        name: 'Test User',
        email: 'test-user@example.com',
        avatarUrl: 'https://placehold.co/100x100.png',
        role: 'admin',
        organizationRefs: [
          createDocRef(firestore, 'organizations', 'org-super-sprinkles'),
        ],
        metadata: createMetadata(firestore, '2024-07-01T10:00:00Z'),
      },
      {
        id: 'user-alex-doe',
        name: 'Alex Doe',
        email: 'alex@example.com',
        avatarUrl: 'https://placehold.co/100x100.png',
        role: 'contributor',
        metadata: createMetadata(firestore, '2024-07-01T10:01:00Z'),
      },
      {
        id: 'user-bike-race-inc-admin',
        name: 'Bike Race Inc. Admin',
        email: 'contact@bikerace.com',
        avatarUrl: 'https://placehold.co/100x100.png',
        role: 'organizer',
        organizationRefs: [
          createDocRef(firestore, 'organizations', 'org-bike-race-inc'),
        ],
        metadata: createMetadata(firestore, '2024-07-01T10:02:00Z'),
      },
      {
        id: 'user-jane-smith',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatarUrl: 'https://placehold.co/100x100.png',
        role: 'contributor',
        metadata: createMetadata(firestore, '2024-07-01T10:03:00Z'),
      },
      {
        id: 'some-user',
        name: 'Some User',
        email: 'shop@example.com',
        avatarUrl: 'https://placehold.co/100x100.png',
        role: 'contributor',
        metadata: createMetadata(firestore, '2024-07-01T10:04:00Z'),
      },
    ],
    organizations: [
      {
        id: 'org-super-sprinkles',
        name: 'Super Sprinkles Racing',
        memberRefs: [createDocRef(firestore, 'users', 'user-test-admin')],
        metadata: createMetadata(firestore, '2025-01-15T12:00:00Z'),
        _collections: {
          series: [
            {
              id: 'series-giro-sf',
              name: 'Il Giro di San Francisco',
              region: 'Northern California',
              website: 'https://girosf.com',
              startDate: getTimestampFromISODate('2025-09-01T00:00:00Z'),
              endDate: getTimestampFromISODate('2025-09-01T00:00:00Z'),
              metadata: createMetadata(firestore, '2025-01-15T12:01:00Z'),
              _collections: {
                events: [
                  {
                    id: 'event-giro-sf-2025',
                    status: 'Upcoming',
                    name: 'Il Giro di San Francisco',
                    location: "Levi's Plaza, San Francisco",
                    startDate: getTimestampFromISODate('2025-09-01T08:00:00Z'),
                    endDate: getTimestampFromISODate('2025-09-01T08:00:00Z'),
                    metadata: createMetadata(firestore, '2025-01-15T12:02:00Z'),
                    _collections: {
                      races: [
                        {
                          id: 'race-giro-sf-2025-masters-women',
                          status: 'Upcoming',
                          name: 'Master Women 40+/50+',
                          category: 'Masters',
                          gender: 'Women',
                          location: "Levi's Plaza, San Francisco",
                          courseDetails: "Circuit race around Levi's Plaza.",
                          maxRacers: 50,
                          currentRacers: 0,
                          ageCategory: '40+/50+',
                          duration: '40 minutes',
                          laps: 20,
                          podiums: 3,
                          sponsors: [],
                          startDate: getTimestampFromISODate(
                            '2025-09-01T08:00:00Z'
                          ),
                          endDate: getTimestampFromISODate(
                            '2025-09-01T08:00:00Z'
                          ),
                          metadata: createMetadata(
                            firestore,
                            '2025-01-15T12:03:00Z'
                          ),
                          _collections: {
                            preems: [
                              {
                                id: 'preem-giro-sf-2025-masters-women-first-lap',
                                name: 'First Lap Leader',
                                type: 'One-Shot',
                                status: 'Awarded',
                                prizePool: 100,
                                metadata: createMetadata(
                                  firestore,
                                  '2025-01-15T12:04:00Z'
                                ),
                                _collections: {
                                  contributions: [
                                    {
                                      id: 'contrib-1',
                                      contributorId: 'some-user',
                                      amount: 100,
                                      date: getTimestampFromISODate(
                                        '2024-07-09T18:05:00Z'
                                      ),
                                      message: 'Good luck racers!',
                                      metadata: createMetadata(
                                        firestore,
                                        '2024-07-09T18:05:00Z'
                                      ),
                                    },
                                  ],
                                },
                              },
                              {
                                id: 'preem-giro-sf-2025-masters-women-mid-sprint',
                                name: 'Mid-Race Sprint',
                                type: 'Pooled',
                                status: 'Minimum Met',
                                prizePool: 255,
                                minimumThreshold: 200,
                                timeLimit: getTimestampFromISODate(
                                  '2024-07-09T19:30:00Z'
                                ),
                                metadata: createMetadata(
                                  firestore,
                                  '2025-01-15T12:05:00Z'
                                ),
                                _collections: {
                                  contributions: [
                                    {
                                      id: 'contrib-2',
                                      contributorId: 'user-alex-doe',
                                      amount: 50,
                                      date: getTimestampFromISODate(
                                        '2024-07-09T18:10:00Z'
                                      ),
                                      metadata: createMetadata(
                                        firestore,
                                        '2024-07-09T18:10:00Z'
                                      ),
                                    },
                                    {
                                      id: 'contrib-3',
                                      contributorId: 'user-jane-smith',
                                      amount: 75,
                                      date: getTimestampFromISODate(
                                        '2024-07-09T18:12:00Z'
                                      ),
                                      message: 'Lets go!',
                                      metadata: createMetadata(
                                        firestore,
                                        '2024-07-09T18:12:00Z'
                                      ),
                                    },
                                    {
                                      id: 'contrib-4',
                                      amount: 30,
                                      date: getTimestampFromISODate(
                                        '2024-07-09T18:15:00Z'
                                      ),
                                      metadata: createMetadata(
                                        firestore,
                                        '2024-07-09T18:15:00Z'
                                      ),
                                    },
                                    {
                                      id: 'contrib-5',
                                      contributorId: 'user-alex-doe',
                                      amount: 100,
                                      date: getTimestampFromISODate(
                                        '2024-07-09T18:20:00Z'
                                      ),
                                      message: 'Making it spicy!',
                                      metadata: createMetadata(
                                        firestore,
                                        '2024-07-09T18:20:00Z'
                                      ),
                                    },
                                  ],
                                },
                              },
                              {
                                id: 'preem-giro-sf-2025-masters-women-final-lap',
                                name: 'Final Lap Leader',
                                type: 'Pooled',
                                status: 'Open',
                                prizePool: 75,
                                minimumThreshold: 150,
                                metadata: createMetadata(
                                  firestore,
                                  '2025-01-15T12:06:00Z'
                                ),
                                _collections: {
                                  contributions: [
                                    {
                                      id: 'contrib-6',
                                      contributorId: 'user-jane-smith',
                                      amount: 75,
                                      date: getTimestampFromISODate(
                                        '2024-07-09T18:25:00Z'
                                      ),
                                      metadata: createMetadata(
                                        firestore,
                                        '2024-07-09T18:25:00Z'
                                      ),
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        },
                        {
                          id: 'race-giro-sf-2025-juniors',
                          status: 'Upcoming',
                          name: 'Junior 17-18 Championship',
                          category: 'Juniors',
                          gender: 'Open',
                          location: "Levi's Plaza, San Francisco",
                          courseDetails: "Circuit race around Levi's Plaza.",
                          maxRacers: 50,
                          currentRacers: 0,
                          ageCategory: '17-18',
                          duration: '40 minutes',
                          laps: 20,
                          podiums: 3,
                          sponsors: [],
                          startDate: getTimestampFromISODate(
                            '2025-09-01T08:45:00Z'
                          ),
                          endDate: getTimestampFromISODate(
                            '2025-09-01T08:45:00Z'
                          ),
                          metadata: createMetadata(
                            firestore,
                            '2025-01-15T12:07:00Z'
                          ),
                          _collections: { preems: [] },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        id: 'org-bike-race-inc',
        name: 'Bike Race Inc.',
        memberRefs: [
          createDocRef(firestore, 'users', 'user-bike-race-inc-admin'),
        ],
        metadata: createMetadata(firestore, '2025-02-01T10:00:00Z'),
        _collections: {
          series: [
            {
              id: 'series-chicago-grit',
              name: 'Chicago Grit',
              region: 'Chicagoland',
              website: 'https://chicago-grit.com/',
              startDate: getTimestampFromISODate('2026-07-17T00:00:00Z'),
              endDate: getTimestampFromISODate('2026-07-26T00:00:00Z'),
              metadata: createMetadata(firestore, '2026-01-01T09:01:00Z'),
              _collections: {
                events: [
                  {
                    id: 'event-west-dundee',
                    status: 'Upcoming',
                    name: 'West Dundee',
                    location: 'West Dundee, IL',
                    startDate: getTimestampFromISODate('2026-07-17T10:00:00Z'),
                    endDate: getTimestampFromISODate('2026-07-17T10:00:00Z'),
                    metadata: createMetadata(firestore, '2026-01-01T09:02:00Z'),
                    _collections: {
                      races: [
                        {
                          id: 'race-west-dundee-pro-men',
                          status: 'Upcoming',
                          name: 'Pro/1/2 Men',
                          category: 'Pro/1/2',
                          gender: 'Men',
                          location: 'West Dundee, IL',
                          courseDetails:
                            'Challenging course with the "Leg Breaker Hill".',
                          maxRacers: 100,
                          currentRacers: 0,
                          ageCategory: 'All Ages',
                          duration: '60 minutes',
                          laps: 30,
                          podiums: 3,
                          sponsors: [],
                          startDate: getTimestampFromISODate(
                            '2026-07-17T10:00:00Z'
                          ),
                          endDate: getTimestampFromISODate(
                            '2026-07-17T10:00:00Z'
                          ),
                          metadata: createMetadata(
                            firestore,
                            '2026-01-01T09:03:00Z'
                          ),
                          _collections: { preems: [] },
                        },
                        {
                          id: 'race-west-dundee-pro-women',
                          status: 'Upcoming',
                          name: 'Pro/1/2/3 Women',
                          category: 'Pro/1/2/3',
                          gender: 'Women',
                          location: 'West Dundee, IL',
                          courseDetails:
                            'Challenging course with the "Leg Breaker Hill".',
                          maxRacers: 100,
                          currentRacers: 0,
                          ageCategory: 'All Ages',
                          duration: '60 minutes',
                          laps: 30,
                          podiums: 3,
                          sponsors: [],
                          startDate: getTimestampFromISODate(
                            '2026-07-17T11:00:00Z'
                          ),
                          endDate: getTimestampFromISODate(
                            '2026-07-17T11:00:00Z'
                          ),
                          metadata: createMetadata(
                            firestore,
                            '2026-01-01T09:04:00Z'
                          ),
                          _collections: { preems: [] },
                        },
                      ],
                    },
                  },
                  {
                    id: 'event-lake-bluff',
                    status: 'Upcoming',
                    name: 'Lake Bluff',
                    location: 'Lake Bluff, IL',
                    startDate: getTimestampFromISODate('2026-07-25T10:00:00Z'),
                    endDate: getTimestampFromISODate('2026-07-25T10:00:00Z'),
                    metadata: createMetadata(firestore, '2026-01-01T09:05:00Z'),
                    _collections: {
                      races: [
                        {
                          id: 'race-lake-bluff-pro-men',
                          status: 'Upcoming',
                          name: 'Pro/1/2 Men',
                          category: 'Pro/1/2',
                          gender: 'Men',
                          location: 'Lake Bluff, IL',
                          courseDetails:
                            'A technical course with a challenging chicane.',
                          maxRacers: 100,
                          currentRacers: 0,
                          ageCategory: 'All Ages',
                          duration: '60 minutes',
                          laps: 30,
                          podiums: 3,
                          sponsors: [],
                          startDate: getTimestampFromISODate(
                            '2026-07-25T10:00:00Z'
                          ),
                          endDate: getTimestampFromISODate(
                            '2026-07-25T10:00:00Z'
                          ),
                          metadata: createMetadata(
                            firestore,
                            '2026-01-01T09:06:00Z'
                          ),
                          _collections: { preems: [] },
                        },
                        {
                          id: 'race-lake-bluff-pro-women',
                          status: 'Upcoming',
                          name: 'Pro/1/2/3 Women',
                          category: 'Pro/1/2/3',
                          gender: 'Women',
                          location: 'Lake Bluff, IL',
                          courseDetails:
                            'A technical course with a challenging chicane.',
                          maxRacers: 100,
                          currentRacers: 0,
                          ageCategory: 'All Ages',
                          duration: '60 minutes',
                          laps: 30,
                          podiums: 3,
                          sponsors: [],
                          startDate: getTimestampFromISODate(
                            '2026-07-25T11:00:00Z'
                          ),
                          endDate: getTimestampFromISODate(
                            '2026-07-25T11:00:00Z'
                          ),
                          metadata: createMetadata(
                            firestore,
                            '2026-01-01T09:07:00Z'
                          ),
                          _collections: { preems: [] },
                        },
                      ],
                    },
                  },
                  {
                    id: 'event-fulton-market',
                    status: 'Upcoming',
                    name: 'Fulton Market',
                    location: 'Fulton Market, Chicago, IL',
                    startDate: getTimestampFromISODate('2026-07-26T10:00:00Z'),
                    endDate: getTimestampFromISODate('2026-07-26T10:00:00Z'),
                    metadata: createMetadata(firestore, '2026-01-01T09:08:00Z'),
                    _collections: {
                      races: [
                        {
                          id: 'race-fulton-market-pro-men',
                          status: 'Upcoming',
                          name: 'Pro/1/2 Men',
                          category: 'Pro/1/2',
                          gender: 'Men',
                          location: 'Fulton Market, Chicago, IL',
                          courseDetails:
                            "A new four-corner criterium that goes under the 'L' train tracks.",
                          maxRacers: 100,
                          currentRacers: 0,
                          ageCategory: 'All Ages',
                          duration: '75 minutes',
                          laps: 40,
                          podiums: 3,
                          sponsors: [],
                          startDate: getTimestampFromISODate(
                            '2026-07-26T16:55:00Z'
                          ),
                          endDate: getTimestampFromISODate(
                            '2026-07-26T16:55:00Z'
                          ),
                          metadata: createMetadata(
                            firestore,
                            '2026-01-01T09:09:00Z'
                          ),
                          _collections: { preems: [] },
                        },
                        {
                          id: 'race-fulton-market-pro-women',
                          status: 'Upcoming',
                          name: 'Pro/1/2/3 Women',
                          category: 'Pro/1/2/3',
                          gender: 'Women',
                          location: 'Fulton Market, Chicago, IL',
                          courseDetails:
                            "A new four-corner criterium that goes under the 'L' train tracks.",
                          maxRacers: 100,
                          currentRacers: 0,
                          ageCategory: 'All Ages',
                          duration: '75 minutes',
                          laps: 40,
                          podiums: 3,
                          sponsors: [],
                          startDate: getTimestampFromISODate(
                            '2026-07-26T15:30:00Z'
                          ),
                          endDate: getTimestampFromISODate(
                            '2026-07-26T15:30:00Z'
                          ),
                          metadata: createMetadata(
                            firestore,
                            '2026-01-01T09:10:00Z'
                          ),
                          _collections: { preems: [] },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  });
