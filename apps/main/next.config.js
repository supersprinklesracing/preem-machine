//@ts-check

const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    svgr: false,
  },
  experimental: {
    authInterrupts: true,
  },
  productionBrowserSourceMaps: true,
  webpack: (config, { isServer, webpack }) => {
    // This rule uses null-loader to fix the "require.extensions" error.
    config.module.rules.push({
      test: /handlebars\/lib\/index\.js$/,
      loader: 'null-loader',
    });

    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
