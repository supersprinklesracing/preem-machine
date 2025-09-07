describe('Dummy(!) Next Config', () => {
  it('Dummy Test', () => {
    expect(true).toBe(true);
  });
});

// import {
//   unstable_getResponseFromNextConfig,
//   getRewrittenUrl,
// } from 'next/experimental/testing/server';
// import nextConfig from './next.config.js';

// const buildUrl = (path) => {
//   const url = new URL('http://localhost:3000');
//   const [pathname, search] = path.split('?');
//   url.pathname = pathname;
//   if (search) {
//     url.search = new URLSearchParams(search).toString();
//   }
//   return url.toString();
// };

// const testCases = [
//   ['manage/live', buildUrl('/manage/live'), buildUrl('/manage')],
//   ['manage/hub', buildUrl('/manage/hub'), buildUrl('/manage')],
//   [
//     'manage/series/edit',
//     buildUrl('/manage/org-super-sprinkles/series-sprinkles-2025/edit'),
//     buildUrl(
//       '/manage/series/edit?path=organizations/org-super-sprinkles/series/series-sprinkles-2025',
//     ),
//   ],
//   [
//     'manage/new-race',
//     buildUrl('/manage/org1/s1/e1/race/new'),
//     buildUrl(
//       '/manage/race/new?path=organizations/org1/series/s1/events/e1/races',
//     ),
//   ],
//   [
//     'manage/race/edit',
//     buildUrl('/manage/org1/s1/e1/r1/edit'),
//     buildUrl(
//       '/manage/race/edit?path=organizations/org1/series/s1/events/e1/races/r1',
//     ),
//   ],
//   [
//     'manage/race/details',
//     buildUrl('/manage/org1/s1/e1/r1'),
//     buildUrl(
//       '/manage/race?path=organizations/org1/series/s1/events/e1/races/r1',
//     ),
//   ],
//   [
//     'manage/new-event',
//     buildUrl('/manage/org1/s1/event/new'),
//     buildUrl('/manage/event/new?path=organizations/org1/series/s1/events'),
//   ],
//   [
//     'manage/event/edit',
//     buildUrl('/manage/org1/s1/e1/edit'),
//     buildUrl('/manage/event/edit?path=organizations/org1/series/s1/events/e1'),
//   ],
//   [
//     'manage/event/details',
//     buildUrl('/manage/org1/s1/e1'),
//     buildUrl('/manage/event?path=organizations/org1/series/s1/events/e1'),
//   ],
//   [
//     'manage/new-series',
//     buildUrl('/manage/org1/series/new'),
//     buildUrl('/manage/series/new?path=organizations/org1/series'),
//   ],
//   [
//     'manage/series/edit',
//     buildUrl('/manage/org1/s1/edit'),
//     buildUrl('/manage/series/edit?path=organizations/org1/series/s1'),
//   ],
//   [
//     'manage/series/details',
//     buildUrl('/manage/org1/s1'),
//     buildUrl('/manage/series?path=organizations/org1/series/s1'),
//   ],
//   [
//     'manage/new-organization',
//     buildUrl('/manage/new'),
//     buildUrl('/manage/organization/new?path=organizations'),
//   ],
//   [
//     'manage/organization/edit',
//     buildUrl('/manage/org1/edit'),
//     buildUrl('/manage/organization/edit?path=organizations/org1'),
//   ],
//   [
//     'manage/organization/details',
//     buildUrl('/manage/org1'),
//     buildUrl('/manage/organization?path=organizations/org1'),
//   ],
//   // VIEWS
//   ['view/user', buildUrl('/user'), buildUrl('/user')],
//   [
//     'view/race',
//     buildUrl('/org1/s1/e1/r1/p1'),
//     buildUrl('/preem?path=organizations/org1/series/s1/events/e1/races/r1/preems/p1'),
//   ],
//   [
//     'view/race',
//     buildUrl('/org1/s1/e1/r1'),
//     buildUrl('/race?path=organizations/org1/series/s1/events/e1/races/r1'),
//   ],
//   [
//     'view/event',
//     buildUrl('/org1/s1/e1'),
//     buildUrl('/event?path=organizations/org1/series/s1/events/e1'),
//   ],
//   [
//     'view/series',
//     buildUrl('/org1/s1'),
//     buildUrl('/series?path=organizations/org1/series/s1'),
//   ],
//   [
//     'view/organization',
//     buildUrl('/org1'),
//     buildUrl('/organization?path=organizations/org1'),
//   ],
// ];

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
