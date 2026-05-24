'use server';

import { signIn } from '@/auth';

export async function loginAction(
  username: string,
  password: string,
): Promise<{ error?: string }> {
  try {
    await signIn('credentials', {
      email: username,
      password,
      redirectTo: '/',
    });
    return {};
  } catch (error: unknown) {
    // signIn throws NEXT_REDIRECT on success — re-throw it
    if (
      error instanceof Error &&
      'digest' in error &&
      typeof (error as { digest: unknown }).digest === 'string' &&
      (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }

    // Handle auth errors
    if (error instanceof Error) {
      const message = error.message;
      if (
        message.includes('Authentication failed') ||
        message.includes('Token verification failed')
      ) {
        return { error: 'Invalid email or password.' };
      }
      return { error: message };
    }

    return { error: 'An unexpected error occurred.' };
  }
}
