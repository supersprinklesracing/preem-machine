/* Changes to this file should only happen from explict requests by the user; or explict confirmation. */
'use server-only';

import { ENV_E2E_TESTING_USER } from '@/env/env';
import { Metadata } from './schema';

interface DatabaseDocument {
  id: string;
  path: string;
  [key: string]: unknown;
  _collections?: DatabaseCollections;
}

interface DatabaseCollections {
  [collectionName: string]: Array<DatabaseDocument> | undefined;
}

const createDocRef = (path: string): { id: string; path: string } => {
  const id = path.split('/').pop() ?? '';
  return { id, path };
};

const createIdAndPath = (path: string): { id: string; path: string } => {
  const id = path.split('/').pop() ?? '';
  return { id, path };
};

const createMetadata = (dateString: string): Metadata => {
  return {
    created: new Date(dateString),
    createdBy: createDocRef('users/user-test-admin'),
    lastModified: new Date(dateString),
    lastModifiedBy: createDocRef('users/user-test-admin'),
  };
};

export const mockDbData: DatabaseCollections = {
  users: [
    {
      ...createIdAndPath(`users/test-user-1`),
      name: 'Test User',
      email: 'test-user@example.com',
      avatarUrl: 'https://placehold.co/100x100.png',
      organizationRefs: [createDocRef('organizations/org-super-sprinkles')],
      metadata: createMetadata('2024-07-01T10:00:00Z'),
    },
    {
      ...createIdAndPath('users/user-test-admin'),
      name: 'Test Admin',
      email: 'test-admin@example.com',
      avatarUrl: 'https://placehold.co/100x100.png',
      organizationRefs: [createDocRef('organizations/org-super-sprinkles')],
      metadata: createMetadata('2024-07-01T10:00:00Z'),
    },
    {
      ...createIdAndPath(`users/${ENV_E2E_TESTING_USER}`),
      name: 'Test User',
      email: 'test-user@example.com',
      avatarUrl: 'https://placehold.co/100x100.png',
      organizationRefs: [createDocRef('organizations/org-super-sprinkles')],
      metadata: createMetadata('2024-07-01T10:00:00Z'),
    },
    {
      ...createIdAndPath('users/user-alex-doe'),
      name: 'Alex Doe',
      email: 'alex@example.com',
      avatarUrl: 'https://placehold.co/100x100.png',
      metadata: createMetadata('2024-07-01T10:01:00Z'),
    },
    {
      ...createIdAndPath('users/user-bike-race-inc-admin'),
      name: 'Bike Race Inc. Admin',
      email: 'contact@bikerace.com',
      avatarUrl: 'https://placehold.co/100x100.png',
      organizationRefs: [createDocRef('organizations/org-bike-race-inc')],
      metadata: createMetadata('2024-07-01T10:02:00Z'),
    },
    {
      ...createIdAndPath('users/user-jane-smith'),
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatarUrl: 'https://placehold.co/100x100.png',
      metadata: createMetadata('2024-07-01T10:03:00Z'),
    },
    {
      ...createIdAndPath('users/some-user'),
      name: 'Some User',
      email: 'shop@example.com',
      avatarUrl: 'https://placehold.co/100x100.png',
      metadata: createMetadata('2024-07-01T10:04:00Z'),
    },
  ],
  organizations: [
    {
      ...createIdAndPath('organizations/org-super-sprinkles'),
      name: 'Super Sprinkles Racing',
      memberRefs: [
        createDocRef('users/test-user-1'),

        // test-user@example.com - preem-machine
        createDocRef('users/BFGvWNXZoCWayJa0pNEL4bfhtUC3'),
        // test-user@example.com - preem-machine-ci
        createDocRef('users/73LhDvkigMdwJ4r7NICamtwgd0u1'),
        // test-user@example.com - preem-machine-dev
        createDocRef('users/RwgsPxLnp1bHNcxgw7MdCpm1Cuj1'),
        // jlapenna.test.1@gmail.com
        createDocRef('users/5URlCEB3ACVgem9RAdWudjRURpl2'),
      ],
      metadata: createMetadata('2025-01-15T12:00:00Z'),
      _collections: {
        series: [
          {
            ...createIdAndPath(
              'organizations/org-super-sprinkles/series/series-sprinkles-2025',
            ),
            name: 'Sprinkles 2025',
            location: 'Northern California',
            website: 'https://girosf.com',
            startDate: new Date('2025-09-01T00:00:00Z'),
            endDate: new Date('2025-09-01T00:00:00Z'),
            timezone: 'America/Los_Angeles',
            metadata: createMetadata('2025-01-15T12:01:00Z'),
            _collections: {
              events: [
                {
                  ...createIdAndPath(
                    'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
                  ),
                  name: 'Il Giro di San Francisco',
                  location: "Levi's Plaza, San Francisco",
                  startDate: new Date('2025-09-01T08:00:00Z'),
                  endDate: new Date('2025-09-01T08:00:00Z'),
                  timezone: 'America/Los_Angeles',
                  metadata: createMetadata('2025-01-15T12:02:00Z'),
                  _collections: {
                    races: [
                      {
                        ...createIdAndPath(
                          'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
                        ),
                        name: 'Master Women 40+/50+',
                        category: 'Masters',
                        gender: 'Women',
                        location: "Levi's Plaza, San Francisco",
                        courseDetails: "Circuit race around Levi's Plaza.",
                        courseLink:
                          'https://www.strava.com/routes/3386108424387203158',
                        maxRacers: 50,
                        currentRacers: 0,
                        ageCategory: '40+/50+',
                        duration: '40 minutes',
                        laps: 20,
                        podiums: 3,
                        sponsors: [],
                        startDate: new Date('2025-09-01T08:00:00Z'),
                        endDate: new Date('2025-09-01T08:00:00Z'),
                        timezone: 'America/Los_Angeles',
                        metadata: createMetadata('2025-01-15T12:03:00Z'),
                        _collections: {
                          preems: [
                            {
                              ...createIdAndPath(
                                'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap',
                              ),
                              name: 'First Lap Leader',
                              type: 'Pooled',
                              status: 'Awarded',
                              prizePool: 100,
                              metadata: createMetadata('2025-01-15T12:04:00Z'),
                              _collections: {
                                contributions: [
                                  {
                                    ...createIdAndPath(
                                      'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap/contributions/contrib-1',
                                    ),
                                    contributor: {
                                      ...createIdAndPath('users/some-user'),
                                      name: 'Some User',
                                      avatarUrl:
                                        'https://placehold.co/100x100.png',
                                    },
                                    amount: 100,
                                    date: new Date('2024-07-09T18:05:00Z'),
                                    message: 'Good luck racers!',
                                    metadata: createMetadata(
                                      '2024-07-09T18:05:00Z',
                                    ),
                                  },
                                ],
                              },
                            },
                            {
                              ...createIdAndPath(
                                'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-mid-sprint',
                              ),
                              name: 'Mid-Race Sprint',
                              type: 'Pooled',
                              status: 'Minimum Met',
                              prizePool: 255,
                              minimumThreshold: 200,
                              timeLimit: new Date('2024-07-09T19:30:00Z'),
                              metadata: createMetadata('2025-01-15T12:05:00Z'),
                              _collections: {
                                contributions: [
                                  {
                                    ...createIdAndPath(
                                      'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-mid-sprint/contributions/contrib-2',
                                    ),
                                    contributor: {
                                      ...createIdAndPath('users/user-alex-doe'),
                                      name: 'Alex Doe',
                                      avatarUrl:
                                        'https://placehold.co/100x100.png',
                                    },
                                    amount: 50,
                                    date: new Date('2024-07-09T18:10:00Z'),
                                    metadata: createMetadata(
                                      '2024-07-09T18:10:00Z',
                                    ),
                                  },
                                  {
                                    ...createIdAndPath(
                                      'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-mid-sprint/contributions/contrib-3',
                                    ),
                                    contributor: {
                                      ...createIdAndPath(
                                        'users/user-jane-smith',
                                      ),
                                      name: 'Jane Smith',
                                      avatarUrl:
                                        'https://placehold.co/100x100.png',
                                    },
                                    amount: 75,
                                    date: new Date('2024-07-09T18:12:00Z'),
                                    message: 'Lets go!',
                                    metadata: createMetadata(
                                      '2024-07-09T18:12:00Z',
                                    ),
                                  },
                                  {
                                    ...createIdAndPath(
                                      'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-mid-sprint/contributions/contrib-4',
                                    ),
                                    contributor: {
                                      ...createIdAndPath('users/anonymous'),
                                      name: 'Anonymous',
                                      avatarUrl:
                                        'https://placehold.co/100x100.png',
                                    },
                                    amount: 30,
                                    date: new Date('2024-07-09T18:15:00Z'),
                                    metadata: createMetadata(
                                      '2024-07-09T18:15:00Z',
                                    ),
                                  },
                                  {
                                    ...createIdAndPath(
                                      'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-mid-sprint/contributions/contrib-5',
                                    ),
                                    contributor: {
                                      ...createIdAndPath('users/user-alex-doe'),
                                      name: 'Alex Doe',
                                      avatarUrl:
                                        'https://placehold.co/100x100.png',
                                    },
                                    amount: 100,
                                    date: new Date('2024-07-09T18:20:00Z'),
                                    message: 'Making it spicy!',
                                    metadata: createMetadata(
                                      '2024-07-09T18:20:00Z',
                                    ),
                                  },
                                ],
                              },
                            },
                            {
                              ...createIdAndPath(
                                'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-final-lap',
                              ),
                              name: 'Sponsored by Bicycle Law!',
                              type: 'One-Shot',
                              status: 'Open',
                              prizePool: 75,
                              minimumThreshold: 150,
                              metadata: createMetadata('2025-01-15T12:06:00Z'),
                              _collections: {
                                contributions: [
                                  {
                                    ...createIdAndPath(
                                      'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-final-lap/contributions/contrib-6',
                                    ),
                                    contributor: {
                                      ...createIdAndPath(
                                        'users/user-jane-smith',
                                      ),
                                      name: 'Jane Smith',
                                      avatarUrl:
                                        'https://placehold.co/100x100.png',
                                    },
                                    amount: 75,
                                    date: new Date('2024-07-09T18:25:00Z'),
                                    metadata: createMetadata(
                                      '2024-07-09T18:25:00Z',
                                    ),
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        ...createIdAndPath(
                          'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-juniors',
                        ),
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
                        startDate: new Date('2025-09-01T08:45:00Z'),
                        endDate: new Date('2025-09-01T08:45:00Z'),
                        timezone: 'America/Los_Angeles',
                        metadata: createMetadata('2025-01-15T12:07:00Z'),
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
      ...createIdAndPath('organizations/org-bike-race-inc'),
      name: 'Bike Race Inc.',
      memberRefs: [createDocRef('users/user-bike-race-inc-admin')],
      metadata: createMetadata('2025-02-01T10:00:00Z'),
      _collections: {
        series: [
          {
            ...createIdAndPath(
              'organizations/org-bike-race-inc/series/series-chicago-grit',
            ),
            name: 'Chicago Grit',
            location: 'Chicagoland',
            website: 'https://chicago-grit.com/',
            startDate: new Date('2026-07-17T00:00:00Z'),
            endDate: new Date('2026-07-26T00:00:00Z'),
            timezone: 'America/Chicago',
            metadata: createMetadata('2026-01-01T09:01:00Z'),
            _collections: {
              events: [
                {
                  ...createIdAndPath(
                    'organizations/org-bike-race-inc/series/series-chicago-grit/events/event-west-dundee',
                  ),
                  name: 'West Dundee',
                  location: 'West Dundee, IL',
                  startDate: new Date('2026-07-17T10:00:00Z'),
                  endDate: new Date('2026-07-17T10:00:00Z'),
                  timezone: 'America/Chicago',
                  metadata: createMetadata('2026-01-01T09:02:00Z'),
                  _collections: {
                    races: [
                      {
                        ...createIdAndPath(
                          'organizations/org-bike-race-inc/series/series-chicago-grit/events/event-west-dundee/races/race-west-dundee-pro-men',
                        ),
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
                        startDate: new Date('2026-07-17T10:00:00Z'),
                        endDate: new Date('2026-07-17T10:00:00Z'),
                        timezone: 'America/Chicago',
                        metadata: createMetadata('2026-01-01T09:03:00Z'),
                        _collections: { preems: [] },
                      },
                      {
                        ...createIdAndPath(
                          'organizations/org-bike-race-inc/series/series-chicago-grit/events/event-west-dundee/races/race-west-dundee-pro-women',
                        ),
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
                        startDate: new Date('2026-07-17T11:00:00Z'),
                        endDate: new Date('2026-07-17T11:00:00Z'),
                        timezone: 'America/Chicago',
                        metadata: createMetadata('2026-01-01T09:04:00Z'),
                        _collections: { preems: [] },
                      },
                    ],
                  },
                },
                {
                  ...createIdAndPath(
                    'organizations/org-bike-race-inc/series/series-chicago-grit/events/event-lake-bluff',
                  ),
                  name: 'Lake Bluff',
                  location: 'Lake Bluff, IL',
                  startDate: new Date('2026-07-25T10:00:00Z'),
                  endDate: new Date('2026-07-25T10:00:00Z'),
                  timezone: 'America/Chicago',
                  metadata: createMetadata('2026-01-01T09:05:00Z'),
                  _collections: {
                    races: [
                      {
                        ...createIdAndPath(
                          'organizations/org-bike-race-inc/series/series-chicago-grit/events/event-lake-bluff/races/race-lake-bluff-pro-men',
                        ),
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
                        startDate: new Date('2026-07-25T10:00:00Z'),
                        endDate: new Date('2026-07-25T10:00:00Z'),
                        timezone: 'America/Chicago',
                        metadata: createMetadata('2026-01-01T09:06:00Z'),
                        _collections: { preems: [] },
                      },
                      {
                        ...createIdAndPath(
                          'organizations/org-bike-race-inc/series/series-chicago-grit/events/event-lake-bluff/races/race-lake-bluff-pro-women',
                        ),
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
                        startDate: new Date('2026-07-25T11:00:00Z'),
                        endDate: new Date('2026-07-25T11:00:00Z'),
                        timezone: 'America/Chicago',
                        metadata: createMetadata('2026-01-01T09:07:00Z'),
                        _collections: { preems: [] },
                      },
                    ],
                  },
                },
                {
                  ...createIdAndPath(
                    'organizations/org-bike-race-inc/series/series-chicago-grit/events/event-fulton-market',
                  ),
                  name: 'Fulton Market',
                  location: 'Fulton Market, Chicago, IL',
                  startDate: new Date('2026-07-26T10:00:00Z'),
                  endDate: new Date('2026-07-26T10:00:00Z'),
                  timezone: 'America/Chicago',
                  metadata: createMetadata('2026-01-01T09:08:00Z'),
                  _collections: {
                    races: [
                      {
                        ...createIdAndPath(
                          'organizations/org-bike-race-inc/series/series-chicago-grit/events/event-fulton-market/races/race-fulton-market-pro-men',
                        ),
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
                        startDate: new Date('2026-07-26T16:55:00Z'),
                        endDate: new Date('2026-07-26T16:55:00Z'),
                        timezone: 'America/Chicago',
                        metadata: createMetadata('2026-01-01T09:09:00Z'),
                        _collections: { preems: [] },
                      },
                      {
                        ...createIdAndPath(
                          'organizations/org-bike-race-inc/series/series-chicago-grit/events/event-fulton-market/races/race-fulton-market-pro-women',
                        ),
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
                        startDate: new Date('2026-07-26T15:30:00Z'),
                        endDate: new Date('2026-07-26T15:30:00Z'),
                        timezone: 'America/Chicago',
                        metadata: createMetadata('2026-01-01T09:10:00Z'),
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
};
