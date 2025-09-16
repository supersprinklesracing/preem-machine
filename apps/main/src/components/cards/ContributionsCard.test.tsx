import type { RaceWithPreems } from '@/datastore/query-schema';
import MatchMediaMock from 'jest-matchmedia-mock';

import { render, screen, PHONE_WIDTH } from '@/test-utils';
import ContributionsCard from './ContributionsCard';

let matchMedia: MatchMediaMock;

// Mock child components
jest.mock('@/components/UserAvatar/UserAvatar', () => ({
  UserAvatar: jest.fn(() => <div>Mock UserAvatar</div>),
}));

const mockRace: RaceWithPreems = {
  race: {
    id: 'race-1',
    path: 'organizations/org-1/series/series-1/events/event-1/races/race-1',
    name: 'Test Race',
  },
  children: [
    {
      preem: {
        id: 'preem-1',
        path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1',
        name: 'Test Preem 1',
      },
      children: [
        {
          id: 'contrib-1',
          path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1/contributions/contrib-1',
          amount: 100,
          message: 'Go fast!',
          contributor: { id: 'user-1', path: 'users/user-1', name: 'Alice' },
          preemBrief: {
            id: 'preem-1',
            path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1',
            name: 'Test Preem 1',
          },
        },
      ],
    },
  ],
};

describe('ContributionsCard component', () => {
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

    it('should render the contribution table', () => {
      render(<ContributionsCard {...mockRace} />);
      expect(screen.getAllByText('Mock UserAvatar').length).toBeGreaterThan(0);
      expect(screen.getAllByText('$100').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Test Preem 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Go fast!').length).toBeGreaterThan(0);
    });
  });

  describe('Mobile view', () => {
    beforeEach(() => {
      matchMedia.useMediaQuery(`(max-width: ${PHONE_WIDTH}px)`);
    });

    it('should render the contribution cards', () => {
      render(<ContributionsCard {...mockRace} />);
      expect(screen.getAllByText('Mock UserAvatar').length).toBeGreaterThan(0);
      expect(screen.getAllByText('$100').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Test Preem 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Go fast!/).length).toBeGreaterThan(0);
    });
  });

  it('should render a message when there are no contributions', () => {
    const raceWithNoContributions: RaceWithPreems = {
      ...mockRace,
      children: [
        {
          preem: {
            id: 'preem-1',
            path: 'organizations/org-1/series/series-1/events/event-1/races/race-1/preems/preem-1',
            name: 'Test Preem 1',
          },
          children: [],
        },
      ],
    };
    render(<ContributionsCard {...raceWithNoContributions} />);
    const messages = screen.getAllByText('Waiting for contributions...');
    expect(messages.length).toBeGreaterThan(0);
  });
});
