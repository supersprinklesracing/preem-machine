import {
  Preem,
  Contribution,
  Race,
  Event,
  Series,
  Organization,
} from './schema';

export interface PreemWithContributions {
  preem: Preem;
  children: Contribution[];
}
export interface RaceWithPreems {
  race: Race;
  children: PreemWithContributions[];
}
export interface EventWithRaces {
  event: Event;
  children: RaceWithPreems[];
}
export interface SeriesWithEvents {
  series: Series;
  children: EventWithRaces[];
}
export interface OrganizationWithSeries {
  organization: Organization;
  children: SeriesWithEvents[];
}
