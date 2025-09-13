import { render, screen, setupMockDb } from '@/test-utils';
import NewEventPage from './page';

jest.mock('./NewEvent', () => ({
  __esModule: true,
  NewEvent: jest.fn(() => <div>Mock NewEvent</div>),
}));

jest.mock('./new-event-action', () => ({
  __esModule: true,
  newEventAction: jest.fn(),
}));

describe('NewEventPage', () => {
  setupMockDb();

  it('should render the NewEvent component', async () => {
    const PageComponent = await NewEventPage({
      searchParams: Promise.resolve({
        path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025',
      }),
    });
    render(PageComponent);
    expect(screen.getByText('Mock NewEvent')).toBeInTheDocument();
  });
});
