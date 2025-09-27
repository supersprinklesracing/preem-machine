import { render, screen } from '@testing-library/react';
import NotFound from './not-found';
import { MantineProvider } from '@mantine/core';

describe('Not Found Page', () => {
  it('renders the not found page', () => {
    render(
      <MantineProvider>
        <NotFound />
      </MantineProvider>
    );
    expect(
      screen.getByText('404 - Page Not Found')
    ).toBeInTheDocument();
  });
});
