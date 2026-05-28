/* eslint-disable no-restricted-syntax */
const nxPreset = require('@nx/jest/preset').default;
const path = require('path');

module.exports = {
  ...nxPreset,
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!.*(?:uuid|cls-rtracer|md-to-slack|marked|p-limit|yocto-queue|p-wait-for|p-timeout))',
  ],
  moduleNameMapper: {
    'server-only': path.join(
      __dirname,
      'libs/test-utils/src/server-only-mock.js',
    ),
    '^uuid$': require.resolve('uuid'),
    '^@preem-machine/auth/(.*)$': path.join(__dirname, 'libs/auth/src/$1'),
    '^@preem-machine/firebase-server$': path.join(
      __dirname,
      'libs/firebase-server/src/index.ts',
    ),
    '^@preem-machine/firebase-server/(.*)$': path.join(
      __dirname,
      'libs/firebase-server/src/$1',
    ),
    '^@preem-machine/instagram$': path.join(
      __dirname,
      'libs/instagram/src/index.ts',
    ),
    '^@preem-machine/instagram/(.*)$': path.join(
      __dirname,
      'libs/instagram/src/$1',
    ),
    '^@preem-machine/qbp$': path.join(__dirname, 'libs/qbp/src/index.ts'),
    '^@preem-machine/qbp/(.*)$': path.join(__dirname, 'libs/qbp/src/$1'),
    '^@preem-machine/competitions$': path.join(
      __dirname,
      'libs/competitions/src/index.ts',
    ),
    '^@preem-machine/competitions/browser$': path.join(
      __dirname,
      'libs/competitions/src/browser/index.ts',
    ),
    '^@preem-machine/competitions/(.*)$': path.join(
      __dirname,
      'libs/competitions/src/$1',
    ),
    '^@preem-machine/chores$': path.join(__dirname, 'libs/chores/src/index.ts'),
    '^@preem-machine/chores/(.*)$': path.join(__dirname, 'libs/chores/src/$1'),
    '^@preem-machine/results$': path.join(
      __dirname,
      'libs/results/src/index.ts',
    ),
    '^@preem-machine/results/(.*)$': path.join(
      __dirname,
      'libs/results/src/$1',
    ),
    '^@preem-machine/riders$': path.join(__dirname, 'libs/riders/src/index.ts'),
    '^@preem-machine/riders/(.*)$': path.join(__dirname, 'libs/riders/src/$1'),
    '^@preem-machine/slack$': path.join(__dirname, 'libs/slack/src/index.ts'),
    '^@preem-machine/slack/(.*)$': path.join(__dirname, 'libs/slack/src/$1'),
    '^@preem-machine/assistant$': path.join(
      __dirname,
      'libs/assistant/src/index.ts',
    ),
    '^@preem-machine/assistant/(.*)$': path.join(
      __dirname,
      'libs/assistant/src/$1',
    ),
    '^@preem-machine/test-utils$': path.join(
      __dirname,
      'libs/test-utils/src/index.ts',
    ),
    '^@preem-machine/test-utils/(.*)$': path.join(
      __dirname,
      'libs/test-utils/src/$1',
    ),
    '^@preem-machine/service-auth$': path.join(
      __dirname,
      'libs/service-auth/src/index.ts',
    ),
    '^@preem-machine/service-auth/(.*)$': path.join(
      __dirname,
      'libs/service-auth/src/$1',
    ),
    '^@preem-machine/logging$': path.join(
      __dirname,
      'libs/logging/src/index.ts',
    ),
    '^@preem-machine/logging/(.*)$': path.join(
      __dirname,
      'libs/logging/src/$1',
    ),
    '^@preem-machine/app$': path.join(__dirname, 'libs/app/src/index.ts'),
    '^@preem-machine/cloudevents$': path.join(
      __dirname,
      'libs/cloudevents/src/index.ts',
    ),
    '^@preem-machine/env$': path.join(__dirname, 'libs/env-vars/src/index.ts'),
    '^@preem-machine/env/(.*)$': path.join(__dirname, 'libs/env-vars/src/$1'),
    '^@preem-machine/stripe$': path.join(__dirname, 'libs/stripe/src/index.ts'),
    '^@preem-machine/stripe/(.*)$': path.join(__dirname, 'libs/stripe/src/$1'),
    '^@preem-machine/firestore$': path.join(
      __dirname,
      'libs/firestore/src/index.ts',
    ),
    '^@preem-machine/firestore/(.*)$': path.join(
      __dirname,
      'libs/firestore/src/$1',
    ),
    '^@preem-machine/google$': path.join(__dirname, 'libs/google/src/index.ts'),
    '^@preem-machine/mail$': path.join(__dirname, 'libs/mail/src/index.ts'),
    '^@preem-machine/mail/(.*)$': path.join(__dirname, 'libs/mail/src/$1'),
    '^@preem-machine/races$': path.join(__dirname, 'libs/races/src/index.ts'),
    '^@preem-machine/races/(.*)$': path.join(__dirname, 'libs/races/src/$1'),
    '^@preem-machine/rag$': path.join(__dirname, 'libs/rag/src/index.ts'),
    '^@preem-machine/rag/(.*)$': path.join(__dirname, 'libs/rag/src/$1'),
    '^@preem-machine/secrets$': path.join(
      __dirname,
      'libs/secrets/src/index.ts',
    ),
    '^@preem-machine/squareup$': path.join(
      __dirname,
      'libs/squareup/src/index.ts',
    ),
    '^@preem-machine/squareup/(.*)$': path.join(
      __dirname,
      'libs/squareup/src/$1',
    ),
    '^@preem-machine/strava$': path.join(__dirname, 'libs/strava/src/index.ts'),
    '^@preem-machine/strava/(.*)$': path.join(__dirname, 'libs/strava/src/$1'),
    '^@preem-machine/util$': path.join(__dirname, 'libs/util/src/index.ts'),
    '^@preem-machine/util/(.*)$': path.join(__dirname, 'libs/util/src/$1'),
    '^@preem-machine/util-server$': path.join(
      __dirname,
      'libs/util-server/src/index.ts',
    ),
    '^@preem-machine/util-server/(.*)$': path.join(
      __dirname,
      'libs/util-server/src/$1',
    ),
    '^@preem-machine/jsx$': path.join(__dirname, 'libs/jsx/src/index.ts'),
    '^@preem-machine/jsx/(.*)$': path.join(__dirname, 'libs/jsx/src/$1'),
    '^@preem-machine/youtube$': path.join(
      __dirname,
      'libs/youtube/src/index.ts',
    ),
    '^@preem-machine/youtube/(.*)$': path.join(
      __dirname,
      'libs/youtube/src/$1',
    ),
    '^@preem-machine/ghost$': path.join(__dirname, 'libs/ghost/src/index.ts'),
    '^@preem-machine/provider-service$': path.join(
      __dirname,
      'libs/provider-service/src/index.ts',
    ),
    '^@preem-machine/provider-service/(.*)$': path.join(
      __dirname,
      'libs/provider-service/src/$1',
    ),
    '^@preem-machine/race-events$': path.join(
      __dirname,
      'libs/race-events/src/index.ts',
    ),
    '^@preem-machine/race-events/(.*)$': path.join(
      __dirname,
      'libs/race-events/src/$1',
    ),
    '^@preem-machine/export-sheets$': path.join(
      __dirname,
      'libs/export-sheets/src/index.ts',
    ),
    '^@preem-machine/export-sheets/(.*)$': path.join(
      __dirname,
      'libs/export-sheets/src/$1',
    ),
  },
  maxWorkers: process.env.JEST_MAX_WORKERS
    ? isNaN(process.env.JEST_MAX_WORKERS)
      ? process.env.JEST_MAX_WORKERS
      : parseInt(process.env.JEST_MAX_WORKERS, 10)
    : undefined,
};
