'use server';

import { Metadata } from 'next';

import { CommonLayout } from '@/components/layout/CommonLayout';

import { newOrganizationAction } from './new-organization-action';
import { NewOrganization } from './NewOrganization';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'New Organization',
  };
}

export default async function NewOrganizationPage({
  // eslint-disable-next-line unused-imports/no-unused-vars
  searchParams,
}: {
  searchParams: Promise<{ path: string }>;
}) {
  return (
    <CommonLayout>
      <NewOrganization newOrganizationAction={newOrganizationAction} />
    </CommonLayout>
  );
}
