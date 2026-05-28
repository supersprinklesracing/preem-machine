import React from 'react';

import { NotFoundError } from '@/datastore/errors';
import { render, screen, setupMockDb } from '@/test-utils';

import RacePage from './page';
import { Race } from './Race';

// Mock dependencies
jest.mock('./Race', () => ({
  __esModule: true,
  Race: jest.fn(() => <div>Mock Race</div>),
}));

setupMockDb();

describe('RacePage component', () => {
  it('should fetch race data and render the Race component', async () => {
    const searchParams = Promise.resolve({
      path: 'races/masters-women',
    });
    render(await RacePage({ searchParams }));

    expect(screen.getByText('Mock Race')).toBeInTheDocument();

    const raceCalls = (Race as jest.Mock).mock.calls;
    expect(raceCalls[0][0].race.id).toBe('masters-women');
  });

  it('should throw NotFoundError when the race does not exist', async () => {
    const searchParams = Promise.resolve({
      path: 'races/non-existent-race',
    });
    await expect(RacePage({ searchParams })).rejects.toThrow(NotFoundError);
  });
});
