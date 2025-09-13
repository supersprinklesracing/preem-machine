import { render, screen } from '@/test-utils';
import React from 'react';
import DateStatusBadge from './DateStatusBadge';

describe('DateStatusBadge', () => {
  it('should render "Upcoming" for a future event', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDatePlusOneHour = new Date(
      futureDate.getTime() + 60 * 60 * 1000,
    );

    render(
      <DateStatusBadge
        startDate={futureDate}
        endDate={futureDatePlusOneHour}
      />,
    );
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('should render "Live" for an ongoing event', () => {
    const now = new Date();
    const anHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const inAnHour = new Date(now.getTime() + 60 * 60 * 1000);

    render(<DateStatusBadge startDate={anHourAgo} endDate={inAnHour} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('should render "Finished" for a past event', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const pastDateMinusOneHour = new Date(pastDate.getTime() - 60 * 60 * 1000);

    render(
      <DateStatusBadge startDate={pastDateMinusOneHour} endDate={pastDate} />,
    );
    expect(screen.getByText('Finished')).toBeInTheDocument();
  });

  it('should render nothing if dates are not provided', () => {
    render(<DateStatusBadge />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
