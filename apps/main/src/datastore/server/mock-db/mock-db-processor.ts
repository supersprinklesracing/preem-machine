'use server-only';

import { type DocumentData, Firestore } from 'firebase-admin/firestore';

import type {
  EventBrief,
  OrganizationBrief,
  PreemBrief,
  RaceBrief,
  SeriesBrief,
} from '../../schema';

export interface DatabaseDocument extends DocumentData {
  id: string;
  _collections?: DatabaseCollections;
}

export interface DatabaseCollections {
  [collectionName: string]: Array<DatabaseDocument> | undefined;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (Array.isArray(obj)) {
    const arrCopy = [] as any[];
    for (const item of obj) {
      arrCopy.push(deepClone(item));
    }
    return arrCopy as any;
  }

  const objCopy = {} as { [key: string]: any };
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      objCopy[key] = deepClone((obj as any)[key]);
    }
  }

  return objCopy as T;
}

export const postProcessDatabase = (
  dbData: DatabaseCollections,
  // eslint-disable-next-line unused-imports/no-unused-vars
  firestore: Firestore,
): DatabaseCollections => {
  const db = deepClone(dbData);
  const organizations = db.organizations;
  if (!organizations) {
    return db;
  }
  organizations.forEach((organization) => {
    organization.path = `organizations/${organization.id}`;
    const organizationBrief: OrganizationBrief = {
      id: organization.id,
      path: organization.path,
      name: organization.name,
    };

    const series = organization._collections?.series;
    if (!series) return;

    series.forEach((series) => {
      series.path = `${organization.path}/series/${series.id}`;
      series.organizationBrief = organizationBrief;
      const seriesBrief: SeriesBrief = {
        id: series.id,
        path: series.path,
        name: series.name,
        startDate: series.startDate,
        endDate: series.endDate,
        organizationBrief,
      };

      const events = series._collections?.events;
      if (!events) return;

      events.forEach((event) => {
        event.path = `${series.path}/events/${event.id}`;
        event.seriesBrief = seriesBrief;
        const eventBrief: EventBrief = {
          id: event.id,
          path: event.path,
          name: event.name,
          startDate: event.startDate,
          endDate: event.endDate,
          seriesBrief,
        };

        const races = event._collections?.races;
        if (!races) return;

        races.forEach((race) => {
          race.path = `${event.path}/races/${race.id}`;
          race.eventBrief = eventBrief;
          const raceBrief: RaceBrief = {
            id: race.id,
            path: race.path,
            name: race.name,
            startDate: race.startDate,
            endDate: race.endDate,
            eventBrief,
          };

          const preems = race._collections?.preems;
          if (!preems) return;

          preems.forEach((preem) => {
            preem.path = `${race.path}/preems/${preem.id}`;
            preem.raceBrief = raceBrief;
            const preemBrief: PreemBrief = {
              id: preem.id,
              path: preem.path,
              name: preem.name,
              raceBrief,
            };

            const contributions = preem._collections?.contributions;
            if (!contributions) return;

            contributions.forEach((contribution) => {
              contribution.path = `${preem.path}/contributions/${contribution.id}`;
              contribution.preemBrief = preemBrief;
            });
          });
        });
      });
    });
  });

  return db;
};
