const nxPreset = require('@nx/jest/preset').default;
const path = require('path');

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    ...nxPreset.moduleNameMapper,
    '^@preem-machine/env$': path.join(__dirname, 'libs/env-vars/src/index.ts'),
    '^@preem-machine/env/(.*)$': path.join(__dirname, 'libs/env-vars/src/$1'),
  },
};
