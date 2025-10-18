import userEvent from '@testing-library/user-event';

import { User } from '@/datastore/schema';
import { render, screen, setupTimeMocking } from '@/test-utils';

import { MainAppShellContext } from './MainAppShellContext';
import { Sidebar, SidebarProps } from './Sidebar';

const mockUser: User = {
  id: 'user-1',
  path: 'users/user-1',
  name: 'Test User',
  organizationRefs: [{ id: 'org-1', path: 'organizations/org-1' }],
};

const mockData: SidebarProps = {
  events: [
    {
      id: 'event-1',
      path: 'organizations/org-1/series/series-1/events/event-1',
      name: 'Test Event 1',
    },
    {
      id: 'event-2',
      path: 'organizations/org-1/series/series-1/events/event-2',
      name: 'Test Event 2',
    },
  ],
  user: mockUser,
};

describe('Sidebar component', () => {
  setupTimeMocking();

  it('should render event links', () => {
    render(
      <MainAppShellContext
        value={{
          onLinkClick: jest.fn(),
          isMobile: false,
          isSidebarOpened: true,
          toggleSidebar: jest.fn(),
        }}
      >
        <Sidebar {...mockData} />
      </MainAppShellContext>,
    );
    expect(
      screen.getByRole('link', { name: 'Test Event 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Test Event 2' }),
    ).toBeInTheDocument();
  });

  it('should call onLinkClick when a link is clicked on mobile', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onLinkClick = jest.fn();
    render(
      <MainAppShellContext
        value={{
          onLinkClick,
          isMobile: true,
          isSidebarOpened: true,
          toggleSidebar: jest.fn(),
        }}
      >
        <Sidebar {...mockData} />
      </MainAppShellContext>,
    );

    await user.click(screen.getByRole('link', { name: 'Test Event 1' }));

    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onLinkClick when a link is clicked on desktop', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onLinkClick = jest.fn();
    render(
      <MainAppShellContext
        value={{
          onLinkClick,
          isMobile: false,
          isSidebarOpened: true,
          toggleSidebar: jest.fn(),
        }}
      >
        <Sidebar {...mockData} />
      </MainAppShellContext>,
    );

    await user.click(screen.getByRole('link', { name: 'Test Event 1' }));

    expect(onLinkClick).not.toHaveBeenCalled();
  });

  it('should not render Hub link when user has no organizationRefs', () => {
    const userWithNoOrgs: User = { ...mockUser, organizationRefs: [] };
    const data = { ...mockData, user: userWithNoOrgs };
    render(
      <MainAppShellContext
        value={{
          onLinkClick: jest.fn(),
          isMobile: false,
          isSidebarOpened: true,
          toggleSidebar: jest.fn(),
        }}
      >
        <Sidebar {...data} />
      </MainAppShellContext>,
    );
    expect(screen.queryByRole('link', { name: 'Hub' })).not.toBeInTheDocument();
  });

  it('should not render Hub link when user is null', () => {
    const data = { ...mockData, user: null };
    render(
      <MainAppShellContext
        value={{
          onLinkClick: jest.fn(),
          isMobile: false,
          isSidebarOpened: true,
          toggleSidebar: jest.fn(),
        }}
      >
        <Sidebar {...data} />
      </MainAppShellContext>,
    );
    expect(screen.queryByRole('link', { name: 'Hub' })).not.toBeInTheDocument();
  });
});