import { getFirestore } from '@/firebase-admin';
import { seedFirestore } from '@/datastore/seed-firestore';
import { NextRequest, NextResponse } from 'next/server';
import { AuthError, verifyUserRole } from '@/auth/claims';

export async function POST(request: NextRequest) {
  try {
    await verifyUserRole('admin');

    const db = await getFirestore();
    await seedFirestore(db);

    return NextResponse.json({
      message: 'Firestore seeded successfully.',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
