import React from 'react';

import { render, screen } from '@/test-utils';

import { PreemStatusBadge } from './PreemStatusBadge';

describe('PreemStatusBadge', () => {
  it('should render "Open" status', () => {
    render(<PreemStatusBadge status="Open" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should render "Minimum Met" status', () => {
    render(<PreemStatusBadge status="Minimum Met" />);
    expect(screen.getByText('Minimum Met')).toBeInTheDocument();
  });

  it('should render "Awarded" status', () => {
    render(<PreemStatusBadge status="Awarded" />);
    expect(screen.getByText('Awarded')).toBeInTheDocument();
  });
});
