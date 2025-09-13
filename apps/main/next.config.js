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
  async rewrites() {
    return [
      {
        source: '/manage/live',
        destination: '/manage',
      },
      {
        source: '/manage/hub',
        destination: '/manage',
      },

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
        source: '/user',
        destination: '/user',
      },
      {
        source: '/:orgId/:seriesId/:eventId/:raceId/:preemId',
        destination:
          '/preem?path=organizations/:orgId/series/:seriesId/events/:eventId/races/:raceId/preems/:preemId',
      },
      {
        source: '/:orgId/:seriesId/:eventId/:raceId',
        destination:
          '/race?path=organizations/:orgId/series/:seriesId/events/:eventId/races/:raceId',
      },
      {
        source: '/:orgId/:seriesId/:eventId',
        destination:
          '/event?path=organizations/:orgId/series/:seriesId/events/:eventId',
      },
      {
        source: '/:orgId/:seriesId',
        destination: '/series?path=organizations/:orgId/series/:seriesId',
      },
      {
        source: '/:orgId',
        destination: '/organization?path=organizations/:orgId',
      },
    ];
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
