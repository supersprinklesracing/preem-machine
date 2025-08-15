import Race from './Race';
import { getEventAndRaceById, getUsersByIds } from '@/datastore/data-access';

export default async function RacePage({ params }: { params: { id: string } }) {
  const data = await getEventAndRaceById((await params).id);

  if (!data) {
    return <div>Race not found</div>;
  }
  const { event, race } = data;

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

  return <Race event={event} race={race} users={users} />;
}
