'use server';

import { getFirestore } from '@/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';

/**
 * Processes a contribution by updating Firestore within a transaction.
 * This function is designed to be idempotent and can be safely called
 * from both the optimistic update server action and the Stripe webhook.
 *
 * @param paymentIntent The Stripe PaymentIntent object.
 */
export async function processContribution(paymentIntent: Stripe.PaymentIntent) {
  const { preemPath, userId } = paymentIntent.metadata;

  if (!preemPath || !userId) {
    console.error(
      'PaymentIntent metadata is missing preemPath or userId',
      paymentIntent.id
    );
    return;
  }

  const db = await getFirestore();

  try {
    await db.runTransaction(async (transaction) => {
      const preemRef = db.doc(preemPath);
      const contributionRef = preemRef
        .collection('contributions')
        .doc(paymentIntent.id);

      // Check if we have already processed this contribution
      const existingContribution = await transaction.get(contributionRef);
      if (
        existingContribution.exists &&
        existingContribution.data()?.status === 'confirmed'
      ) {
        console.log(
          `Contribution ${paymentIntent.id} has already been processed.`
        );
        return;
      }

      // Get the preem to update the prize pool
      const preemDoc = await transaction.get(preemRef);
      if (!preemDoc.exists) {
        throw new Error(`Preem not found at path: ${preemPath}`);
      }

      const userRef = db.collection('users').doc(userId);
      const amount = paymentIntent.amount / 100; // Convert from cents

      // Create or update the contribution document
      transaction.set(
        contributionRef,
        {
          id: paymentIntent.id,
          amount,
          status: 'confirmed',
          contributor: userRef, // This assumes the contribution is not anonymous
          stripe: {
            paymentIntent: JSON.parse(JSON.stringify(paymentIntent)),
          },
          metadata: {
            created: FieldValue.serverTimestamp(),
            createdBy: userRef,
            lastModified: FieldValue.serverTimestamp(),
            lastModifiedBy: userRef,
          },
        },
        { merge: true }
      );

      // Atomically increment the prize pool
      transaction.update(preemRef, {
        prizePool: FieldValue.increment(amount),
      });
    });

    console.log(
      `Successfully processed contribution for PaymentIntent ${paymentIntent.id}`
    );
  } catch (error) {
    console.error(
      `Error processing contribution for PaymentIntent ${paymentIntent.id}:`,
      error
    );
  }
}
