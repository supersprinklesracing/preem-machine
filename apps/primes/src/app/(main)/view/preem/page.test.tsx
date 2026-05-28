import { NotFoundError } from '@/datastore/errors';
import { render, screen, setupMockDb } from '@/test-utils';

import PreemPage from './page';

// Mock the concrete component to isolate the page component
jest.mock(
  './Preem',
  () => ({
    __esModule: true,
    Preem: jest.fn(({ preem, children }) => (
      <div data-testid="mock-preem">
        <h1>{preem.name}</h1>
        <div data-testid="preem-id">{preem.id}</div>
        <div data-testid="contributions-count">{children.length}</div>
      </div>
    )),
  }),
  // virtual: true,
);

setupMockDb();

describe('PreemPage component', () => {
  it('should fetch preem data and render the Preem component', async () => {
    const PageComponent = await PreemPage({
      searchParams: Promise.resolve({
        path: 'preems/first-lap',
      }),
    });
    render(PageComponent);

    expect(screen.getByTestId('mock-preem')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'First Lap Leader' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('preem-id')).toHaveTextContent('first-lap');
    expect(screen.getByTestId('contributions-count')).toHaveTextContent('1');
  });

  it('should throw NotFoundError when the preem does not exist', async () => {
    await expect(
      PreemPage({
        searchParams: Promise.resolve({
          path: 'preems/non-existent-preem',
        }),
      }),
    ).rejects.toThrow(NotFoundError);
  });
});
