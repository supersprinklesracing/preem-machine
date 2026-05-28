import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export const logger = {
  info: (...args: any[]) => console.log(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
};

export function getProjectId(): string {
  return process.env.GCLOUD_PROJECT || 'preem-machine-dev';
}

export function getNodeEnv(): string {
  return process.env.NODE_ENV || 'development';
}

/**
 * Upsert a secret to Google Cloud Secret Manager
 */
export async function upsertSecret(
  client: SecretManagerServiceClient,
  projectId: string,
  secretId: string,
  secretValue: string,
  force = false,
): Promise<'created' | 'updated' | 'skipped'> {
  const parent = `projects/${projectId}`;
  const secretPath = `${parent}/secrets/${secretId}`;

  try {
    // Check if secret exists
    await client.getSecret({ name: secretPath });

    // Secret exists, check if we should update it
    if (!force) {
      logger.info(
        `ℹ️  Secret ${secretId} already exists (use --force to update)`,
      );
      return 'skipped';
    }

    // Update with new version
    logger.info(`🔄 Adding new version to ${secretId}...`);
    await client.addSecretVersion({
      parent: secretPath,
      payload: {
        data: Buffer.from(secretValue, 'utf8'),
      },
    });
    return 'updated';
  } catch (error: any) {
    if (error.code === 5) {
      // NOT_FOUND - Create new secret
      logger.info(`✨ Creating new secret ${secretId}...`);
      await client.createSecret({
        parent,
        secretId,
        secret: {
          replication: {
            automatic: {},
          },
          labels: {
            dotenv: 'managed',
          },
        },
      });

      await client.addSecretVersion({
        parent: secretPath,
        payload: {
          data: Buffer.from(secretValue, 'utf8'),
        },
      });
      return 'created';
    }
    throw error;
  }
}
