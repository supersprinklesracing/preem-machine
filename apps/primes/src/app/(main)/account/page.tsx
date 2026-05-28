'use server';

import { Metadata } from 'next';

import { CommonLayout } from '@/components/layout/CommonLayout';
import { requireLoggedInUserContext } from '@/user/server/user';

import { Account } from './Account';
import { updateUserAction } from './update-user-action';
import { updateUserAvatarAction } from './update-user-avatar-action';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Account',
  };
}

export default async function AccountPage() {
  const { user } = await requireLoggedInUserContext();
  return (
    <CommonLayout>
      <Account
        user={user}
        updateUserAction={updateUserAction}
        updateUserAvatarAction={updateUserAvatarAction}
      />
    </CommonLayout>
  );
}
