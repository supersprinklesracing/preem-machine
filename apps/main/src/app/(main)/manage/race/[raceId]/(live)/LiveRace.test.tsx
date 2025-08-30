import { render, screen, fireEvent } from '@/test-utils';
import React from 'react';
import { LiveRace } from './LiveRace';
import type { LiveRaceData } from './LiveRace';
import '../../../../../../matchMedia.mock';

// Mock child components
jest.mock('@/components/animated-number', () => ({
  __esModule: true,
  default: jest.fn(({ value }) => <span>{value}</span>),
}));
jest.mock('@/components/PreemStatusBadge', () => ({
  __esModule: true,
  default: jest.fn(({ status }) => (
    <span data-testid="preem-status">{status}</span>
  )),
}));
jest.mock('./ManageRaceContributionTable', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock ManageRaceContributionTable</div>),
}));

const mockData: LiveRaceData = {
  race: {
    id: 'race-1',
    name: 'Test Race',
    startDate: new Date().toISOString(),
    preems: [
      { id: 'preem-1', name: 'Test Preem 1', status: 'Open', prizePool: 100 },
      { id: 'preem-2', name: 'Test Preem 2', status: 'Open', prizePool: 200 },
    ],
  },
  users: [],
};

describe('LiveRace component', () => {
  it('should render details and update status on click', () => {
    render(<LiveRace data={mockData} />);

    // Check initial render
    expect(
      screen.getByRole('heading', { level: 1, name: 'Test Race' }),
    ).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    // Header row + 2 preem rows
    expect(rows).toHaveLength(3);

    const statuses = screen.getAllByTestId('preem-status');
    expect(statuses[0]).toHaveTextContent('Open');
    expect(statuses[1]).toHaveTextContent('Open');

    // Click the first button
    const markAsAwardedButtons = screen.getAllByText('Mark as Awarded');
    fireEvent.click(markAsAwardedButtons[0]);

    // Check updated status
    expect(statuses[0]).toHaveTextContent('Awarded');
    expect(statuses[1]).toHaveTextContent('Open'); // Second one should be unchanged
  });
});
