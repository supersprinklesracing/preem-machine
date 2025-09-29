/*
 * $ gcloud auth application-default login
 * $ node apps/cli/dist/main.js claims set --project preem-machine --uid=eygr7FzGzsb987AVm5uavrYTP7Q2 --claims='{"roles": ["admin"]}'
 * Successfully set claims for user eygr7FzGzsb987AVm5uavrYTP7Q2: { roles: [ "admin" ] }
 */

import admin from 'firebase-admin';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { claimsCommand } from './claims';
import { secretsCommand } from './secrets';

async function main() {
  await yargs(hideBin(process.argv))
    .option('project', {
      alias: 'p',
      type: 'string',
      description: 'The Firebase project ID',
    })
    .middleware((argv) => {
      if (argv.project) {
        process.env.GCLOUD_PROJECT = argv.project;
        admin.initializeApp({ projectId: argv.project });
      } else {
        admin.initializeApp();
      }
    })
    .command(claimsCommand)
    .command(secretsCommand)
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .alias('help', 'h').argv;
}

main().catch((error) => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
});
