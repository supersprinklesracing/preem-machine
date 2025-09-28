import { fireEvent, render, screen } from '@/test-utils';
import { User } from '@/datastore/schema';
import { AppShellContext } from './AppShellContext';
import Sidebar, { SidebarProps } from './Sidebar';

const mockUser: User = {
  id: 'user-1',
  path: 'users/user-1',
  displayName: 'Test User',
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
  it('should render event links', () => {
    render(
      <AppShellContext.Provider
        value={{
          onLinkClick: jest.fn(),
          isMobile: false,
          isSidebarOpened: true,
          toggleSidebar: jest.fn(),
        }}
      >
        <Sidebar {...mockData} />
      </AppShellContext.Provider>,
    );
    expect(
      screen.getByRole('link', { name: 'Test Event 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Test Event 2' }),
    ).toBeInTheDocument();
  });

  it('should call onLinkClick when a link is clicked on mobile', () => {
    const onLinkClick = jest.fn();
    render(
      <AppShellContext.Provider
        value={{
          onLinkClick,
          isMobile: true,
          isSidebarOpened: true,
          toggleSidebar: jest.fn(),
        }}
      >
        <Sidebar {...mockData} />
      </AppShellContext.Provider>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Test Event 1' }));

    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onLinkClick when a link is clicked on desktop', () => {
    const onLinkClick = jest.fn();
    render(
      <AppShellContext.Provider
        value={{
          onLinkClick,
          isMobile: false,
          isSidebarOpened: true,
          toggleSidebar: jest.fn(),
        }}
      >
        <Sidebar {...mockData} />
      </AppShellContext.Provider>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Test Event 1' }));

    expect(onLinkClick).not.toHaveBeenCalled();
  });

  it('should not render Hub link when user has no organizationRefs', () => {
    const userWithNoOrgs: User = { ...mockUser, organizationRefs: [] };
    const data = { ...mockData, user: userWithNoOrgs };
    render(
      <AppShellContext.Provider
        value={{
          onLinkClick: jest.fn(),
          isMobile: false,
          isSidebarOpened: true,
          toggleSidebar: jest.fn(),
        }}
      >
        <Sidebar {...data} />
      </AppShellContext.Provider>,
    );
    expect(screen.queryByRole('link', { name: 'Hub' })).not.toBeInTheDocument();
  });

  it('should not render Hub link when user is null', () => {
    const data = { ...mockData, user: null };
    render(
      <AppShellContext.Provider
        value={{
          onLinkClick: jest.fn(),
          isMobile: false,
          isSidebarOpened: true,
          toggleSidebar: jest.fn(),
        }}
      >
        <Sidebar {...data} />
      </AppShellContext.Provider>,
    );
    expect(screen.queryByRole('link', { name: 'Hub' })).not.toBeInTheDocument();
  });
});