import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: 'apps/primes',
});

const esmModules = [
  'node-fetch',
  'data-uri-to-buffer',
  'fetch-blob',
  'formdata-polyfill',
  '@auth/firebase-adapter',
  '@auth/core',
  'next-auth',
  'jose',
  'oauth4webapi',
  'preact',
  'cookie',
].join('|');

const customJestConfig: Config = {
  displayName: '@preem-machine/primes',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/primes',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '\\.node\\.test\\.ts$'],

  reporters: process.env.IS_CI
    ? [
        ['github-actions', { silent: false }],
        ['default', {}],
      ]
    : // Hacky way to disable the summary output which corrupts terminals.
      [['default', { summaryThreshold: 1000 }]],
};

export default async () => {
  const config = await createJestConfig(customJestConfig)();
  config.transformIgnorePatterns = [
    `node_modules/(?!(.pnpm/(.+/node_modules/)?(${esmModules})|(${esmModules})))`,
  ];
  return config;
};
