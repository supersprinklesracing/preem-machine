import { NextResponse } from 'next/server';

import { verifyBearerToken } from '@/auth/server/bearer';
import { getAuthUser } from '@/auth/server/auth';
import { seedFirestore } from '@/datastore/server/mock-db/seed-firestore';
import { hasUserRole } from '@/user/server/user';

export async function POST(_request: Request) {
  try {
    let isAdmin = false;

    // First, try bearer token authentication
    const decodedToken = await verifyBearerToken();
    if (decodedToken) {
      const roles = decodedToken.roles as unknown;
      if (Array.isArray(roles) && roles.includes('admin')) {
        isAdmin = true;
      }
    } else {
      // If no bearer token, fall back to cookie-based authentication
      const authUser = await getAuthUser();
      if (authUser) {
        isAdmin = await hasUserRole('admin', authUser);
      }
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
    console.error('Error in load-firestore-test-data route:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
