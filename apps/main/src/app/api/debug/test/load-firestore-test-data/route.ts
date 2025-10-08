import { NextResponse } from 'next/server';

import { seedFirestore } from '@/datastore/server/mock-db/seed-firestore';

export async function POST(_request: Request) {
  try {
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
