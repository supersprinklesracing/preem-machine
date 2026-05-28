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

  db.series = db.series || [];
  db.events = db.events || [];
  db.races = db.races || [];
  db.preems = db.preems || [];
  db.contributions = db.contributions || [];

  organizations.forEach((organization) => {
    organization.path = `organizations/${organization.id}`;
    const organizationBrief: OrganizationBrief = {
      id: organization.id,
      path: organization.path,
      name: organization.name,
    };

    const seriesList = organization._collections?.series;
    delete organization._collections;
    if (!seriesList) return;

    seriesList.forEach((series) => {
      series.path = `series/${series.id}`;
      series.organizationId = organization.id;
      series.organizationBrief = organizationBrief;
      const seriesBrief: SeriesBrief = {
        id: series.id,
        path: series.path,
        name: series.name,
        startDate: series.startDate,
        endDate: series.endDate,
        organizationBrief,
      };
      db.series!.push(series);

      const events = series._collections?.events;
      delete series._collections;
      if (!events) return;

      events.forEach((event) => {
        event.path = `events/${event.id}`;
        event.seriesId = series.id;
        event.organizationId = organization.id;
        event.seriesBrief = seriesBrief;
        const eventBrief: EventBrief = {
          id: event.id,
          path: event.path,
          name: event.name,
          startDate: event.startDate,
          endDate: event.endDate,
          seriesBrief,
        };
        db.events!.push(event);

        const races = event._collections?.races;
        delete event._collections;
        if (!races) return;

        races.forEach((race) => {
          race.path = `races/${race.id}`;
          race.eventId = event.id;
          race.organizationId = organization.id;
          race.eventBrief = eventBrief;
          const raceBrief: RaceBrief = {
            id: race.id,
            path: race.path,
            name: race.name,
            startDate: race.startDate,
            endDate: race.endDate,
            eventBrief,
          };
          db.races!.push(race);

          const preems = race._collections?.preems;
          delete race._collections;
          if (!preems) return;

          preems.forEach((preem) => {
            preem.path = `preems/${preem.id}`;
            preem.raceId = race.id;
            preem.organizationId = organization.id;
            preem.raceBrief = raceBrief;
            const preemBrief: PreemBrief = {
              id: preem.id,
              path: preem.path,
              name: preem.name,
              raceBrief,
            };
            preem.timeLimit =
              preem.timeLimit || new Date('2026-09-01T08:00:00Z');
            db.preems!.push(preem);

            const contributions = preem._collections?.contributions;
            delete preem._collections;
            if (!contributions) return;

            contributions.forEach((contribution) => {
              contribution.path = `contributions/${contribution.id}`;
              contribution.preemId = preem.id;
              contribution.organizationId = organization.id;
              contribution.preemBrief = preemBrief;
              db.contributions!.push(contribution);
            });
          });
        });
      });
    });
  });

  return db;
};
