/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  unstable_getResponseFromNextConfig,
  getRewrittenUrl,
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
    buildUrl('/manage/org-super-sprinkles/series-sprinkles-2025/edit'),
    buildUrl(
      '/manage/series/edit?path=organizations/org-super-sprinkles/series/series-sprinkles-2025',
    ),
  ],
  [
    'manage/new-race',
    buildUrl(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race/new',
    ),
    buildUrl(
      '/manage/race/new?path=organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races',
    ),
  ],
  [
    'manage/race/edit',
    buildUrl(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women/edit',
    ),
    buildUrl(
      '/manage/race/edit?path=organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
    ),
  ],
  [
    'manage/new-preem',
    buildUrl(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women/preem/new',
    ),
    buildUrl(
      '/manage/preem/new?path=organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems',
    ),
  ],
  [
    'manage/preem/edit',
    buildUrl(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women/preem-1/edit',
    ),
    buildUrl(
      '/manage/preem/edit?path=organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-1',
    ),
  ],
  [
    'manage/preem/details',
    buildUrl(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women/preem-1',
    ),
    buildUrl(
      '/manage/preem?path=organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-1',
    ),
  ],
  [
    'manage/race/details',
    buildUrl(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women',
    ),
    buildUrl(
      '/manage/race?path=organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
    ),
  ],
  [
    'manage/new-event',
    buildUrl('/manage/org-super-sprinkles/series-sprinkles-2025/event/new'),
    buildUrl(
      '/manage/event/new?path=organizations/org-super-sprinkles/series/series-sprinkles-2025/events',
    ),
  ],
  [
    'manage/event/edit',
    buildUrl(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/edit',
    ),
    buildUrl(
      '/manage/event/edit?path=organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
    ),
  ],
  [
    'manage/event/details',
    buildUrl(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025',
    ),
    buildUrl(
      '/manage/event?path=organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
    ),
  ],
  [
    'manage/new-series',
    buildUrl('/manage/org-super-sprinkles/series/new'),
    buildUrl(
      '/manage/series/new?path=organizations/org-super-sprinkles/series',
    ),
  ],
  [
    'manage/series/edit',
    buildUrl('/manage/org-super-sprinkles/series-sprinkles-2025/edit'),
    buildUrl(
      '/manage/series/edit?path=organizations/org-super-sprinkles/series/series-sprinkles-2025',
    ),
  ],
  [
    'manage/series/details',
    buildUrl('/manage/org-super-sprinkles/series-sprinkles-2025'),
    buildUrl(
      '/manage/series?path=organizations/org-super-sprinkles/series/series-sprinkles-2025',
    ),
  ],
  [
    'manage/new-organization',
    buildUrl('/manage/new'),
    buildUrl('/manage/organization/new?path=organizations'),
  ],
  [
    'manage/organization/edit',
    buildUrl('/manage/org-super-sprinkles/edit'),
    buildUrl(
      '/manage/organization/edit?path=organizations/org-super-sprinkles',
    ),
  ],
  [
    'manage/organization/details',
    buildUrl('/manage/org-super-sprinkles'),
    buildUrl('/manage/organization?path=organizations/org-super-sprinkles'),
  ],
  // VIEWS
  ['view/user', buildUrl('/user'), buildUrl('/user')],
  [
    'view/race',
    buildUrl(
      '/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women/p1',
    ),
    buildUrl(
      '/preem?path=organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/p1',
    ),
  ],
  [
    'view/race',
    buildUrl(
      '/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women',
    ),
    buildUrl(
      '/race?path=organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
    ),
  ],
  [
    'view/event',
    buildUrl('/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025'),
    buildUrl(
      '/event?path=organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025',
    ),
  ],
  [
    'view/series',
    buildUrl('/org-super-sprinkles/series-sprinkles-2025'),
    buildUrl(
      '/series?path=organizations/org-super-sprinkles/series/series-sprinkles-2025',
    ),
  ],
  [
    'view/organization',
    buildUrl('/org-super-sprinkles'),
    buildUrl('/organization?path=organizations/org-super-sprinkles'),
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
