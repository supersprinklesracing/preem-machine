import { render, screen } from '@/test-utils';

import { DateLocationDetail } from './DateLocationDetail';

describe('DateLocationDetail', () => {
  it('should display the date with timezone', () => {
    const date = new Date('2025-01-01T12:00:00Z');
    render(
      <DateLocationDetail
        startDate={date}
        location="Test Location"
        timezone="America/New_York"
      />,
    );
    expect(screen.getByText(/Jan 1, 2025/)).toBeInTheDocument();
    expect(screen.getByText(/EST/)).toBeInTheDocument();
  });

  it('should display the date without timezone', () => {
    const date = new Date('2025-01-01T12:00:00Z');
    render(<DateLocationDetail startDate={date} location="Test Location" />);
    expect(screen.getByText(/Jan 1, 2025/)).toBeInTheDocument();
  });
});
