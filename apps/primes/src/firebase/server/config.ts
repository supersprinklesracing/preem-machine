'use server';

import type { ServiceAccount } from 'firebase-admin';

import { getSecrets } from '@/secrets';

let serviceAccount: ServiceAccount | null = null;

export async function getServiceAccount(): Promise<ServiceAccount> {
  if (serviceAccount) {
    return serviceAccount;
  }
  const serviceAccountKey = (await getSecrets()).serviceAccountSecret;

  serviceAccount = {
    projectId: serviceAccountKey.project_id,
    privateKey: serviceAccountKey.private_key,
    clientEmail: serviceAccountKey.client_email,
    toString: () =>
      JSON.stringify({
        projectId: serviceAccountKey.project_id?.length > 0,
        privateKey: serviceAccountKey.private_key?.length > 0,
        clientEmail: serviceAccountKey.client_email?.length > 0,
      }),
  } as ServiceAccount;
  return serviceAccount;
}
