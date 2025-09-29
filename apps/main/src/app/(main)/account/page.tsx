'use server';

import { Metadata } from 'next';

import { CommonLayout } from '@/components/layout/CommonLayout';
import { verifyUserContext } from '@/user/server/user';

import { Account } from './Account';
import { editUserAction } from './edit-user-action';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Account',
  };
}

export default async function AccountPage() {
  const { user } = await verifyUserContext();
  return (
    <CommonLayout>
      <Account user={user} editUserAction={editUserAction} />
    </CommonLayout>
  );
}
