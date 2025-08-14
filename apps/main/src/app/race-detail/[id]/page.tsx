import RaceDetail from './RaceDetail';
import { getRaceById, getUsersByIds } from '@/datastore/data-access';

export default async function RaceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const race = await getRaceById(params.id);

  if (!race) {
    return <div>Race not found</div>;
  }

  const contributorIds = race.preems.flatMap((p) =>
    p.contributionHistory.map((c) => c.contributorId)
  );
  const sponsorIds = race.preems
    .map((p) => p.sponsorInfo?.userId)
    .filter(Boolean);
  const allUserIds = [...contributorIds, ...sponsorIds].filter(
    (id): id is string => id !== null
  );

  const users = await getUsersByIds(allUserIds);

  return <RaceDetail race={race} users={users} />;
}
