import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

// Your custom config (without transformIgnorePatterns)
const customJestConfig: Config = {
  displayName: '@preem-machine/main',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/main',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  forceExit: true,
  reporters: process.env.IS_CI
    ? [
        ['github-actions', { silent: false }],
        ['summary', {}],
      ]
    : [['summary', {}]],
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
