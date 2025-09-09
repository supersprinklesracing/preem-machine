import { render, screen, setupMockDb } from '@/test-utils';
import PreemPage from './page';
import { NotFoundError } from '@/datastore/errors';

// Mock the concrete component to isolate the page component
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    refresh: () => {},
  }),
  useSearchParams: () => ({
    get: () => {},
  }),
}));
jest.mock(
  './Preem',
  () => ({
    __esModule: true,
    default: jest.fn(({ preem, children }) => (
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
      searchParams: {
        path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap',
      },
    });
    render(PageComponent);

    expect(screen.getByTestId('mock-preem')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'First Lap Leader' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('preem-id')).toHaveTextContent(
      'preem-giro-sf-2025-masters-women-first-lap',
    );
    expect(screen.getByTestId('contributions-count')).toHaveTextContent('1');
  });

  it('should throw NotFoundError when the preem does not exist', async () => {
    await expect(
      PreemPage({
        searchParams: {
          path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/non-existent-preem',
        },
      }),
    ).rejects.toThrow(NotFoundError);
  });
});
