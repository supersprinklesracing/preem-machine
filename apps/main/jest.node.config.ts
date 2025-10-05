import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: 'apps/main',
});

const customJestConfig: Config = {
  displayName: '@preem-machine/main-node',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/main-node',
  testEnvironment: 'node',
  testMatch: ['**/next.config.node.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/'],

  reporters: process.env.IS_CI
    ? [
        ['github-actions', { silent: false }],
        ['default', {}],
      ]
    : // Hacky way to disable the summary output which corrupts terminals.
      [['default', { summaryThreshold: 1000 }]],
};

// Export an async function to modify the final config
export default async () => {
  // Get the base config from next/jest
  const config = await createJestConfig(customJestConfig)();

  // Array of ESM modules that need to be transformed
  const esmModules = ['node-fetch'].join('|');

  // Modify the transformIgnorePatterns to include your modules
  config.transformIgnorePatterns = [
    `/node_modules/(?!(${esmModules}))/`,
    '^.+\\.module\\.(css|sass|scss)$',
  ];

  return config;
};
