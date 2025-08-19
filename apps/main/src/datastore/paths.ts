/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const organizationPath = (organization: { id: string }) =>
  `organizations/${organization.id}`;

export const seriesPath = (series: {
  id: string;
  organizationBrief?: { id: string };
}) => `${organizationPath(series.organizationBrief!)}/series/${series.id}`;

export const eventPath = (event: {
  id: string;
  seriesBrief?: { id: string; organizationBrief?: { id: string } };
}) => `${seriesPath(event.seriesBrief!)}/events/${event.id}`;

export const racePath = (race: {
  id: string;
  eventBrief?: {
    id: string;
    seriesBrief?: { id: string; organizationBrief?: { id: string } };
  };
}) => `${eventPath(race.eventBrief!)}/races/${race.id}`;

export const preemPath = (preem: {
  id: string;
  raceBrief?: {
    id: string;
    eventBrief?: {
      id: string;
      seriesBrief?: { id: string; organizationBrief?: { id: string } };
    };
  };
}) => `${racePath(preem.raceBrief!)}/preems/${preem.id}`;

export const contributionPath = (contribution: {
  id: string;
  preemBrief?: {
    id: string;
    raceBrief?: {
      id: string;
      eventBrief?: {
        id: string;
        seriesBrief?: { id: string; organizationBrief?: { id: string } };
      };
    };
  };
}) => `${preemPath(contribution.preemBrief!)}/contributions/${contribution.id}`;
