import '@testing-library/jest-dom';
import './src/matchMedia.mock';

import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

import { mockGoogleCloudFirestore } from 'firestore-jest-mock';
import { Headers, Request, Response } from 'node-fetch';
import { TextDecoder, TextEncoder } from 'util';
import { FakeFirestore } from 'firestore-jest-mock/mocks/firestore';
import { mockDbData } from './src/datastore/mock-db';
mockGoogleCloudFirestore(
  mockDbData,
  { includeIdsInData: true, mutable: true, simulateQueryFilters: true },
);

jest.mock('@/firebase/server/firebase-admin', () => ({
  getFirestore: jest.fn(() => new FakeFirestore(mockDbData)),
  getFirebaseAuthAdmin: jest.fn(() => ({
    updateUser: jest.fn(),
  })),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    onAuthStateChanged: jest.fn(),
  })),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  getRedirectResult: jest.fn(),
  isSignInWithEmailLink: jest.fn(),
  sendSignInLinkToEmail: jest.fn(),
  signInWithEmailLink: jest.fn(),
  setPersistence: jest.fn(),
  inMemoryPersistence: jest.fn(),
  connectAuthEmulator: jest.fn(),
}));

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

jest.mock('react-timezone-select', () => ({
  useTimezoneSelect: () => ({
    options: [
      { value: 'America/New_York', label: 'Eastern' },
      { value: 'America/Chicago', label: 'Central' },
      { value: 'America/Denver', label: 'Mountain' },
      { value: 'America/Los_Angeles', label: 'Pacific' },
    ],
  }),
}));

jest.useFakeTimers().setSystemTime(new Date('2025-07-13T00:00:00-07:00'));
