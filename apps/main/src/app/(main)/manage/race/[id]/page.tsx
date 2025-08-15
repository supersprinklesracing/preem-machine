import OrganizerRace from './OrganizerRace';
import { getRaceById, getUsersByIds } from '@/datastore/data-access';

export default async function OrganizerRacePage({
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
  const allUserIds = [...contributorIds].filter(
    (id): id is string => id !== null
  );

  const users = await getUsersByIds(allUserIds);

  return <OrganizerRace initialRace={race} users={users} />;
}
