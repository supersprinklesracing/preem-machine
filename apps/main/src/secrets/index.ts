'use server';

import {
  ENV_DOTENV_SECRETS,
  ENV_IS_BUILD,
  ENV_IS_NEXT_RUNTIME_NODEJS,
  ENV_IS_TEST_ENV,
} from '@/env/env';
import * as env from '@/secrets/secrets-env';

function shouldUseEnvSecrets() {
  return ENV_IS_TEST_ENV || ENV_DOTENV_SECRETS || ENV_IS_BUILD;
}

export const getSecrets = async () => {
  if (shouldUseEnvSecrets() || !ENV_IS_NEXT_RUNTIME_NODEJS) {
    return {
      serviceAccountSecret: await env.getServiceAccountSecret(),
      cookieSecrets: await env.getCookieSecrets(),
      stripeSecrets: await env.getStripeSecrets(),
    };
  } else {
    // const gcp = await import('./secrets-gcp');
    // return {
    //   serviceAccountSecret: await gcp.getServiceAccountSecret(),
    //   cookieSecrets: await gcp.getCookieSecrets(),
    //   stripeSecrets: await gcp.getStripeSecrets(),
    // };
    return {
      serviceAccountSecret: await env.getServiceAccountSecret(),
      cookieSecrets: await env.getCookieSecrets(),
      stripeSecrets: await env.getStripeSecrets(),
    };
  }
};
