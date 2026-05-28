import { act } from '@testing-library/react';
import React from 'react';

import { render, screen } from '@/test-utils';

import { DateStatusBadge } from './DateStatusBadge';

describe('DateStatusBadge', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(() => cb(jest.now()), 0) as unknown as number;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id as unknown as NodeJS.Timeout);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

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

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('should render "Live" for an ongoing event', () => {
    const now = new Date();
    const anHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const inAnHour = new Date(now.getTime() + 60 * 60 * 1000);

    render(<DateStatusBadge startDate={anHourAgo} endDate={inAnHour} />);

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('should render "Finished" for a past event', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const pastDateMinusOneHour = new Date(pastDate.getTime() - 60 * 60 * 1000);

    render(
      <DateStatusBadge startDate={pastDateMinusOneHour} endDate={pastDate} />,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText('Finished')).toBeInTheDocument();
  });

  it('should render nothing if dates are not provided', () => {
    render(<DateStatusBadge />);

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
