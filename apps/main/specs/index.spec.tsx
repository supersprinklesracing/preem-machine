import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import Page from '../src/app/page';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

describe('Page', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MantineProvider>
        <Page />
      </MantineProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
