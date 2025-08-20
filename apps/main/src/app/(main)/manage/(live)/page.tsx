import { getHubPageData } from '@/datastore/firestore';
import Hub from './Hub';

export default async function LiveOrganizationPage() {
  const data = await getHubPageData();

  return <Hub data={data} />;
}
