'use client';

import { createMockData } from '@/datastore/mock-db';
import { clientConverter } from '@/datastore/zod-converters';
import * as schema from '@/datastore/schema';
const { MockFirebase } = require('firestore-jest-mock');

function postProcessDatabase(db: any): any {
    const organizations = db.organizations;
    if (!organizations) {
      return db;
    }
    organizations.forEach((organization: any) => {
      organization.path = `organizations/${organization.id}`;
      const organizationBrief: schema.OrganizationBrief = {
        id: organization.id,
        path: organization.path,
        name: organization.name,
      };

      const series = organization._collections?.series;
      if (!series) return;

      series.forEach((s: any) => {
        s.path = `${organization.path}/series/${s.id}`;
        s.organizationBrief = organizationBrief;
        const seriesBrief: schema.SeriesBrief = {
          id: s.id,
          path: s.path,
          name: s.name,
          startDate: s.startDate,
          endDate: s.endDate,
          organizationBrief,
        };

        const events = s._collections?.events;
        if (!events) return;

        events.forEach((e: any) => {
          e.path = `${s.path}/events/${e.id}`;
          e.seriesBrief = seriesBrief;
          const eventBrief: schema.EventBrief = {
            id: e.id,
            path: e.path,
            name: e.name,
            startDate: e.startDate,
            endDate: e.endDate,
            seriesBrief,
          };

          const races = e._collections?.races;
          if (!races) return;

          races.forEach((r: any) => {
            r.path = `${e.path}/races/${r.id}`;
            r.eventBrief = eventBrief;
            const raceBrief: schema.RaceBrief = {
                id: r.id,
                path: r.path,
                name: r.name,
                startDate: r.startDate,
                endDate: r.endDate,
                eventBrief,
            };

            const preems = r._collections?.preems;
            if (!preems) return;

            preems.forEach((p: any) => {
                p.path = `${r.path}/preems/${p.id}`;
                p.raceBrief = raceBrief;
            });
          });
        });
      });
    });

    return db;
  };

const rawData = createMockData();
const clientData = postProcessDatabase(rawData);

export const clientMockDb = new MockFirebase(clientData, {
  converters: {
    users: clientConverter(schema.ServerUserSchema, schema.ClientUserSchema),
    organizations: clientConverter(schema.ServerOrganizationSchema, schema.ClientOrganizationSchema),
    series: clientConverter(schema.ServerSeriesSchema, schema.ClientSeriesSchema),
    events: clientConverter(schema.ServerEventSchema, schema.ClientEventSchema),
    races: clientConverter(schema.ServerRaceSchema, schema.ClientRaceSchema),
    preems: clientConverter(schema.ServerPreemSchema, schema.ClientPreemSchema),
    contributions: clientConverter(schema.ServerContributionSchema, schema.ClientContributionSchema),
  },
});
