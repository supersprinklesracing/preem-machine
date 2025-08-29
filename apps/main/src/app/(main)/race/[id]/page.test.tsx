import { render, screen, setupMockDb } from '@/test-utils';
import React from 'react';
import RacePage from './page';
import Race from './Race';
import { notFound } from 'next/navigation';
import '../../../../matchMedia.mock';

// Mock dependencies
jest.mock('./Race', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Race</div>),
}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

setupMockDb();

describe('RacePage component', () => {
  it('should fetch race data and render the Race component', async () => {
    const params = { id: 'race-giro-sf-2025-masters-women' };
    const PageComponent = await RacePage({ params });
    render(PageComponent);

    expect(screen.getByText('Mock Race')).toBeInTheDocument();

    const raceCalls = (Race as jest.Mock).mock.calls;
    expect(raceCalls[0][0].data.race.id).toBe(
      'race-giro-sf-2025-masters-women',
    );
  });

  it('should call notFound when the race does not exist', async () => {
    const params = { id: 'non-existent-race' };
    await RacePage({ params });

    expect(notFound).toHaveBeenCalled();
  });
});
