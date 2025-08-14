import PreemDetail from './PreemDetail';
import { getPreemAndRaceById, getUsersByIds } from '@/datastore/data-access';

export default async function PreemDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getPreemAndRaceById(params.id);

  if (!result) {
    return <div>Preem not found</div>;
  }

  const contributorIds = result.preem.contributionHistory.map(
    (c) => c.contributorId
  );
  const sponsorId = result.preem.sponsorInfo?.userId;
  const allUserIds = [...contributorIds, sponsorId].filter(
    (id): id is string => id !== null && id !== undefined
  );

  const users = await getUsersByIds(allUserIds);

  return <PreemDetail preem={result.preem} race={result.race} users={users} />;
}
