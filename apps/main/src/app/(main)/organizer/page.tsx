import {
  getOrganizationsForUser,
  getRaceSeriesForOrganization,
} from '@/datastore/data-access';
import Organizer from './Organizer';

export default async function OrganizerPage() {
  // TODO: get the real user
  const organizations = await getOrganizationsForUser('user-2');
  const seriesPromises = organizations.map((org) =>
    getRaceSeriesForOrganization(org.id)
  );
  const raceSeries = (await Promise.all(seriesPromises)).flat();

  return <Organizer raceSeries={raceSeries} />;
}
