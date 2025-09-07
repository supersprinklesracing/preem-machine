import { render, screen, setupMockDb } from '@/test-utils';
import React from 'react';
import { NotFoundError } from '@/datastore/errors';
import RacePage from './page';
import Race from './Race';
import '@/matchMedia.mock';

// Mock dependencies
jest.mock('./Race', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Race</div>),
}));

setupMockDb();

describe('RacePage component', () => {
  it('should fetch race data and render the Race component', async () => {
    const searchParams = {
      path: 'organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
    };
    render(await RacePage({ searchParams }));

    expect(screen.getByText('Mock Race')).toBeInTheDocument();

    const raceCalls = (Race as jest.Mock).mock.calls;
    expect(raceCalls[0][0].race.id).toBe('race-giro-sf-2025-masters-women');
  });

  it('should throw NotFoundError when the race does not exist', async () => {
    const searchParams = {
      path: 'organizations/org-1/series/series-1/events/event-1/races/non-existent-race',
    };
    expect(RacePage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
