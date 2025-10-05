import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('yargs', () => {
  const mYargs = {
    option: jest.fn().mockReturnThis(),
    middleware: jest.fn().mockReturnThis(),
    command: jest.fn().mockReturnThis(),
    demandCommand: jest.fn().mockReturnThis(),
    help: jest.fn().mockReturnThis(),
    alias: jest.fn().mockReturnThis(),
    argv: jest.fn().mockReturnThis(),
  };
  return jest.fn(() => mYargs);
});

jest.mock('yargs/helpers', () => ({
  hideBin: jest.fn(),
}));

jest.mock('./claims', () => ({
  claimsCommand: {},
}));

jest.mock('./secrets', () => ({
  secretsCommand: {},
}));

describe('main', () => {
  it('should run without throwing an error', async () => {
    const processArgv = process.argv;
    process.argv = ['node', 'apps/cli/dist/main.js'];
    await import('./main');
    expect(yargs).toHaveBeenCalledWith(hideBin(process.argv));
    process.argv = processArgv;
  });
});
