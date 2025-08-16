import { getTimestampFromISODate } from './dates';
import { DocumentReference, Metadata } from './firestore-types';

// Helper to create a mock DocumentReference for clarity in the static object.
const createDocRef = <T>(
  collection: string,
  id: string
): DocumentReference<T> => ({
  id,
  path: `${collection}/${id}`,
});

// Helper to create mock metadata
const createMetadata = (dateString: string): Metadata => {
  const timestamp = getTimestampFromISODate(dateString);
  return {
    created: timestamp,
    lastModified: timestamp,
    createdBy: createDocRef('users', 'eygr7FzGzsb987AVm5uavrYTP7Q2'), // Admin user
    lastModifiedBy: createDocRef('users', 'eygr7FzGzsb987AVm5uavrYTP7Q2'),
  };
};

// This interface is based on: https://github.com/sbatson5/firestore-jest-mock/blob/master/src/mocks/firestore.d.ts
interface MockFirestore {
  [collectionId: string]: {
    [docId: string]: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
      _collections?: MockFirestore;
    };
  };
}

export const MOCK_DB: MockFirestore = {
  users: {
    eygr7FzGzsb987AVm5uavrYTP7Q2: {
      id: 'eygr7FzGzsb987AVm5uavrYTP7Q2',
      name: 'Test User',
      email: 'test-user@example.com',
      avatarUrl: 'https://placehold.co/100x100.png',
      role: 'contributor',
      organizationRefs: [createDocRef('organizations', 'org-1')],
      metadata: createMetadata('2024-07-01T10:00:00Z'),
    },
    'user-1': {
      id: 'user-1',
      name: 'Alex Doe',
      email: 'alex@example.com',
      avatarUrl: 'https://placehold.co/100x100.png',
      role: 'contributor',
      metadata: createMetadata('2024-07-01T10:01:00Z'),
    },
    'user-2': {
      id: 'user-2',
      name: 'Bike Race Inc. Admin',
      email: 'contact@bikerace.com',
      avatarUrl: 'https://placehold.co/100x100.png',
      role: 'organizer',
      organizationRefs: [createDocRef('organizations', 'org-2')],
      metadata: createMetadata('2024-07-01T10:02:00Z'),
    },
    'user-3': {
      id: 'user-3',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatarUrl: 'https://placehold.co/100x100.png',
      role: 'contributor',
      metadata: createMetadata('2024-07-01T10:03:00Z'),
    },
    'user-4': {
      id: 'user-4',
      name: 'Local Bike Shop',
      email: 'shop@example.com',
      avatarUrl: 'https://placehold.co/100x100.png',
      role: 'contributor',
      metadata: createMetadata('2024-07-01T10:04:00Z'),
    },
    eygr7FzGzsb987AVm5uavrYTP7Q2: {
      id: 'eygr7FzGzsb987AVm5uavrYTP7Q2',
      name: 'Admin User',
      email: 'admin@preemmachine.com',
      avatarUrl: 'https://placehold.co/100x100.png',
      role: 'admin',
      metadata: createMetadata('2024-07-01T10:05:00Z'),
    },
  },
  organizations: {
    'org-1': {
      id: 'org-1',
      name: 'Super Sprinkles Racing',
      memberRefs: [createDocRef('users', 'eygr7FzGzsb987AVm5uavrYTP7Q2')],
      metadata: createMetadata('2025-01-15T12:00:00Z'),
      _collections: {
        series: {
          'series-1': {
            id: 'series-1',
            name: 'Il Giro di San Francisco',
            region: 'Northern California',
            website: 'https://girosf.com',
            startDate: getTimestampFromISODate('2025-09-01T00:00:00Z'),
            endDate: getTimestampFromISODate('2025-09-01T00:00:00Z'),
            metadata: createMetadata('2025-01-15T12:01:00Z'),
            _collections: {
              events: {
                'event-1': {
                  id: 'event-1',
                  status: 'Upcoming',
                  name: 'Il Giro di San Francisco',
                  location: "Levi's Plaza, San Francisco",
                  startDate: getTimestampFromISODate('2025-09-01T08:00:00Z'),
                  endDate: getTimestampFromISODate('2025-09-01T08:00:00Z'),
                  metadata: createMetadata('2025-01-15T12:02:00Z'),
                  _collections: {
                    races: {
                      'race-1': {
                        id: 'race-1',
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
                        metadata: createMetadata('2025-01-15T12:03:00Z'),
                        _collections: {
                          preems: {
                            'preem-1a': {
                              id: 'preem-1a',
                              name: 'First Lap Leader',
                              type: 'One-Shot',
                              status: 'Awarded',
                              prizePool: 100,
                              sponsorUserRef: createDocRef('users', 'user-4'),
                              metadata: createMetadata('2025-01-15T12:04:00Z'),
                              _collections: {
                                contributions: {
                                  c1: {
                                    id: 'c1',
                                    contributorRef: createDocRef(
                                      'users',
                                      'user-4'
                                    ),
                                    amount: 100,
                                    date: getTimestampFromISODate(
                                      '2024-07-09T18:05:00Z'
                                    ),
                                    message: 'Good luck racers!',
                                    metadata: createMetadata(
                                      '2024-07-09T18:05:00Z'
                                    ),
                                  },
                                },
                              },
                            },
                            'preem-1b': {
                              id: 'preem-1b',
                              name: 'Mid-Race Sprint',
                              type: 'Pooled',
                              status: 'Minimum Met',
                              prizePool: 255,
                              minimumThreshold: 200,
                              timeLimit: getTimestampFromISODate(
                                '2024-07-09T19:30:00Z'
                              ),
                              sponsorUserRef: null,
                              metadata: createMetadata('2025-01-15T12:05:00Z'),
                              _collections: {
                                contributions: {
                                  c2: {
                                    id: 'c2',
                                    contributorRef: createDocRef(
                                      'users',
                                      'user-1'
                                    ),
                                    amount: 50,
                                    date: getTimestampFromISODate(
                                      '2024-07-09T18:10:00Z'
                                    ),
                                    metadata: createMetadata(
                                      '2024-07-09T18:10:00Z'
                                    ),
                                  },
                                  c3: {
                                    id: 'c3',
                                    contributorRef: createDocRef(
                                      'users',
                                      'user-3'
                                    ),
                                    amount: 75,
                                    date: getTimestampFromISODate(
                                      '2024-07-09T18:12:00Z'
                                    ),
                                    message: 'Lets go!',
                                    metadata: createMetadata(
                                      '2024-07-09T18:12:00Z'
                                    ),
                                  },
                                  c4: {
                                    id: 'c4',
                                    contributorRef: null,
                                    amount: 30,
                                    date: getTimestampFromISODate(
                                      '2024-07-09T18:15:00Z'
                                    ),
                                    metadata: createMetadata(
                                      '2024-07-09T18:15:00Z'
                                    ),
                                  },
                                  c5: {
                                    id: 'c5',
                                    contributorRef: createDocRef(
                                      'users',
                                      'user-1'
                                    ),
                                    amount: 100,
                                    date: getTimestampFromISODate(
                                      '2024-07-09T18:20:00Z'
                                    ),
                                    message: 'Making it spicy!',
                                    metadata: createMetadata(
                                      '2024-07-09T18:20:00Z'
                                    ),
                                  },
                                },
                              },
                            },
                            'preem-1c': {
                              id: 'preem-1c',
                              name: 'Final Lap Leader',
                              type: 'Pooled',
                              status: 'Open',
                              prizePool: 75,
                              minimumThreshold: 150,
                              sponsorUserRef: null,
                              metadata: createMetadata('2025-01-15T12:06:00Z'),
                              _collections: {
                                contributions: {
                                  c6: {
                                    id: 'c6',
                                    contributorRef: createDocRef(
                                      'users',
                                      'user-3'
                                    ),
                                    amount: 75,
                                    date: getTimestampFromISODate(
                                      '2024-07-09T18:25:00Z'
                                    ),
                                    metadata: createMetadata(
                                      '2024-07-09T18:25:00Z'
                                    ),
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      'race-2': {
                        id: 'race-2',
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
                        metadata: createMetadata('2025-01-15T12:07:00Z'),
                        _collections: { preems: {} },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    'org-2': {
      id: 'org-2',
      name: 'Bike Race Inc.',
      memberRefs: [createDocRef('users', 'user-2')],
      metadata: createMetadata('2026-01-01T09:00:00Z'),
      _collections: {
        series: {
          'series-2': {
            id: 'series-2',
            name: 'Chicago Grit',
            region: 'Chicagoland',
            website: 'https://chicago-grit.com/',
            startDate: getTimestampFromISODate('2026-07-17T00:00:00Z'),
            endDate: getTimestampFromISODate('2026-07-26T00:00:00Z'),
            metadata: createMetadata('2026-01-01T09:01:00Z'),
            _collections: {
              events: {
                'event-2': {
                  id: 'event-2',
                  status: 'Upcoming',
                  name: 'West Dundee',
                  location: 'West Dundee, IL',
                  startDate: getTimestampFromISODate('2026-07-17T10:00:00Z'),
                  endDate: getTimestampFromISODate('2026-07-17T10:00:00Z'),
                  metadata: createMetadata('2026-01-01T09:02:00Z'),
                  _collections: {
                    races: {
                      'race-3': {
                        id: 'race-3',
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
                        metadata: createMetadata('2026-01-01T09:03:00Z'),
                        _collections: { preems: {} },
                      },
                      'race-4': {
                        id: 'race-4',
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
                        metadata: createMetadata('2026-01-01T09:04:00Z'),
                        _collections: { preems: {} },
                      },
                    },
                  },
                },
                'event-3': {
                  id: 'event-3',
                  status: 'Upcoming',
                  name: 'Lake Bluff',
                  location: 'Lake Bluff, IL',
                  startDate: getTimestampFromISODate('2026-07-25T10:00:00Z'),
                  endDate: getTimestampFromISODate('2026-07-25T10:00:00Z'),
                  metadata: createMetadata('2026-01-01T09:05:00Z'),
                  _collections: {
                    races: {
                      'race-5': {
                        id: 'race-5',
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
                        metadata: createMetadata('2026-01-01T09:06:00Z'),
                        _collections: { preems: {} },
                      },
                      'race-6': {
                        id: 'race-6',
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
                        metadata: createMetadata('2026-01-01T09:07:00Z'),
                        _collections: { preems: {} },
                      },
                    },
                  },
                },
                'event-4': {
                  id: 'event-4',
                  status: 'Upcoming',
                  name: 'Fulton Market',
                  location: 'Fulton Market, Chicago, IL',
                  startDate: getTimestampFromISODate('2026-07-26T10:00:00Z'),
                  endDate: getTimestampFromISODate('2026-07-26T10:00:00Z'),
                  metadata: createMetadata('2026-01-01T09:08:00Z'),
                  _collections: {
                    races: {
                      'race-7': {
                        id: 'race-7',
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
                        metadata: createMetadata('2026-01-01T09:09:00Z'),
                        _collections: { preems: {} },
                      },
                      'race-8': {
                        id: 'race-8',
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
                        metadata: createMetadata('2026-01-01T09:10:00Z'),
                        _collections: { preems: {} },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
