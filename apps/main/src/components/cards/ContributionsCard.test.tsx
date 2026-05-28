import MatchMediaMock from 'jest-matchmedia-mock';

import { PHONE_WIDTH, render, screen } from '@/test-utils';

import { ContributionsCard } from './ContributionsCard';

let matchMedia: MatchMediaMock;

// Mock child components
jest.mock('@/components/UserAvatar/UserAvatar', () => ({
  UserAvatar: jest.fn(() => <div>Mock UserAvatar</div>),
}));

const mockRace = {
  organizationId: 'org-1',
  eventId: 'event-1',
  race: {
    id: 'race-1',
    path: 'races/race-1',
    name: 'Test Race',
  },
  children: [
    {
      preem: {
        id: 'preem-1',
        path: 'preems/preem-1',
        name: 'Test Preem 1',
        organizationId: 'org-1',
        raceId: 'race-1',
      },
      children: [
        {
          contribution: {
            id: 'contrib-1',
            path: 'contributions/contrib-1',
            amount: 100,
            message: 'Go fast!',
            preemId: 'preem-1',
            organizationId: 'org-1',
            date: new Date('2025-07-13T00:00:00Z'),
          },
          contributor: { id: 'user-1', path: 'users/user-1', name: 'Alice' },
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
    const raceWithNoContributions = {
      ...mockRace,
      children: [
        {
          preem: {
            id: 'preem-1',
            path: 'preems/preem-1',
            name: 'Test Preem 1',
            organizationId: 'org-1',
            raceId: 'race-1',
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
