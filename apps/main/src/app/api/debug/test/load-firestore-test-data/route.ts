import { NextResponse } from 'next/server';

import { getBearerUser } from '@/auth/server/auth';
import { seedFirestore } from '@/datastore/server/mock-db/seed-firestore';
import { ENV_E2E_TESTING } from '@/env/env';
import { hasUserRole } from '@/user/server/user';

export async function POST(_request: Request) {
  try {
    const authUser = await getBearerUser();
    const isAdmin = await hasUserRole('admin', authUser);

    if (!(ENV_E2E_TESTING || isAdmin)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    await seedFirestore();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error seeding Firestore:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
