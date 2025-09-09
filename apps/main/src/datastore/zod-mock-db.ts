'use server-only';

import { getTimestampFromISODate } from '@/firebase-admin/dates';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  Timestamp,
} from 'firebase-admin/firestore';
import { MockFirebase } from 'firestore-jest-mock';
import * as schema from './schema';
import * as converters from './zod-converters';

const createDocRef = <T>(
    firestore: Firestore,
    collection: string,
    id: string,
  ): DocumentReference<T> => {
    return firestore.doc(`${collection}/${id}`) as DocumentReference<T>;
  };

const createMetadata = (firestore: Firestore, dateString: string) => {
    const timestamp = getTimestampFromISODate(dateString);
    return {
      created: timestamp,
      lastModified: timestamp,
      createdBy: createDocRef<schema.User>(firestore, 'users', 'user-test-admin'),
      lastModifiedBy: createDocRef<schema.User>(firestore, 'users', 'user-test-admin'),
    };
};

const createServerMockData = (firestore: Firestore) => ({
    users: [
        {
          id: 'BFGvWNXZoCWayJa0pNEL4bfhtUC3',
          name: 'Test User',
          email: 'test-user@example.com',
          avatarUrl: 'https://placehold.co/100x100.png',
          organizationRefs: [
            createDocRef(firestore, 'organizations', 'org-super-sprinkles'),
          ],
          metadata: createMetadata(firestore, '2024-07-01T10:00:00Z'),
        },
    ],
    organizations: [
        {
            id: 'org-super-sprinkles',
            name: 'Super Sprinkles Racing',
            memberRefs: [
              createDocRef(firestore, 'users', 'BFGvWNXZoCWayJa0pNEL4bfhtUC3'),
            ],
            metadata: createMetadata(firestore, '2025-01-15T12:00:00Z'),
            _collections: {
              series: [
                {
                  id: 'series-sprinkles-2025',
                  name: 'Sprinkles 2025',
                  location: 'Northern California',
                  website: 'https://girosf.com',
                  startDate: getTimestampFromISODate('2025-09-01T00:00:00Z'),
                  endDate: getTimestampFromISODate('2025-09-01T00:00:00Z'),
                  metadata: createMetadata(firestore, '2025-01-15T12:01:00Z'),
                  _collections: {
                    events: [
                      {
                        id: 'event-giro-sf-2025',
                        name: 'Il Giro di San Francisco',
                        location: "Levi's Plaza, San Francisco",
                        startDate: getTimestampFromISODate('2025-09-01T08:00:00Z'),
                        endDate: getTimestampFromISODate('2025-09-01T08:00:00Z'),
                        metadata: createMetadata(firestore, '2025-01-15T12:02:00Z'),
                      },
                    ],
                  },
                },
              ],
            },
        }
    ]
});

const dummyFirestore = new MockFirebase({}).firestore();
const serverMockData = createServerMockData(dummyFirestore);

export const serverMockDb = new MockFirebase(serverMockData, {
    converters: {
        users: converters.userConverter,
        organizations: converters.organizationConverter,
        series: converters.seriesConverter,
        events: converters.eventConverter,
        races: converters.raceConverter,
        preems: converters.preemConverter,
        contributions: converters.contributionConverter,
    }
});

function serialize(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }
    if (data instanceof Timestamp) {
        return data.toDate().toISOString();
    }
    if (data instanceof DocumentReference) {
        return { id: data.id, path: data.path };
    }
    if (Array.isArray(data)) {
      return data.map(serialize);
    }
    if (typeof data === 'object') {
      const newData: { [key: string]: any } = {};
      for (const key in data) {
        if (key === '_collections') continue;
        newData[key] = serialize(data[key]);
      }
      return newData;
    }
    return data;
}

const clientMockData = serialize(serverMockData);

export const clientMockDb = new MockFirebase(clientMockData, {
    converters: {
        users: converters.clientUserConverter,
        organizations: converters.clientOrganizationConverter,
        series: converters.clientSeriesConverter,
        events: converters.clientEventConverter,
        races: converters.clientRaceConverter,
        preems: converters.clientPreemConverter,
        contributions: converters.clientContributionConverter,
    }
});
