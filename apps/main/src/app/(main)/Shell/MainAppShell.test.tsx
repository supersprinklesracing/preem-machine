import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { theme } from '../../theme';
import MainAppShell from './MainAppShell';

describe('MainAppShell', () => {
  it('renders children correctly', () => {
    render(
      <MantineProvider theme={theme}>
        <MainAppShell isSidebarOpened={false} toggleSidebar={() => {}}>
          <div>Page content</div>
        </MainAppShell>
      </MantineProvider>,
    );

    expect(screen.getByText('Page content')).toBeInTheDocument();
  });
});
