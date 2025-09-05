// Getting a github token: GITHUB_TOKEN=$(gh auth token)

import { Octokit } from '@octokit/rest';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import {
  ready,
  from_base64,
  to_base64,
  crypto_box_seal,
} from 'libsodium-wrappers';
import yargs from 'yargs';

// --- Type Definition for Sync Options ---
interface SyncOptions {
  githubToken: string;
  githubRepo: string; // Format: "owner/repo"
  projectId: string;
  envFile?: string;
}

/**
 * Encrypts a secret value using the repository's public key for GitHub.
 */
async function encryptSecret(
  publicKey: { key: string; key_id: string },
  secretValue: string,
): Promise<string> {
  await ready;
  const binkey = from_base64(publicKey.key);
  const binsec = Buffer.from(secretValue);
  const encBytes = crypto_box_seal(binsec, binkey);
  return to_base64(encBytes);
}

export async function syncSecrets(options: SyncOptions) {
  const { githubToken, githubRepo, projectId, envFile = '.env' } = options;
  const [owner, repo] = githubRepo.split('/');

  // --- API Clients ---
  const octokit = new Octokit({ auth: githubToken });
  const gcpSecretClient = new SecretManagerServiceClient();

  console.log(
    `Starting secret sync for repo: ${owner}/${repo} and GCP project: ${projectId}`,
  );

  try {
    // 1. Read and parse the local .env file to get the desired state
    if (!fs.existsSync(envFile)) {
      throw new Error(`Environment file not found at '${envFile}'`);
    }
    const envConfig = dotenv.parse(fs.readFileSync(envFile));
    const localSecretKeys = Object.keys(envConfig);
    console.log(`Found ${localSecretKeys.length} secrets in ${envFile}`);

    // --- GitHub Sync ---
    console.log('\n--- Syncing GitHub Secrets ---');
    const { data: publicKey } = await octokit.actions.getRepoPublicKey({
      owner,
      repo,
    });
    const { data: remoteSecrets } = await octokit.actions.listRepoSecrets({
      owner,
      repo,
    });

    // Delete stale GitHub secrets
    const remoteSecretNames = remoteSecrets.secrets.map((s) => s.name);
    for (const remoteKey of remoteSecretNames) {
      if (!localSecretKeys.includes(remoteKey)) {
        console.log(`Deleting stale GitHub secret: ${remoteKey}...`);
        await octokit.actions.deleteRepoSecret({
          owner,
          repo,
          secret_name: remoteKey,
        });
      }
    }

    // --- GCP Sync ---
    console.log('\n--- Syncing GCP Secrets ---');
    const [remoteGcpSecrets] = await gcpSecretClient.listSecrets({
      parent: `projects/${projectId}`,
      filter: 'labels.dotenv=managed',
    });

    // Delete stale GCP secrets
    for (const secret of remoteGcpSecrets) {
      const secretName = secret.name?.split('/').pop();
      if (secretName && !localSecretKeys.includes(secretName)) {
        console.log(`Deleting stale GCP secret: ${secretName}...`);
        await gcpSecretClient.deleteSecret({ name: secret.name });
      }
    }

    // --- Create/Update Secrets on Both Platforms ---
    console.log('\n--- Creating/Updating Secrets ---');
    for (const key of localSecretKeys) {
      const value = envConfig[key];
      if (!key) continue;

      console.log(`Processing secret: ${key}...`);

      // GitHub: Encrypt and upload
      const encryptedValue = await encryptSecret(publicKey, value);
      await octokit.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name: key,
        encrypted_value: encryptedValue,
        key_id: publicKey.key_id,
      });
      console.log(`  -> GitHub secret set.`);

      // GCP: Create or update
      const secretPath = `projects/${projectId}/secrets/${key}`;
      try {
        await gcpSecretClient.getSecret({ name: secretPath });
        // Secret exists, add a new version
        const [latestVersion] = await gcpSecretClient.accessSecretVersion({
          name: `${secretPath}/versions/latest`,
        });
        const latestValue = latestVersion.payload?.data?.toString();
        if (latestValue !== value) {
          await gcpSecretClient.addSecretVersion({
            parent: secretPath,
            payload: { data: Buffer.from(value, 'utf8') },
          });
          console.log(`  -> GCP secret updated with a new version.`);
        } else {
          console.log(`  -> GCP secret is already up-to-date.`);
        }
      } catch (error) {
        // Secret does not exist, create it
        await gcpSecretClient.createSecret({
          parent: `projects/${projectId}`,
          secretId: key,
          secret: { labels: { dotenv: 'managed' } },
        });
        await gcpSecretClient.addSecretVersion({
          parent: secretPath,
          payload: { data: Buffer.from(value, 'utf8') },
        });
        console.log(`  -> GCP secret created.`);
      }
    }

    console.log('\nSecret synchronization complete!');

    // --- YAML Configuration Snippets ---
    console.log('\n--- GitHub Actions YAML (ci.yaml) ---');
    console.log(
      '------------------------------------------------------------------',
    );
    console.log('    env:');
    for (const key of localSecretKeys) {
      console.log(`      ${key}: \${{ secrets.${key} }}`);
    }
    console.log(
      '------------------------------------------------------------------',
    );

    console.log('\n--- Google App Hosting YAML (apphosting.yaml) ---');
    console.log(
      '------------------------------------------------------------------',
    );
    console.log('secrets:');
    for (const key of localSecretKeys) {
      console.log(`  - variable: ${key}`);
      console.log(`    secret: ${key}`);
    }
    console.log(
      '------------------------------------------------------------------',
    );
  } catch (error) {
    console.error('\nAn error occurred during secret synchronization:');
    if (error instanceof Error) {
      console.error(error.message);
      if ('status' in error) {
        console.error(
          `GitHub API responded with status: ${(error as any).status}`,
        );
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

export const secretsCommand = {
  command: 'sync-secrets',
  describe: 'Sync secrets from .env to GCP and Github',
  builder: (yargs: yargs.Argv) => {
    return yargs
      .option('github-token', {
        type: 'string',
        description: 'GitHub token',
        demandOption: true,
      })
      .option('github-repo', {
        type: 'string',
        description: 'GitHub repo in owner/repo format',
        demandOption: true,
      })
      .option('env-file', {
        type: 'string',
        description: 'Path to .env file',
        demandOption: true,
      });
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (argv: any) => {
    await syncSecrets({
      githubToken: argv.githubToken,
      githubRepo: argv.githubRepo,
      projectId: argv.project,
      envFile: argv.envFile,
    });
  },
};
