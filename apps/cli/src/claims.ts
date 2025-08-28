import admin from 'firebase-admin';
import yargs, { ArgumentsCamelCase, Argv } from 'yargs';

type UidArgs = {
  uid: string;
};

type ClaimsArgs = {
  claims: string;
};

async function setClaims(uid: string, claims: object) {
  await admin.auth().setCustomUserClaims(uid, claims);
}

async function getClaims(uid: string) {
  const user = await admin.auth().getUser(uid);
  return user.customClaims || {};
}

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

export const claimsCommand = {
  command: 'claims <subcommand>',
  describe: 'Manage custom claims',
  builder: (yargs: yargs.Argv) => {
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
        // eslint-disable-next-line @typescript-eslint/no-empty-function
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
  },
  handler: () => {
    // This handler is intentionally empty because subcommands are used.
    // Yargs requires a handler to be present for the command module to be valid.
  },
};
