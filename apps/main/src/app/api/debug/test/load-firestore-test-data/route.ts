import { getFirebaseAdminApp } from '@/firebase-admin';
import { seedFirestore } from '@/datastore/seed-firestore';
import { ENV_E2E_TESTING } from '@/env/env';
import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';

export async function GET() {
  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  if (!ENV_E2E_TESTING) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const app = await getFirebaseAdminApp();
    await seedFirestore(getFirestore(app));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error seeding Firestore:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
