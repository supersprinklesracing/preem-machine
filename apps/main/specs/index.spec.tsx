import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import Page from '../src/app/(main)/page';

// Mock data access and other dependencies
jest.mock('@/datastore/data-access', () => ({
  getUsers: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/datastore/mock-data', () => ({
  raceSeries: [],
}));

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

// Mock the Home component
jest.mock('../src/app/(main)/Home', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Home</div>,
  };
});

describe('Page', () => {
  it('should render successfully', async () => {
    const PageComponent = await Page();
    const { baseElement } = render(
      <MantineProvider>{PageComponent}</MantineProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
