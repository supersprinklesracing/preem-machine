/* eslint-disable @typescript-eslint/no-empty-function */
/*
 * $ gcloud auth application-default login
 * $ node apps/cli/dist/main.js claims set --project preem-machine --uid=eygr7FzGzsb987AVm5uavrYTP7Q2 --claims='{"roles": ["admin"]}'
 * Successfully set claims for user eygr7FzGzsb987AVm5uavrYTP7Q2: { roles: [ "admin" ] }
 */

import admin from 'firebase-admin';
import yargs, { ArgumentsCamelCase, Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';

async function setClaims(uid: string, claims: object) {
  await admin.auth().setCustomUserClaims(uid, claims);
}

async function getClaims(uid: string) {
  const user = await admin.auth().getUser(uid);
  return user.customClaims || {};
}

type UidArgs = {
  uid: string;
};

type ClaimsArgs = {
  claims: string;
};

async function handleGetClaims(argv: ArgumentsCamelCase<UidArgs>) {
  try {
    const claims = await getClaims(argv.uid);
    console.log(`Claims for user ${argv.uid}:`, claims);
  } catch (error) {
    console.error('Error getting custom claims:', error);
    process.exit(1);
  }
}

async function handleSetClaims(argv: ArgumentsCamelCase<UidArgs & ClaimsArgs>) {
  try {
    const claims = JSON.parse(argv.claims);
    await setClaims(argv.uid, claims);
    console.log(`Successfully overwrote claims for user ${argv.uid}:`, claims);
  } catch (error) {
    console.error('Error setting custom claims:', error);
    process.exit(1);
  }
}

async function handleUpdateClaims(
  argv: ArgumentsCamelCase<UidArgs & ClaimsArgs>,
) {
  try {
    const existingClaims = await getClaims(argv.uid);
    const newClaims = JSON.parse(argv.claims);
    const mergedClaims = { ...existingClaims, ...newClaims };
    await setClaims(argv.uid, mergedClaims);
    console.log(
      `Successfully updated claims for user ${argv.uid}:`,
      mergedClaims,
    );
  } catch (error) {
    console.error('Error updating custom claims:', error);
    process.exit(1);
  }
}

async function main() {
  await yargs(hideBin(process.argv))
    .option('project', {
      alias: 'p',
      type: 'string',
      description: 'The Firebase project ID',
    })
    .middleware((argv) => {
      if (argv.project) {
        admin.initializeApp({ projectId: argv.project });
      } else {
        admin.initializeApp();
      }
    })
    .command('claims <subcommand>', 'Manage custom claims', (yargs) => {
      return yargs
        .option('uid', {
          alias: 'u',
          description: "The user's UID",
          type: 'string',
          demandOption: true,
        })
        .option('claims', {
          alias: 'c',
          description: 'The claims object as a JSON string',
          type: 'string',
        })
        .command(
          'get',
          'Get custom claims for a Firebase user',
          () => {},
          handleGetClaims,
        )
        .command(
          'set',
          'Overwrite all custom claims for a Firebase user',
          (yargs: Argv) => yargs.demandOption('claims'),
          handleSetClaims,
        )
        .command(
          'update',
          'Merge new claims with existing custom claims for a Firebase user',
          (yargs: Argv) => yargs.demandOption('claims'),
          handleUpdateClaims,
        );
    })
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .alias('help', 'h').argv;
}

main().catch((error) => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
});
