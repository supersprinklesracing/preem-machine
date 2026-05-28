import { CommandModule } from 'yargs';

import { cleanVersionsDotenvCommand } from './clean-versions';
import { downloadDotenvCommand } from './download';
import { formatKeyDotenvCommand } from './format-key';
import { uploadDotenvCommand } from './upload';

export const dotenvCommand: CommandModule = {
  command: 'dotenv',
  describe: 'Manage environment variables and secrets',
  builder: (yargs) =>
    yargs
      .command(downloadDotenvCommand)
      .command(uploadDotenvCommand)
      .command(formatKeyDotenvCommand)
      .command(cleanVersionsDotenvCommand)
      .demandCommand(1, 'You need at least one command before moving on'),
  handler: async () => {
    // Parent command doesn't need a handler if demandCommand is used
  },
};
