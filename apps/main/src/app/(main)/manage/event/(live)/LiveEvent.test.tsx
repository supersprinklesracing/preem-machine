import '@/matchMedia.mock';
import { render, screen } from '@/test-utils';
import LiveEvent from './LiveEvent';

// Mock the RaceCard component
jest.mock('@/components/cards/RaceCard', () => ({
  __esModule: true,
  default: jest.fn(({ race, children }) => (
    <div>
      <div>Mock RaceCard: {race.name}</div>
      {children}
    </div>
  )),
}));

const mockData = {
  event: {
    id: 'event-1',
    path: 'organizations/org-1/series/series-1/events/event-1',
    name: 'Test Live Event',
    location: 'Test Location',
    startDate: new Date(),
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
  children: [
    {
      race: {
        id: 'race-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
        name: 'Test Live Race 1',
      },
      children: [],
    },
    {
      race: {
        id: 'race-2',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-2',
        name: 'Test Live Race 2',
      },
      children: [],
    },
  ],
};

describe('LiveEvent component', () => {
  it('should render event details and race cards', () => {
    render(<LiveEvent {...mockData} />);

    // Check for event details
    expect(screen.getByText('Test Live Event')).toBeInTheDocument();
    expect(screen.getByText('Test Live Series')).toBeInTheDocument();

    // Check for mocked race cards
    expect(
      screen.getByText('Mock RaceCard: Test Live Race 1'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Mock RaceCard: Test Live Race 2'),
    ).toBeInTheDocument();
  });

  it('should render a "Create New Race" button with the correct link', () => {
    render(<LiveEvent {...mockData} />);

    const createRaceButton = screen.getByRole('link', {
      name: /create new race/i,
    });
    expect(createRaceButton).toBeInTheDocument();
    expect(createRaceButton).toHaveAttribute(
      'href',
      `/manage/race/new?path=${mockData.event.path}`,
    );
  });
});
