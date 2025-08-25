import '@testing-library/jest-dom';
import { Headers, Request, Response } from 'node-fetch';
import { TextDecoder, TextEncoder } from 'util';

import { mockGoogleCloudFirestore } from 'firestore-jest-mock';
mockGoogleCloudFirestore(
  {},
  { includeIdsInData: true, mutable: true, simulateQueryFilters: true },
);

// @/firebase-client/config.ts
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-auth-domain';
process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL = 'test-database-url';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID =
  'test-messaging-sender-id';

// @/firebase-admin/config.ts
process.env.NEXT_PUBLIC_USE_HTTPS = 'false';
process.env.SERVICE_ACCOUNT_CLIENT_EMAIL = 'test-client-email';
process.env.SERVICE_ACCOUNT_PRIVATE_KEY =
  '-----BEGIN RSA PRIVATE KEY-----\n' +
  'MIIBOgIBAAJBAKj34GkxFhD90vcNLYLInFEX6Ppy1tPf9Cnzj4p4WGeKLs1Pt8Qu\n' +
  'KUpRKfFLfRYC9AIKjbJTWit+CqvjWYzvQwECAwEAAQJAIJLixBy2qpFoS4DSmoEm\n' +
  'o3qGy0t6z09AIJtH+5OeRV1be+N4cDYJKffGzDa88vQENZiRm0GRq6a+HPGQMd2k\n' +
  'TQIhAKMSvzIBnni7ot/OSie2TmJLY4SwTQAevXysE2RbFDYdAiEBCUEaRQnMnbp7\n' +
  '9mxDXDf6AU0cN/RPBjb9qSHDcWZHGzUCIG2Es59z8ugGrDY+pxLQnwfotadxd+Uy\n' +
  'v/Ow5T0q5gIJAiEAyS4RaI9YG8EWx/2w0T67ZUVAw8eOMB6BIUg0Xcu+3okCIBOs\n' +
  '/5OiPgoTdSy7bcF9IGpSE8ZgGKzgYQVZeN97YE00\n' +
  '-----END RSA PRIVATE KEY-----';
process.env.AUTH_COOKIE_NAME = 'test-cookie';
process.env.AUTH_COOKIE_SIGNATURE_KEY_CURRENT = 'test-signature-key-current';
process.env.AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS = 'test-signature-key-previous';

// Polyfill TextEncoder and TextDecoder for Jest
global.TextEncoder = TextEncoder;
// @ts-expect-error: JSDOM does not have TextDecoder
global.TextDecoder = TextDecoder;

// Polyfill Request, Response, and Headers for Jest
if (!global.Request) {
  // @ts-expect-error: JSDOM does not have Request
  global.Request = Request;
  // @ts-expect-error: JSDOM does not have Response
  global.Response = Response;
  // @ts-expect-error: JSDOM does not have Headers
  global.Headers = Headers;
}

// Mock ResizeObserver
class ResizeObserver {
  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}

window.ResizeObserver = ResizeObserver;
