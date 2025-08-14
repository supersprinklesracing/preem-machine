import { getRaceSeriesForOrganizer } from '@/datastore/data-access';
import OrganizerHub from './OrganizerHub';

export default async function OrganizerHubPage() {
  // TODO: get the real user
  const raceSeries = await getRaceSeriesForOrganizer('user-2');
  return <OrganizerHub raceSeries={raceSeries} />;
}
