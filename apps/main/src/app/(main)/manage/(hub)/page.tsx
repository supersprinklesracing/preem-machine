import { getHubPageData } from './hub_data';
import Hub from './Hub';

export default async function LiveOrganizationPage() {
  const data = await getHubPageData();

  return <Hub {...data} />;
}
