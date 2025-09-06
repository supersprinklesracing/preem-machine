import { Octokit } from '@octokit/rest';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import {
  ready,
  from_base64,
  to_base64,
  crypto_box_seal,
  base64_variants,
} from 'libsodium-wrappers';
import yargs from 'yargs';

// --- Type Definition for Sync Options ---
export interface SyncOptions {
  githubToken: string;
  githubRepo: string; // Format: "owner/repo"
  project: string;
  envFile?: string;
  dryRun?: boolean;
}

/**
 * Encrypts a secret value using the repository's public key for GitHub.
 */
async function encryptSecret(
  publicKey: { key: string; key_id: string },
  secretValue: string,
): Promise<string> {
  await ready;
  const binkey = from_base64(publicKey.key, base64_variants.ORIGINAL);
  const binsec = Buffer.from(secretValue);
  const encBytes = crypto_box_seal(binsec, binkey);
  return to_base64(encBytes, base64_variants.ORIGINAL);
}

export async function syncSecrets(options: SyncOptions) {
  const {
    githubToken,
    githubRepo,
    project,
    envFile = '.env',
    dryRun = false,
  } = options;
  const [owner, repo] = githubRepo.split('/');

  // --- API Clients ---
  const octokit = new Octokit({ auth: githubToken });
  const gcpSecretClient = new SecretManagerServiceClient();

  console.log(
    `Starting secret sync for repo: ${owner}/${repo} and GCP project: ${project}`,
  );

  if (dryRun) {
    console.log('DRY RUN: The following actions would be taken:');
    if (!fs.existsSync(envFile)) {
      throw new Error(`Environment file not found at '${envFile}'`);
    }
    const envConfig = dotenv.parse(fs.readFileSync(envFile));
    const localSecretKeys = Object.keys(envConfig);
    console.log(`Found ${localSecretKeys.length} secrets in ${envFile}`);
    console.log('\n--- Syncing GitHub Secrets ---');
    console.log(
      `[GitHub] Would check for stale secrets in repo ${githubRepo} and delete them.`,
    );
    console.log(
      `[GitHub] Would create/update ${localSecretKeys.length} secrets in repo ${githubRepo}.`,
    );

    console.log('\n--- Syncing GCP Secrets ---');
    console.log(
      `[GCP] Would check for stale secrets in project ${project} and delete them.`,
    );
    console.log(
      `[GCP] Would create/update ${localSecretKeys.length} secrets in project ${project}.`,
    );

    console.log('\n--- YAML Configuration Snippets ---');
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
    return;
  }

  try {
    // 1. Read and parse the local .env file to get the desired state
    if (!fs.existsSync(envFile)) {
      throw new Error(`Environment file not found at '${envFile}'`);
    }
    const envConfig = dotenv.parse(fs.readFileSync(envFile));
    const localSecretKeys = Object.keys(envConfig);
    console.log(`Found ${localSecretKeys.length} secrets in ${envFile}`);

    const { data: publicKey } = await octokit.actions.getRepoPublicKey({
      owner,
      repo,
    });

    // --- GitHub Sync ---
    console.log('\n--- Syncing GitHub Secrets ---');
    const { data: remoteSecrets } = await octokit.actions.listRepoSecrets({
      owner,
      repo,
    });

    // Delete stale GitHub secrets
    const remoteSecretNames = remoteSecrets.secrets.map((s) => s.name);
    for (const remoteKey of remoteSecretNames) {
      if (!localSecretKeys.includes(remoteKey)) {
        console.log(`[GitHub] Deleting stale secret: ${remoteKey}`);
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
      parent: `projects/${project}`,
      filter: 'labels.dotenv=managed',
    });

    // Delete stale GCP secrets
    for (const secret of remoteGcpSecrets) {
      const secretName = secret.name?.split('/').pop();
      if (secretName && !localSecretKeys.includes(secretName)) {
        console.log(`[GCP] Deleting stale secret: ${secretName}`);
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
      console.log(`[GitHub] Creating/updating secret: ${key}`);
      const encryptedValue = await encryptSecret(publicKey, value);
      await octokit.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name: key,
        encrypted_value: encryptedValue,
        key_id: publicKey.key_id,
      });

      // GCP: Create or update
      const secretPath = `projects/${project}/secrets/${key}`;
      try {
        await gcpSecretClient.getSecret({ name: secretPath });
        // Secret exists, add a new version
        const [latestVersion] = await gcpSecretClient.accessSecretVersion({
          name: `${secretPath}/versions/latest`,
        });
        const latestValue = latestVersion.payload?.data?.toString();
        if (latestValue !== value) {
          console.log(`[GCP] Updating secret with a new version: ${key}`);
          await gcpSecretClient.addSecretVersion({
            parent: secretPath,
            payload: { data: Buffer.from(value, 'utf8') },
          });
        } else {
          console.log(`[GCP] Secret is already up-to-date: ${key}`);
        }
      } catch (error) {
        console.log(`[GCP] Creating secret: ${key}`);
        // Secret does not exist, create it
        await gcpSecretClient.createSecret({
          parent: `projects/${project}`,
          secretId: key,
          secret: { labels: { dotenv: 'managed' } },
        });
        await gcpSecretClient.addSecretVersion({
          parent: secretPath,
          payload: { data: Buffer.from(value, 'utf8') },
        });
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

export async function pullFromGcp(project: string, dryRun: boolean) {
  const gcpSecretClient = new SecretManagerServiceClient();

  if (dryRun) {
    console.log(
      `DRY RUN: Would pull secrets from GCP project ${project} with label 'dotenv=managed'.`,
    );
    return;
  }

  const [secrets] = await gcpSecretClient.listSecrets({
    parent: `projects/${project}`,
    filter: 'labels.dotenv=managed',
  });

  for (const secret of secrets) {
    const secretName = secret.name?.split('/').pop();
    if (secretName) {
      const [version] = await gcpSecretClient.accessSecretVersion({
        name: `${secret.name}/versions/latest`,
      });
      const value = version.payload?.data?.toString();
      console.log(`${secretName}=${value}`);
    }
  }
}

export const secretsCommand = {
  command: 'secrets',
  describe: 'Manage secrets',
  builder: (yargs: yargs.Argv) => {
    return yargs
      .command(
        'sync',
        'Sync secrets from .env to GCP and Github',
        (yargs) => {
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
              default: '.env',
            })
            .option('dry-run', {
              type: 'boolean',
              description: 'Do not apply any changes',
              default: false,
            })
            .demandOption('project');
        },
        async (argv: any) => {
          await syncSecrets({
            githubToken: argv.githubToken,
            githubRepo: argv.githubRepo,
            project: argv.project,
            envFile: argv.envFile,
            dryRun: argv.dryRun,
          });
        },
      )
      .command(
        'pull-from-gcp',
        'Pull secrets from GCP and output to stdout',
        (yargs) => {
          return yargs
            .option('dry-run', {
              type: 'boolean',
              description: 'Do not apply any changes',
              default: false,
            })
            .demandOption('project');
        },
        async (argv: any) => {
          await pullFromGcp(argv.project, argv.dryRun);
        },
      )
      .demandCommand(1, 'You must specify a subcommand: sync or pull-from-gcp');
  },
  handler: () => {
    // This handler is intentionally empty because the subcommands will be used instead.
    // yargs requires a handler to be present for the command to be valid.
  },
};
