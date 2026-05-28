import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { CommandModule } from 'yargs';

import { logger } from './util';
import { getNodeEnv, getProjectId } from './util';

/**
 * Access a secret version in Google Cloud Secret Manager
 */
async function accessSecretVersion(
  client: SecretManagerServiceClient,
  projectId: string,
  secretId: string,
): Promise<string | null> {
  const name = `projects/${projectId}/secrets/${secretId}/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({
      name,
    });

    const payload = version.payload?.data?.toString();
    return payload || null;
  } catch (error) {
    logger.warn(
      `⚠️  Could not access secret ${secretId}: ${(error as Error).message}`,
    );
    return null;
  }
}

export const downloadDotenvCommand: CommandModule = {
  command: 'download',
  describe: 'Download secrets from Google Secret Manager to a local .env file',
  builder: (yargs) =>
    yargs
      .option('file', {
        type: 'string',
        description: 'Target .env file',
        demandOption: false,
      })
      .option('format', {
        type: 'string',
        choices: ['dotenv', 'yml'],
        default: 'dotenv',
        description: 'Output format',
      })
      .option('force', {
        type: 'boolean',
        description: 'Overwrite existing file',
        default: false,
      }),
  handler: async (
    argv: { force?: boolean; file?: string; format?: string } & {
      [key: string]: unknown;
    },
  ) => {
    let { file } = argv;
    const { force, format } = argv;
    const projectId = getProjectId();

    // Determine target file based on NODE_ENV if not provided
    if (!file) {
      const nodeEnv = getNodeEnv() || 'development';
      if (format === 'yml') {
        file = `dist/apps/agent/env.${nodeEnv}.yml`;
      } else {
        file = `.env.${nodeEnv}.local`;
      }
      logger.info(`ℹ️  No file specified, using default: ${file}`);
    }

    const targetFile = file;
    const targetPath = path.resolve(process.cwd(), targetFile);

    logger.info(`🔍 Target file: ${targetFile}`);
    logger.info(`🔍 Project ID: ${projectId}`);

    if (fs.existsSync(targetPath) && !force) {
      logger.error(
        `❌ File ${targetFile} already exists. Use --force to overwrite.`,
      );
      process.exit(1);
    }

    const secretsToFetch = new Set<string>();
    const plainJsonValues: Record<string, string> = {};

    const client = new SecretManagerServiceClient();

    logger.info('📂 Fetching all secrets from project...');
    try {
      const [secrets] = await client.listSecrets({
        parent: `projects/${projectId}`,
      });
      for (const secret of secrets) {
        if (secret.name) {
          const secretId = secret.name.split('/').pop();
          if (secretId) {
            secretsToFetch.add(secretId);
          }
        }
      }
    } catch (error) {
      logger.error('❌ Error listing secrets:', error);
      process.exit(1);
    }

    if (
      secretsToFetch.size === 0 &&
      Object.keys(plainJsonValues).length === 0
    ) {
      logger.info('No secrets or env values found.');
      return;
    }

    logger.info(
      `Found ${secretsToFetch.size} unique secrets and ${
        Object.keys(plainJsonValues).length
      } plain values to fetch.`,
    );

    // 2. Fetch secrets
    const fetchedSecrets: Record<string, string> = { ...plainJsonValues };
    let successCount = 0;
    let failCount = 0;

    for (const secretId of secretsToFetch) {
      const value = await accessSecretVersion(client, projectId, secretId);
      if (value !== null) {
        fetchedSecrets[secretId] = value;
        successCount++;
      } else {
        failCount++;
      }
    }

    // 3. Write to file
    if (successCount > 0 || Object.keys(plainJsonValues).length > 0) {
      // Ensure directory exists
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`📂 Created directory: ${dir}`);
      }

      let fileContent: string;
      const isYaml =
        format === 'yml' ||
        targetFile.endsWith('.yml') ||
        targetFile.endsWith('.yaml');

      if (isYaml) {
        fileContent = yaml.dump(fetchedSecrets, { sortKeys: true });
      } else {
        // Sort keys for deterministic output
        const sortedSecrets = Object.entries(fetchedSecrets)
          .sort(([a], [b]) => a.localeCompare(b))
          .filter(([key]) => !key.startsWith('apphosting-'));

        const header = `# AUTO-GENERATED FILE - DO NOT EDIT MANUALLY\n# Project: ${projectId}\n# Generated at: ${new Date().toISOString()}\n\n`;
        fileContent =
          header +
          sortedSecrets
            .map(([key, value]) => {
              // To prevent the backslash compounding bug, we only replace actual newlines
              // with \\n and wrap the whole thing in double quotes.
              // dotenv ONLY unescapes \\n to \n. It DOES NOT unescape \\" to " or \\\\ to \\.
              if (
                value.includes('\n') ||
                value.includes('"') ||
                value.includes("'") ||
                value.includes(' ')
              ) {
                return `${key}="${value.replace(/\n/g, '\\n')}"`;
              }
              return `${key}=${value}`;
            })
            .join('\n') +
          '\n';
      }

      fs.writeFileSync(targetPath, fileContent);
      logger.info(
        `\n✅ Successfully wrote ${successCount} secrets to ${targetFile}`,
      );
      if (failCount > 0) {
        logger.warn(`⚠️  Failed to fetch ${failCount} secrets.`);
      }
    } else {
      logger.warn('\n⚠️  No secrets were successfully fetched.');
    }
  },
};
