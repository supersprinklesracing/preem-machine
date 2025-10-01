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
  webpack: (config) => {
    // This rule uses null-loader to fix the "require.extensions" error.
    config.module.rules.push({
      test: /handlebars\/lib\/index\.js$/,
      loader: 'null-loader',
    });

    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      }
    ];
  },
  async rewrites() {
    return {
      afterFiles: [
        // ==== MANAGE ====
        // Order is important here. Most specific routes must come first.

        // 7 segments
        {
          source: '/manage/:orgId/:seriesId/:eventId/:raceId/:preemId/edit',
          destination:
            '/manage/preem/edit?path=organizations/:orgId/series/:seriesId/events/:eventId/races/:raceId/preems/:preemId',
        },
        {
          source: '/manage/:orgId/:seriesId/:eventId/:raceId/preem/new',
          destination:
            '/manage/preem/new?path=organizations/:orgId/series/:seriesId/events/:eventId/races/:raceId/preems',
        },

        // 6 segments
        {
          source: '/manage/:orgId/:seriesId/:eventId/:raceId/edit',
          destination:
            '/manage/race/edit?path=organizations/:orgId/series/:seriesId/events/:eventId/races/:raceId',
        },
        {
          source: '/manage/:orgId/:seriesId/:eventId/race/new',
          destination:
            '/manage/race/new?path=organizations/:orgId/series/:seriesId/events/:eventId/races',
        },
        {
          source: '/manage/:orgId/:seriesId/:eventId/:raceId/:preemId',
          destination:
            '/manage/preem?path=organizations/:orgId/series/:seriesId/events/:eventId/races/:raceId/preems/:preemId',
        },

        // 5 segments
        {
          source: '/manage/:orgId/:seriesId/:eventId/edit',
          destination:
            '/manage/event/edit?path=organizations/:orgId/series/:seriesId/events/:eventId',
        },
        {
          source: '/manage/:orgId/:seriesId/event/new',
          destination:
            '/manage/event/new?path=organizations/:orgId/series/:seriesId/events',
        },
        {
          source: '/manage/:orgId/:seriesId/:eventId/:raceId',
          destination:
            '/manage/race?path=organizations/:orgId/series/:seriesId/events/:eventId/races/:raceId',
        },

        // 4 segments
        {
          source: '/manage/:orgId/:seriesId/edit',
          destination:
            '/manage/series/edit?path=organizations/:orgId/series/:seriesId',
        },
        {
          source: '/manage/:orgId/series/new',
          destination: '/manage/series/new?path=organizations/:orgId/series',
        },
        {
          source: '/manage/:orgId/:seriesId/:eventId',
          destination:
            '/manage/event?path=organizations/:orgId/series/:seriesId/events/:eventId',
        },

        // 3 segments
        {
          source: '/manage/:orgId/edit',
          destination: '/manage/organization/edit?path=organizations/:orgId',
        },
        {
          source: '/manage/:orgId/:seriesId',
          destination:
            '/manage/series?path=organizations/:orgId/series/:seriesId',
        },

        // 2 segments
        {
          source: '/manage/new',
          destination: '/manage/organization/new?path=organizations',
        },
        {
          source: '/manage/:orgId',
          destination: '/manage/organization?path=organizations/:orgId',
        },

        // ==== VIEWS ====
        {
          source: '/view/user/:userId',
          destination: '/view/user?path=users/:userId',
        },
        {
          source: `/view/:orgId/:seriesId/:eventId/:raceId/:preemId`,
          destination:
            '/view/preem?path=organizations/:orgId/series/:seriesId/events/:eventId/races/:raceId/preems/:preemId',
        },
        {
          source: `/view/:orgId/:seriesId/:eventId/:raceId`,
          destination:
            '/view/race?path=organizations/:orgId/series/:seriesId/events/:eventId/races/:raceId',
        },
        {
          source: `/view/:orgId/:seriesId/:eventId`,
          destination:
            '/view/event?path=organizations/:orgId/series/:seriesId/events/:eventId',
        },
        {
          source: `/view/:orgId/:seriesId`,
          destination:
            '/view/series?path=organizations/:orgId/series/:seriesId',
        },
        {
          source: `/view/:orgId`,
          destination: '/view/organization?path=organizations/:orgId',
        },
      ],
      fallback: [
        {
          source: '/__/:path*',
          destination: `https://\${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}/__/:path*`,
        },
      ],
    };
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
