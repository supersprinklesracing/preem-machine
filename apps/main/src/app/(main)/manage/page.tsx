import { getEnrichedRaceSeriesForOrganization } from '@/datastore/data-access';
import Manage from './Manage';

export default async function ManagePage() {
  // TODO: get the real user
  const raceSeries = await getEnrichedRaceSeriesForOrganization('org-1');

  return <Manage raceSeries={raceSeries} />;
}
