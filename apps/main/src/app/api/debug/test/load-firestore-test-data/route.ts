import { getFirestore } from '@/firebase-admin';
import { seedFirestore } from '@/datastore/seed-firestore';
import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRole } from '@/auth/user';
import { AuthError } from '@/auth/errors';

async function clearFirestore() {
  const db = await getFirestore();
  const collections = await db.listCollections();
  for (const collection of collections) {
    const docs = await collection.listDocuments();
    for (const doc of docs) {
      await doc.delete();
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyUserRole(request, 'admin');

    await clearFirestore();
    const db = await getFirestore();
    await seedFirestore(db);

    return NextResponse.json({
      message: 'Firestore cleared and seeded successfully.',
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
