import { MOCK_USER_1 } from '@/datastore/mock-db';
import { getEventsForUser } from '@/datastore/server/query/query';
import { render, screen, setupUserContext } from '@/test-utils';

import { SidebarProvider } from './SidebarProvider';

jest.mock('@/datastore/server/query/query');

const mockedGetEventsForUser = jest.mocked(getEventsForUser);

describe('SidebarProvider', () => {
  const { mockedValidUserContext } = setupUserContext();

  beforeEach(() => {
    mockedGetEventsForUser.mockResolvedValue([
      { name: 'Event 1', path: 'org/series/event1' },
      { name: 'Event 2', path: 'org/series/event2' },
    ] as any);
    mockedValidUserContext.mockResolvedValue({
      user: MOCK_USER_1,
      authUser: {} as any,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user and events data and pass it to the Sidebar', async () => {
    render(await SidebarProvider());

    expect(mockedValidUserContext).toHaveBeenCalled();
    expect(mockedGetEventsForUser).toHaveBeenCalledWith(MOCK_USER_1.id);

    expect(await screen.findByText('Event 1')).toBeInTheDocument();
    expect(await screen.findByText('Event 2')).toBeInTheDocument();
  });
});
