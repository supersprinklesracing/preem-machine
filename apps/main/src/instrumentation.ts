'use server-only';

export async function register() {
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_RUNTIME === 'nodejs'
  ) {
    console.log('🌱 Seeding development database...');
    try {
      const { seedFirestore } = await import('./datastore/seed-firestore');
      const { getFirestore } = await import('./firebase-admin/firebase-admin');
      await seedFirestore(await getFirestore());
      console.log('OK! Database seeding complete.');
    } catch (error) {
      console.error('Error: Database seeding failed:', error);
    }
  }
}
