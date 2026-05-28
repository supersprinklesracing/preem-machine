import { render, screen } from '@/test-utils';

import { MainAppShell } from './MainAppShell';
import { MainAppShellContext } from './MainAppShellContext';

describe('MainAppShell', () => {
  it('renders the children', () => {
    render(
      <MainAppShellContext
        value={{
          isSidebarOpened: false,
          toggleSidebar: jest.fn(),
          isMobile: false,
          onLinkClick: jest.fn(),
        }}
      >
        <MainAppShell>
          <div>Page content</div>
        </MainAppShell>
      </MainAppShellContext>,
    );
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('renders the sidebar and avatar cluster', () => {
    render(
      <MainAppShellContext
        value={{
          isSidebarOpened: false,
          toggleSidebar: jest.fn(),
          isMobile: false,
          onLinkClick: jest.fn(),
        }}
      >
        <MainAppShell
          sidebar={<div>Sidebar content</div>}
          avatarCluster={<div>Avatar cluster</div>}
        >
          <div>Page content</div>
        </MainAppShell>
      </MainAppShellContext>,
    );
    expect(screen.getByText('Sidebar content')).toBeInTheDocument();
    expect(screen.getByText('Avatar cluster')).toBeInTheDocument();
  });

  it('the burger button is not expanded by default', () => {
    render(
      <MainAppShellContext
        value={{
          isSidebarOpened: false,
          toggleSidebar: jest.fn(),
          isMobile: false,
          onLinkClick: jest.fn(),
        }}
      >
        <MainAppShell>
          <div>Page content</div>
        </MainAppShell>
      </MainAppShellContext>,
    );
    const burgerButton = screen.getByTestId('sidebar-burger');
    expect(burgerButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('the burger button is expanded when isSidebarOpened is true', () => {
    render(
      <MainAppShellContext
        value={{
          isSidebarOpened: true,
          toggleSidebar: jest.fn(),
          isMobile: false,
          onLinkClick: jest.fn(),
        }}
      >
        <MainAppShell>
          <div>Page content</div>
        </MainAppShell>
      </MainAppShellContext>,
    );
    const burgerButton = screen.getByTestId('sidebar-burger');
    expect(burgerButton).toHaveAttribute('aria-expanded', 'true');
  });
});
