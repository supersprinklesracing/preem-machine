import BigScreen from './BigScreen';
import { getRaceById, getUsersByIds } from '@/datastore/data-access';

export default async function BigScreenPage({
  params,
}: {
  params: { id: string };
}) {
  const race = await getRaceById((await params).id);

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

  return <BigScreen initialRace={race} users={users} />;
}
