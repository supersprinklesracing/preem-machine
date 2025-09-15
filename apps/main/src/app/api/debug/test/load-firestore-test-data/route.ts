import { getFirebaseAdminApp } from '@/firebase/server';
import { seedFirestore } from '@/datastore/server/mock-db/seed-firestore';
import { ENV_E2E_TESTING } from '@/env/env';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: true });
}

export async function POST(_request: Request) {
  if (!ENV_E2E_TESTING) {
    return new Response('Not found', { status: 404 });
  }

  try {
    await getFirebaseAdminApp();
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
