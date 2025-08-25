import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAppCheck } from 'next-firebase-auth-edge/lib/app-check';
import { getReferer } from 'next-firebase-auth-edge/lib/next/utils';
import { serverConfigFn } from '@/firebase-admin/config';

export async function POST(request: NextRequest) {
  const appCheckToken = request.headers.get('X-Firebase-AppCheck');
  const { verifyToken } = getAppCheck({
    serviceAccount: (await serverConfigFn()).serviceAccount,
  });

  if (!appCheckToken) {
    return new NextResponse(
      JSON.stringify({
        message: 'X-Firebase-AppCheck header is missing',
      }),
      {
        status: 400,
        headers: { 'content-type': 'application/json' },
      },
    );
  }

  try {
    const response = await verifyToken(appCheckToken, {
      referer: getReferer(request.headers) ?? '',
    });

    return new NextResponse(JSON.stringify(response.token), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new NextResponse(
      JSON.stringify({
        message: (e as Error)?.message,
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      },
    );
  }
}
