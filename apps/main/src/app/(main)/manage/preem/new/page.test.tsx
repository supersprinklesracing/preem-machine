import { render, screen, setupMockDb } from '@/test-utils';
import NewPreemPage from './page';

jest.mock('./NewPreem', () => ({
  __esModule: true,
  NewPreem: jest.fn(() => <div>Mock NewPreem</div>),
}));

jest.mock('./new-preem-action', () => ({
  __esModule: true,
  createPreemAction: jest.fn(),
}));

describe('NewPreemPage', () => {
  setupMockDb();

  it('should render the NewPreem component', async () => {
    const PageComponent = await NewPreemPage({
      searchParams: Promise.resolve({
        path: 'organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025/races/masters-women/preems',
      }),
    });
    render(PageComponent);
    expect(screen.getByText('Mock NewPreem')).toBeInTheDocument();
  });
});
