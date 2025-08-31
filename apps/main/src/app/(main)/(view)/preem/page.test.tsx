import { render, screen, setupMockDb } from '@/test-utils';
import PreemPage from './page';
import Preem from './Preem';
import { NotFoundError } from '@/datastore/errors';

jest.mock('./Preem', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Preem</div>),
}));

setupMockDb();

describe.skip('PreemPage component', () => {
  beforeEach(() => {
    (Preem as jest.Mock).mockClear();
  });

  it('should fetch preem data and render the Preem component', async () => {
    const PageComponent = await PreemPage({
      searchParams: {
        path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women/preems/preem-giro-sf-2025-masters-women-first-lap',
      },
    });
    render(PageComponent);

    expect(screen.getByText('Mock Preem')).toBeInTheDocument();

    const preemCalls = (Preem as jest.Mock).mock.calls;
    expect(preemCalls[0][0].data.preem.id).toBe(
      'preem-giro-sf-2025-masters-women-first-lap',
    );
  });

  it('should throw NotFoundError when the preem does not exist', async () => {
    expect(
      PreemPage({
        searchParams: {
          path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/non-existent-preem',
        },
      }),
    ).rejects.toThrow(NotFoundError);
  });
});
