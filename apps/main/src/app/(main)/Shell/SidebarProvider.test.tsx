import { getEventsForUser } from '@/datastore/server/query/query';
import {
  MOCK_USER,
  render,
  screen,
  setupLoggedInUserContext,
} from '@/test-utils';

import { SidebarProvider } from './SidebarProvider';

jest.mock('@/datastore/server/query/query');

const mockedGetEventsForUser = jest.mocked(getEventsForUser);

describe('SidebarProvider', () => {
  setupLoggedInUserContext();

  beforeEach(() => {
    mockedGetEventsForUser.mockResolvedValue([
      { name: 'Event 1', path: 'org/series/event1' },
      { name: 'Event 2', path: 'org/series/event2' },
    ] as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user and events data and pass it to the Sidebar', async () => {
    render(await SidebarProvider());

    expect(mockedGetEventsForUser).toHaveBeenCalledWith(MOCK_USER.id);

    expect(await screen.findByText('Event 1')).toBeInTheDocument();
    expect(await screen.findByText('Event 2')).toBeInTheDocument();
  });
});
