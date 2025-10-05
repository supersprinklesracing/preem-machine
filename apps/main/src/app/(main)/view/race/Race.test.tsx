import MatchMediaMock from 'jest-matchmedia-mock';

import { DateLocationDetail } from '@/components/cards/DateLocationDetail';
import { fireEvent, PHONE_WIDTH, render, screen } from '@/test-utils';

import { Race } from './Race';

let matchMedia: MatchMediaMock;

// Mock child components
jest.mock('@/components/cards/RaceCard', () => ({
  __esModule: true,
  RaceCard: jest.fn(({ race }) => (
    <div>
      Mock RaceCard
      <DateLocationDetail {...race} />
    </div>
  )),
}));
jest.mock('@/components/AnimatedNumber', () => ({
  __esModule: true,
  AnimatedNumber: jest.fn(({ value }) => <span>{value}</span>),
}));
jest.mock('@/components/PreemStatusBadge/PreemStatusBadge', () => ({
  __esModule: true,
  PreemStatusBadge: jest.fn(() => <div>Mock PreemStatusBadge</div>),
}));
jest.mock('@/components/ContributionModal', () => ({
  __esModule: true,
  ContributionModal: jest.fn(() => <div>Mock ContributionModal</div>),
}));

const mockData = {
  race: {
    id: 'race-1',
    path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
    name: 'Test Race',
    timezone: 'America/Los_Angeles',
    startDate: new Date(),
  },
  children: [
    {
      preem: {
        id: 'preem-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1',
        name: 'Test Preem 1',
        prizePool: 100,
        raceBrief: {
          id: 'race-1',
          path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
          name: 'Test Race',
          eventBrief: {
            id: 'event-1',
            path: 'organizations/org-1/series/series-1/events/event-1',
            name: 'Test Event',
          },
        },
      },
      children: [],
    },
  ],
};

describe('Race component', () => {
  beforeAll(() => {
    matchMedia = new MatchMediaMock();
  });

  afterEach(() => {
    matchMedia.clear();
  });

  describe('Desktop view', () => {
    beforeEach(() => {
      matchMedia.useMediaQuery(`(min-width: ${PHONE_WIDTH + 1}px)`);
    });

    it('should render race and preem details', () => {
      render(<Race {...mockData} />);
      expect(screen.getByText('Mock RaceCard')).toBeInTheDocument();
      expect(screen.getAllByText('Test Preem 1').length).toBeGreaterThan(0);
    });

    it('should open the contribution modal when "Contribute" is clicked', () => {
      render(<Race {...mockData} />);
      const contributeButton = screen.getAllByText('Contribute')[0];
      fireEvent.click(contributeButton);
      expect(screen.getByText('Mock ContributionModal')).toBeInTheDocument();
    });
  });

  describe('Mobile view', () => {
    beforeEach(() => {
      matchMedia.useMediaQuery(`(max-width: ${PHONE_WIDTH}px)`);
    });

    it('should render race and preem details', () => {
      render(<Race {...mockData} />);
      expect(screen.getByText('Mock RaceCard')).toBeInTheDocument();
      expect(screen.getAllByText('Test Preem 1').length).toBeGreaterThan(0);
    });

    it('should open the contribution modal when "Contribute" is clicked', () => {
      render(<Race {...mockData} />);
      const contributeButton = screen.getAllByText('Contribute')[0];
      fireEvent.click(contributeButton);
      expect(screen.getByText('Mock ContributionModal')).toBeInTheDocument();
    });
  });

  it('should display the timezone', () => {
    render(<Race {...mockData} />);
    expect(screen.getByText(/PDT/)).toBeInTheDocument();
  });
});
