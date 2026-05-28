import * as fs from 'fs';
import * as path from 'path';
import { CommandModule } from 'yargs';

import { logger } from './util';

export const formatKeyDotenvCommand: CommandModule = {
  command: 'format-key <input>',
  describe: 'Format a service account key JSON into a single-line dotenv entry',
  builder: (yargs) =>
    yargs
      .positional('input', {
        type: 'string',
        describe:
          'Path to the service account JSON file or the JSON string itself',
      })
      .option('name', {
        type: 'string',
        alias: 'n',
        describe: 'The name of the environment variable',
        default: 'SERVICE_ACCOUNT_KEY',
      }),
  handler: async (argv) => {
    const { input, name } = argv;
    if (typeof input !== 'string' || typeof name !== 'string') {
      throw new Error('Invalid arguments');
    }

    let jsonContent: string;

    try {
      if (input === '-') {
        // Read from stdin (fd 0)
        jsonContent = fs.readFileSync(0, 'utf8');
        if (!jsonContent.trim()) {
          throw new Error('Stdin was empty. Please pipe JSON to this command.');
        }
      } else if (fs.existsSync(input)) {
        jsonContent = fs.readFileSync(
          path.resolve(process.cwd(), input),
          'utf8',
        );
      } else {
        jsonContent = input;
      }

      // Validate it's proper JSON
      const parsed = JSON.parse(jsonContent);

      // Format as single line JSON
      const formattedValue = JSON.stringify(parsed);

      // Output as KEY='VALUE'
      // Use console.log directly for the output to ensure it can be redirected/piped
      process.stdout.write(`${name}='${formattedValue}'\n`);
    } catch (error) {
      logger.error(`❌ Error processing key: ${(error as Error).message}`);
      process.exit(1);
    }
  },
};
