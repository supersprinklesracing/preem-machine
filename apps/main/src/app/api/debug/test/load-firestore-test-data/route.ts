import { isE2eTesting } from '@preem-machine/env/server';
import { NextResponse } from 'next/server';

import { getBearerUser } from '@/auth/server/auth';
import { seedFirestore } from '@/datastore/server/mock-db/seed-firestore';
import { hasUserRole } from '@/user/server/user';

export async function POST(_request: Request) {
  try {
    const authUser = await getBearerUser();
    const isAdmin = await hasUserRole('admin', authUser);

    if (!(isE2eTesting() || isAdmin)) {
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
