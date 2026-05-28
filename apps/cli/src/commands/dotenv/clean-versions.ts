import {
  protos,
  SecretManagerServiceClient,
} from '@google-cloud/secret-manager';
import { CommandModule } from 'yargs';

import { logger } from './util';
import { getProjectId } from './util';

export const cleanVersionsDotenvCommand: CommandModule = {
  command: 'clean-versions',
  describe:
    'Destroy all but the latest active version of each secret in Google Secret Manager',
  builder: (yargs) =>
    yargs
      .option('dryRun', {
        type: 'boolean',
        description:
          'Preview what would be destroyed without actually deleting anything',
        default: false,
      })
      .option('project', {
        type: 'string',
        description:
          'Specific GCP Project ID to target (overrides default/env value)',
        demandOption: false,
      }),
  handler: async (
    argv: {
      dryRun?: boolean;
      project?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } & any,
  ) => {
    const { dryRun } = argv;
    const projectId = argv.project || getProjectId();

    if (!projectId) {
      logger.error(
        '❌ Could not determine project ID. Please provide --project flag or ensure PROJECT_ID env is set.',
      );
      process.exit(1);
    }

    try {
      if (dryRun) {
        logger.info('\\n🔍 Dry run mode - not destroying any secret versions');
      }

      logger.info(
        `\\n☁️  Cleaning old secret versions for project: ${projectId}...\\n`,
      );

      const client = new SecretManagerServiceClient();
      let totalSecretsProcessed = 0;
      let totalVersionsDestroyed = 0;

      // 1. Iterate through all secrets using auto-pagination
      for await (const secret of client.listSecretsAsync({
        parent: `projects/${projectId}`,
      })) {
        if (!secret.name) continue;

        totalSecretsProcessed++;
        const secretNameStr = secret.name.split('/').pop() || 'unknown';

        // 2. List versions for the secret. The API returns them sorted with the highest (newest) version first.
        const versions: protos.google.cloud.secretmanager.v1.ISecretVersion[] =
          [];
        for await (const version of client.listSecretVersionsAsync({
          parent: secret.name,
        })) {
          versions.push(version);
        }

        if (versions.length === 0) {
          continue;
        }

        let foundLatestActive = false;
        let destroyedCount = 0;

        for (let i = 0; i < versions.length; i++) {
          const version = versions[i];
          const state = version.state;
          const versionNameStr = version.name
            ? version.name.split('/').pop()
            : 'unknown';

          // States correspond to: 'ENABLED', 'DISABLED', 'DESTROYED'
          // We only care about ENABLED or DISABLED versions. DESTROYED is already gone.
          if (state === 'DESTROYED') {
            continue;
          }

          // Keep the newest version (index 0) to ensure we never have zero versions.
          // If index 0 is ENABLED, we've found our latest active.
          // If index 0 is DISABLED, we still keep it but continue looking for the newest ENABLED one.
          const isNewest = i === 0;
          const shouldKeep =
            isNewest || (state === 'ENABLED' && !foundLatestActive);

          if (shouldKeep) {
            if (state === 'ENABLED') foundLatestActive = true;
            logger.info(
              `  Keeping version for ${secretNameStr}: ${versionNameStr} (state: ${state}, newest: ${isNewest})`,
            );
          } else {
            // Destroy older ENABLED or DISABLED versions
            if (dryRun) {
              logger.info(
                `    [DRY RUN] Would destroy version: ${versionNameStr} (state: ${state})`,
              );
              destroyedCount++;
            } else {
              try {
                if (version.name) {
                  await client.destroySecretVersion({ name: version.name });
                  logger.info(
                    `    ✅ Destroyed version: ${versionNameStr} (was ${state})`,
                  );
                  destroyedCount++;
                }
              } catch (err) {
                logger.error(
                  `    ❌ Failed to destroy version ${versionNameStr}:`,
                  err,
                );
              }
            }
          }
        }
        totalVersionsDestroyed += destroyedCount;
      }

      logger.info(`\\n📊 Summary:`);
      logger.info(`  Secrets Processed: ${totalSecretsProcessed}`);
      logger.info(`  Versions Destroyed: ${totalVersionsDestroyed}`);
    } catch (error) {
      logger.error('❌ Error cleaning secret versions:', error);
      process.exit(1);
    }
  },
};
