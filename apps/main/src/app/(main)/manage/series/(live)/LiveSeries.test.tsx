import '@/matchMedia.mock';
import { render, screen } from '@/test-utils';
import LiveSeries from './LiveSeries';

// Mock the EventCard component
jest.mock('@/components/cards/EventCard', () => ({
  __esModule: true,
  default: jest.fn(({ event, children }) => (
    <div>
      <div>Mock EventCard: {event.name}</div>
      {children}
    </div>
  )),
}));

jest.mock('@/firebase-client/dates', () => ({
  formatDateRange: jest.fn(() => 'formatted date range'),
}));

const mockData = {
  series: {
    id: 'series-1',
    path: 'organizations/org-1/series/series-1',
    name: 'Test Live Series',
    description: 'This is a test series.',
    location: 'Test Location',
    website: 'https://example.com',
    startDate: new Date(),
    endDate: new Date(),
    organizationBrief: {
      id: 'org-1',
      path: 'organizations/org-1',
      name: 'Test Org',
    },
  },
  children: [
    {
      event: {
        id: 'event-1',
        path: 'organizations/org-1/series/series-1/events/event-1',
        name: 'Test Event 1',
        seriesBrief: {
          id: 'series-1',
          path: 'organizations/org-1/series/series-1',
          name: 'Test Live Series',
          organizationBrief: {
            id: 'org-1',
            path: 'organizations/org-1',
            name: 'Test Org',
          },
        },
      },
      children: [],
    },
  ],
};

describe('LiveSeries component', () => {
  it('should render series details and event cards', async () => {
    render(<LiveSeries {...mockData} />);

    // Check for series details
    expect(screen.getByText('Test Live Series')).toBeInTheDocument();
    expect(screen.getByText('This is a test series.')).toBeInTheDocument();
    expect(
      await screen.findByText((content, element) =>
        content.startsWith('Test Location'),
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Official Website')).toBeInTheDocument();
    expect(screen.getByText('Test Org')).toBeInTheDocument();

    // Check for mocked event cards
    expect(
      screen.getByText('Mock EventCard: Test Event 1'),
    ).toBeInTheDocument();
  });
});
