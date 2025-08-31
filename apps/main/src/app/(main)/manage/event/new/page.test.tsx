import { render, screen } from '@/test-utils';
import NewEventPage from './page';
import '@/matchMedia.mock';

jest.mock('./NewEvent', () => ({
  __esModule: true,
  NewEvent: jest.fn(() => <div>Mock NewEvent</div>),
}));

jest.mock('./new-event-action', () => ({
  __esModule: true,
  newEventAction: jest.fn(),
}));

describe('NewEventPage', () => {
  it('should render the NewEvent component', async () => {
    const PageComponent = await NewEventPage({
      searchParams: Promise.resolve({
        path: 'organizations/org-1/series/series-1',
      }),
    });
    render(PageComponent);
    expect(screen.getByText('Mock NewEvent')).toBeInTheDocument();
  });
});
