// apps/main/eslint.config.mjs
import baseConfig from '../../eslint.config.mjs';
import nx from '@nx/eslint-plugin';
import eslintReact from '@eslint-react/eslint-plugin';
import jsxA11y from 'eslint-plugin-jsx-a11y';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...baseConfig,

  // Apply Nx's recommended React settings
  ...nx.configs['flat/react-typescript'],

  // Apply new official React plugin's recommended settings
  eslintReact.configs.recommended,

  // Apply accessibility rules
  jsxA11y.flatConfigs.recommended,

  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // You can override or add project-specific rules here
      // This rule from next/core-web-vitals can be added manually if needed
      // '@next/next/no-html-link-for-pages': ['error', 'apps/main/src/pages'],
    },
    // Settings for the new React plugin
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
  },
  {
    // Ensure project-specific ignores are still here
    ignores: ['.next/**/*', 'dist/**/*'],
  },
];

export default config;
