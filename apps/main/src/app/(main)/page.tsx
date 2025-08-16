'use server';

import { getRenderableHomeDataForPage } from '@/datastore/firestore';
import Home from './Home';

export default async function Page() {
  const data = await getRenderableHomeDataForPage();
  return <Home data={data} />;
}
