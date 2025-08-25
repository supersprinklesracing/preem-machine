'use client';

import { useToast } from '@/app/shared/use-toast';
import { useAuth } from '@/auth/AuthContext';
import {
  confirmContributionOptimistically,
  createPaymentIntent,
} from '@/stripe/actions';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';

interface ContributionDetails {
  amount: number;
  message: string;
  isAnonymous: boolean;
  preem: {
    id: string;
    path: string;
    name: string;
  };
  onSuccess: () => void;
}

export const useContribution = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { authUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContribute = async ({
    amount,
    message,
    isAnonymous,
    preem,
    onSuccess,
  }: ContributionDetails) => {
    if (!stripe || !elements || !authUser) {
      console.error('Stripe, Elements, or Auth User not available');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Trigger client-side validation and gather details from the Payment Element.
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      // 2. Create the PaymentIntent on the server.
      const { clientSecret } = await createPaymentIntent(
        amount,
        preem.path,
        isAnonymous,
      );
      if (!clientSecret) {
        throw new Error('Failed to create payment intent.');
      }

      // 3. Confirm the payment with the client secret.
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/preem/${preem.id}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message);
      }

      // 4. Fire-and-forget the optimistic database update.
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        confirmContributionOptimistically(paymentIntent.id);

        toast({
          title: 'Contribution Successful!',
          description: `You've contributed $${amount} to "${preem.name}".`,
        });
        onSuccess();
      } else {
        throw new Error('Payment did not succeed.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Contribution failed',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return { handleContribute, isProcessing };
};
