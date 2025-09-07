import { render, screen } from '@/test-utils';
import { Breadcrumbs } from './Breadcrumbs';
import {
  OrganizationBrief,
  SeriesBrief,
  EventBrief,
  RaceBrief,
  PreemBrief,
} from '@/datastore/types';

describe('Breadcrumbs', () => {
  const org1: OrganizationBrief = {
    id: 'org1',
    path: 'organizations/org1',
    name: 'Test Organization 1',
  };

  const series1: SeriesBrief = {
    id: 'series1',
    path: 'organizations/org1/series/series1',
    name: 'Test Series 1',
    organizationBrief: org1,
  };

  const event1: EventBrief = {
    id: 'event1',
    path: 'organizations/org1/series/series1/events/event1',
    name: 'Test Event 1',
    seriesBrief: series1,
  };

  const race1: RaceBrief = {
    id: 'race1',
    path: 'organizations/org1/series/series1/events/event1/races/race1',
    name: 'Test Race 1',
    eventBrief: event1,
  };

  const preem1: PreemBrief = {
    id: 'preem1',
    path: 'organizations/org1/series/series1/events/event1/races/race1/preems/preem1',
    name: 'Test Preem 1',
    raceBrief: race1,
  };

  it('renders breadcrumbs for an organization', () => {
    render(<Breadcrumbs brief={org1} />);
    expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
  });

  it('renders breadcrumbs for a series', () => {
    render(<Breadcrumbs brief={series1} />);
    expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
    expect(screen.getByText('Test Series 1')).toBeInTheDocument();
  });

  it('renders breadcrumbs for an event', () => {
    render(<Breadcrumbs brief={event1} />);
    expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
    expect(screen.getByText('Test Series 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
  });

  it('renders breadcrumbs for a race', () => {
    render(<Breadcrumbs brief={race1} />);
    expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
    expect(screen.getByText('Test Series 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Race 1')).toBeInTheDocument();
  });

  it('renders breadcrumbs for a preem', () => {
    render(<Breadcrumbs brief={preem1} />);
    expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
    expect(screen.getByText('Test Series 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Race 1')).toBeInTheDocument();
    expect(screen.getByText('Test Preem 1')).toBeInTheDocument();
  });
});
