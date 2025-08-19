import { NextResponse, NextRequest } from 'next/server';
import { stripe } from '@/stripe/server';
import { isUserAuthorized } from '@/datastore/access';
import { getUserFromRequest } from '@/auth/user';

export async function POST(request: NextRequest) {
  try {
    const { accountId, organizationId } = await request.json();

    if (!accountId || !organizationId) {
      return NextResponse.json(
        { error: 'accountId and organizationId are required.' },
        { status: 400 }
      );
    }

    const authUser = await getUserFromRequest(request);
    await isUserAuthorized(authUser, `organizations/${organizationId}`);

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_ORIGIN}/manage/organization/${organizationId}/edit`,
      return_url: `${process.env.NEXT_PUBLIC_ORIGIN}/manage/organization/${organizationId}/edit`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('Stripe account link creation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
