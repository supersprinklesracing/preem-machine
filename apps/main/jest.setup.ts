/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-useless-constructor */

import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input: any, init?: any) {
      // This is a mock implementation
    }
  } as any;
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body?: any, init?: any) {
      // This is a mock implementation
    }
  } as any;
}

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any;
}
