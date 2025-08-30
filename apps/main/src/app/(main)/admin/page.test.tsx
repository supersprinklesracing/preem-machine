import { render, screen } from '@/test-utils';
import React from 'react';
import AdminPage from './page';
import { createMockDb } from '@/datastore/mock-db';
import { getFirestore } from '@/firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';
import Admin from './Admin';
import '../../../matchMedia.mock';

// Mock dependencies
jest.mock('./Admin', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Admin</div>),
}));

let firestore: Firestore;
beforeAll(async () => {
  firestore = await getFirestore();
  (firestore as any).database = createMockDb(firestore);
});

describe('AdminPage component', () => {
  it('should fetch admin data and render the Admin component', async () => {
    const PageComponent = await AdminPage();
    render(PageComponent);

    expect(screen.getByText('Mock Admin')).toBeInTheDocument();

    // Assert that Admin was called with the users from the mock DB
    const adminCalls = (Admin as jest.Mock).mock.calls;
    expect(adminCalls[0][0].data.users.length).toBe(5); // The mock DB has 5 users
  });
});
