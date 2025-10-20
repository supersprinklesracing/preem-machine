import { getEventsForUser } from '@/datastore/server/query/query';
import { render } from '@/test-utils';
import { validUserContext } from '@/user/server/user';

import Layout from './layout';

jest.mock('@/datastore/server/query/query');
jest.mock('@/user/server/user');
jest.mock('./Shell/SidebarProvider', () => ({
  __esModule: true,
  SidebarProvider: jest.fn(() => <div>Mock Sidebar</div>),
}));

const mockedGetEventsForUser = jest.mocked(getEventsForUser);
const mockedValidUserContext = jest.mocked(validUserContext);

describe('Main Layout', () => {
  it('should not fetch user and events data directly', async () => {
    render(await Layout({ children: <div>Test Children</div> }));
    expect(mockedValidUserContext).not.toHaveBeenCalled();
    expect(mockedGetEventsForUser).not.toHaveBeenCalled();
  });
});
