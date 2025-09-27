import { render, screen } from '@testing-library/react';
import Error from './error';
import { MantineProvider } from '@mantine/core';
import { AuthError } from '@/auth/errors';

describe('Error Page', () => {
  it('renders the generic error UI for a generic error', () => {
    const error = { message: 'Something went wrong!' } as Error;
    render(
      <MantineProvider>
        <Error error={error} reset={() => {}} />
      </MantineProvider>
    );
    expect(
      screen.getByRole('heading', { name: 'Something went wrong!' })
    ).toBeInTheDocument();
  });

  it('renders the unauthorized UI for an AuthError with status 401', () => {
    const error = new AuthError('Unauthorized', 401);
    render(
      <MantineProvider>
        <Error error={error} reset={() => {}} />
      </MantineProvider>
    );
    expect(
      screen.getByText('401 - Unauthorized')
    ).toBeInTheDocument();
  });
});
