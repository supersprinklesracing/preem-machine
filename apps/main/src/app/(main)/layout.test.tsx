import { redirect } from 'next/navigation';

import { getEventsForUser } from '@/datastore/server/query/query';
import {
  render,
  screen,
  setupIncompleteUserContext,
  setupLoggedInUserContext,
  setupLoggedOutUserContext,
} from '@/test-utils';

import Layout from './layout';

jest.mock('@/datastore/server/query/query');
jest.mock('@/user/server/user');
jest.mock('./Shell/SidebarProvider', () => ({
  __esModule: true,
  SidebarProvider: jest.fn(() => <div>Mock Sidebar</div>),
}));
jest.mock('./Shell/AvatarCluster', () => ({
  __esModule: true,
  AvatarCluster: jest.fn(() => <div>Mock Sidebar</div>),
}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn((...args: string[]) => {
    throw new Error(`mock redirect(${args.join(',')})`);
  }),
}));

const mockedGetEventsForUser = jest.mocked(getEventsForUser);

describe('Main Layout', () => {
  beforeEach(() => {
    (redirect as unknown as jest.Mock).mockClear();
  });
  it('should not fetch user and events data directly', async () => {
    render(await Layout({ children: <div>Test Children</div> }));
    expect(mockedGetEventsForUser).not.toHaveBeenCalled();
  });
  describe('Logged in', () => {
    setupLoggedInUserContext();
    it('renders', async () => {
      render(await Layout({ children: <div>Test Children</div> }));
      expect(screen.getByText('Test Children')).toBeInTheDocument();
    });
  });
  describe('Logged out', () => {
    setupLoggedOutUserContext();
    it('renders', async () => {
      render(await Layout({ children: <div>Test Children</div> }));
      expect(screen.getByText('Test Children')).toBeInTheDocument();
    });
  });
  describe('Incomplete user', () => {
    setupIncompleteUserContext();
    it('redirects', async () => {
      expect(Layout({ children: <div>Test Children</div> })).rejects.toThrow(
        'mock redirect(/new-user)',
      );
    });
  });
});
