import { getRaceSeriesForOrganizer } from '@/datastore/data-access';
import Organizer from './Organizer';

export default async function OrganizerPage() {
  // TODO: get the real user
  const raceSeries = await getRaceSeriesForOrganizer('user-2');
  return <Organizer raceSeries={raceSeries} />;
}
