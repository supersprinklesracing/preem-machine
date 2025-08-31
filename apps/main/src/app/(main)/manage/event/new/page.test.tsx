import { render, screen } from '@/test-utils';
import CreateEventPage from './page';
import '@/matchMedia.mock';

jest.mock('./CreateEvent', () => ({
  __esModule: true,
  CreateEvent: jest.fn(() => <div>Mock CreateEvent</div>),
}));

jest.mock('./create-event-action', () => ({
  __esModule: true,
  createEventAction: jest.fn(),
}));

describe('CreateEventPage', () => {
  it('should render the CreateEvent component', async () => {
    const PageComponent = await CreateEventPage({
      searchParams: { path: 'organizations/org-1/series/series-1' },
    });
    render(PageComponent);
    expect(screen.getByText('Mock CreateEvent')).toBeInTheDocument();
  });
});
