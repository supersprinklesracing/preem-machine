import { NextResponse } from 'next/server';

import { getAuthUser } from '@/auth/server/auth';
import { getBearerUser } from '@/auth/server/bearer';
import { seedFirestore } from '@/datastore/server/mock-db/seed-firestore';
import { ENV_E2E_TESTING } from '@/env/env';
import { hasUserRole } from '@/user/server/user';

export async function POST(_request: Request) {
  try {
    let authUser = await getBearerUser();
    if (!authUser) {
      // If no bearer token, fall back to cookie-based authentication
      authUser = await getAuthUser();
    }
    const isAdmin = authUser && (await hasUserRole('admin', authUser));

    if (!ENV_E2E_TESTING) {
      return NextResponse.json(
        { success: false, error: 'Forbidden outside of E2E tests' },
        { status: 403 },
      );
    }

    if (!isAdmin) {
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
