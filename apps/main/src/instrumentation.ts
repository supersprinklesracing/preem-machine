'use server-only';

export async function register() {
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_RUNTIME === 'nodejs'
  ) {
    console.log('🌱 Seeding development database...');
    try {
      const { seedFirestore } = await require('./datastore/mock-db-utils');
      await seedFirestore();
      console.log('OK! Database seeding complete.');
    } catch (error) {
      console.error('Error: Database seeding failed:', error);
    }
  }
}
