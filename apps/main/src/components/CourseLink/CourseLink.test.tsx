import { render, screen } from '@/test-utils';

import { CourseLink } from './CourseLink';

describe('CourseLink', () => {
  it('renders nothing when no course link is provided', () => {
    render(<CourseLink />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders a Strava embed for a Strava route link', () => {
    const stravaLink = 'https://www.strava.com/routes/12345';
    render(<CourseLink courseLink={stravaLink} />);
    expect(screen.getByText('Course')).toBeInTheDocument();
    expect(screen.getByTestId('strava-embed')).toBeInTheDocument();
  });

  it('renders a Ride with GPS embed for a Ride with GPS route link', () => {
    const rideWithGpsLink = 'https://ridewithgps.com/routes/67890';
    render(<CourseLink courseLink={rideWithGpsLink} />);
    expect(screen.getByText('Course')).toBeInTheDocument();
    expect(screen.getByTestId('ride-with-gps-embed')).toBeInTheDocument();
  });

  it('renders a regular link for other URLs', () => {
    const otherLink = 'https://www.google.com';
    render(<CourseLink courseLink={otherLink} />);
    expect(screen.getByText('Course')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: otherLink })).toBeInTheDocument();
  });
});
