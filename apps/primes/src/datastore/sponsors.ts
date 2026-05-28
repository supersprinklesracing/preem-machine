import { PreemWithContributions } from '@/datastore/query-schema';

export const getSponsorName = ({ preem, children }: PreemWithContributions) => {
  const name = children?.[0]?.contributor?.name;
  if (preem?.type === 'One-Shot') {
    return name || 'A Sponsor';
  }
  return null;
};
