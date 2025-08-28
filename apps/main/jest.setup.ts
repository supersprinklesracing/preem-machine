import '@testing-library/jest-dom';
import { Headers, Request, Response } from 'node-fetch';
import { TextDecoder, TextEncoder } from 'util';

import { mockGoogleCloudFirestore } from 'firestore-jest-mock';
mockGoogleCloudFirestore(
  {},
  { includeIdsInData: true, mutable: true, simulateQueryFilters: true },
);

// Polyfill TextEncoder and TextDecoder for Jest
// @ts-expect-error: JSDOM does not have TextEncoder
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
