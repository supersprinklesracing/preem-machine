import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { parse } from 'dotenv';
import { readFileSync } from 'fs';
import { CommandModule } from 'yargs';

import { logger } from './util';
import { getNodeEnv, getProjectId, upsertSecret } from './util';

/**
 * Parse a dotenv file into key-value pairs using the dotenv library
 */
function parseDotenv(filepath: string) {
  const content = readFileSync(filepath, 'utf-8');
  return parse(content);
}

export const uploadDotenvCommand: CommandModule = {
  command: 'upload',
  describe:
    'Upload environment variables from a dotenv file to Google Secret Manager',
  builder: (yargs) =>
    yargs
      .option('file', {
        type: 'string',
        description: 'Path to the dotenv file',
        demandOption: false,
      })
      .option('dryRun', {
        type: 'boolean',
        description: 'Preview what would be uploaded without actually writing',
        default: false,
      })
      .option('force', {
        type: 'boolean',
        description: 'Update existing secrets with new values',
        default: false,
      })
      .option('exclude', {
        type: 'string',
        description: 'Comma-separated list of keys to exclude from upload',
        default: 'PORT,LOCAL,DOTENV_SECRETS',
      }),
  handler: async (
    argv: {
      file?: string;
      dryRun?: boolean;
      force?: boolean;
      project?: string;
      exclude?: string;
    } & { [key: string]: unknown },
  ) => {
    let { file } = argv;
    const { dryRun, force, exclude } = argv;

    if (!file) {
      const nodeEnv = getNodeEnv() || 'development';
      file = `apps/primes/.env.${nodeEnv}.local`;
      logger.info(`ℹ️  No file specified, using default: ${file}`);
    }

    const projectId = getProjectId();

    try {
      logger.info(`📖 Reading dotenv file: ${file}`);
      const env = parseDotenv(file);

      // Parse exclusion list
      const excludeKeys = exclude
        ? exclude.split(',').map((k: string) => k.trim())
        : [];

      // Filter out excluded keys
      const allKeys = Object.keys(env);
      const keys = allKeys.filter((key) => !excludeKeys.includes(key));

      if (excludeKeys.length > 0 && allKeys.length > keys.length) {
        const excluded = allKeys.filter((key) => excludeKeys.includes(key));
        logger.info(
          `🚫 Excluding ${excluded.length} key(s): ${excluded.join(', ')}\n`,
        );
      }

      if (keys.length === 0) {
        logger.info('No environment variables found in file.');
        return;
      }

      logger.info(`Found ${keys.length} environment variables:\n`);
      for (const key of keys) {
        const preview =
          env[key].length > 50 ? `${env[key].substring(0, 47)}...` : env[key];
        logger.info(`  ${key}=${preview}`);
      }

      if (dryRun) {
        logger.info('\n🔍 Dry run mode - not uploading to Secret Manager');
        return;
      }

      logger.info(
        `\n☁️  Uploading to Google Secret Manager (project: ${projectId})...\n`,
      );

      const client = new SecretManagerServiceClient();
      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const key of keys) {
        if (!env[key] || env[key].trim() === '') {
          logger.info(`⚠️  Skipping ${key}: value is empty`);
          skipped++;
          continue;
        }

        try {
          const result = await upsertSecret(
            client,
            projectId,
            key,
            env[key],
            force || false,
          );

          if (result === 'created') {
            created++;
          } else if (result === 'updated') {
            updated++;
          } else {
            skipped++;
          }
        } catch (error) {
          logger.error(`❌ Error uploading secret '${key}':`, error);
          throw error;
        }
      }

      logger.info(`\n📊 Summary:`);
      logger.info(`  Created: ${created}`);
      logger.info(`  Updated: ${updated}`);
      logger.info(`  Skipped: ${skipped}`);
      logger.info(`  Total: ${keys.length}`);
    } catch (error) {
      logger.error('❌ Error uploading dotenv:', error);
      process.exit(1);
    }
  },
};
