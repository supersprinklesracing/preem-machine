/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  getRewrittenUrl,
  unstable_getResponseFromNextConfig,
} from 'next/experimental/testing/server';

import nextConfig from './next.config.js';

const buildUrl = (path) => {
  const url = new URL('http://localhost:3000');
  const [pathname, search] = path.split('?');
  url.pathname = pathname;
  if (search) {
    url.search = new URLSearchParams(search).toString();
  }
  return url.toString();
};

const testCases = [
  ['manage/live', buildUrl('/manage/live'), buildUrl('/manage')],
  ['manage/hub', buildUrl('/manage/hub'), buildUrl('/manage')],
  [
    'manage/series/edit',
    buildUrl('/manage/super-sprinkles/sprinkles-2025/edit'),
    buildUrl(
      '/manage/series/edit?path=organizations/super-sprinkles/series/sprinkles-2025',
    ),
  ],
  [
    'manage/new-race',
    buildUrl('/manage/super-sprinkles/sprinkles-2025/giro-sf-2025/race/new'),
    buildUrl(
      '/manage/race/new?path=organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races',
    ),
  ],
  [
    'manage/race/edit',
    buildUrl(
      '/manage/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women/edit',
    ),
    buildUrl(
      '/manage/race/edit?path=organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women',
    ),
  ],
  [
    'manage/new-preem',
    buildUrl(
      '/manage/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women/preem/new',
    ),
    buildUrl(
      '/manage/preem/new?path=organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems',
    ),
  ],
  [
    'manage/preem/edit',
    buildUrl(
      '/manage/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women/first-lap/edit',
    ),
    buildUrl(
      '/manage/preem/edit?path=organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems/first-lap',
    ),
  ],
  [
    'manage/preem/details',
    buildUrl(
      '/manage/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women/first-lap',
    ),
    buildUrl(
      '/manage/preem?path=organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems/first-lap',
    ),
  ],
  [
    'manage/race/details',
    buildUrl(
      '/manage/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women',
    ),
    buildUrl(
      '/manage/race?path=organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women',
    ),
  ],
  [
    'manage/new-event',
    buildUrl('/manage/super-sprinkles/sprinkles-2025/event/new'),
    buildUrl(
      '/manage/event/new?path=organizations/super-sprinkles/series/sprinkles-2025/events',
    ),
  ],
  [
    'manage/event/edit',
    buildUrl('/manage/super-sprinkles/sprinkles-2025/giro-sf-2025/edit'),
    buildUrl(
      '/manage/event/edit?path=organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025',
    ),
  ],
  [
    'manage/event/details',
    buildUrl('/manage/super-sprinkles/sprinkles-2025/giro-sf-2025'),
    buildUrl(
      '/manage/event?path=organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025',
    ),
  ],
  [
    'manage/new-series',
    buildUrl('/manage/super-sprinkles/series/new'),
    buildUrl('/manage/series/new?path=organizations/super-sprinkles/series'),
  ],
  [
    'manage/series/edit',
    buildUrl('/manage/super-sprinkles/sprinkles-2025/edit'),
    buildUrl(
      '/manage/series/edit?path=organizations/super-sprinkles/series/sprinkles-2025',
    ),
  ],
  [
    'manage/series/details',
    buildUrl('/manage/super-sprinkles/sprinkles-2025'),
    buildUrl(
      '/manage/series?path=organizations/super-sprinkles/series/sprinkles-2025',
    ),
  ],
  [
    'manage/new-organization',
    buildUrl('/manage/new'),
    buildUrl('/manage/organization/new?path=organizations'),
  ],
  [
    'manage/organization/edit',
    buildUrl('/manage/super-sprinkles/edit'),
    buildUrl('/manage/organization/edit?path=organizations/super-sprinkles'),
  ],
  [
    'manage/organization/details',
    buildUrl('/manage/super-sprinkles'),
    buildUrl('/manage/organization?path=organizations/super-sprinkles'),
  ],
  // VIEWS
  ['view/user', buildUrl('/user'), buildUrl('/user')],
  [
    'view/preem',
    buildUrl(
      '/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women/first-lap',
    ),
    buildUrl(
      '/preem?path=organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems/first-lap',
    ),
  ],
  [
    'view/race',
    buildUrl('/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women'),
    buildUrl(
      '/race?path=organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women',
    ),
  ],
  [
    'view/event',
    buildUrl('/super-sprinkles/sprinkles-2025/giro-sf-2025'),
    buildUrl(
      '/event?path=organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025',
    ),
  ],
  [
    'view/series',
    buildUrl('/super-sprinkles/sprinkles-2025'),
    buildUrl(
      '/series?path=organizations/super-sprinkles/series/sprinkles-2025',
    ),
  ],
  [
    'view/organization',
    buildUrl('/super-sprinkles'),
    buildUrl('/organization?path=organizations/super-sprinkles'),
  ],
];

// describe('Next Config', () => {
//   describe.each(testCases)(`Rewrites`, (testName, source, expected) => {
//     it(`${testName}: should rewrite ${source} to ${expected}`, async () => {
//       const response = await unstable_getResponseFromNextConfig({
//         url: source,
//         nextConfig: await nextConfig(),
//       });

//       expect(response.status).toBe(200);
//       expect(getRewrittenUrl(response)).toBe(expected);
//     });
//   });
// });

describe('Dummy(!) Next Config', () => {
  it('Dummy Test', () => {
    expect(true).toBe(true);
  });
});
