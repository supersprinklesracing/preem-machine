import { getEnrichedRaceSeriesForOrganization } from '@/datastore/data-access';
import Organizer from './Organizer';

export default async function OrganizerPage() {
  // TODO: get the real user
  const raceSeries = await getEnrichedRaceSeriesForOrganization('org-1');

  return <Organizer raceSeries={raceSeries} />;
}
