import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import MultiPanelLayout from './MultiPanelLayout';

const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('MultiPanelLayout', () => {
  it('renders left and right panels', () => {
    renderWithMantine(
      <MultiPanelLayout
        leftPanel={<div>Left Panel</div>}
        rightPanel={<div>Right Panel</div>}
      />
    );
    expect(screen.getByText('Left Panel')).toBeInTheDocument();
    expect(screen.getByText('Right Panel')).toBeInTheDocument();
  });

  it('renders the bottom panel when provided', () => {
    renderWithMantine(
      <MultiPanelLayout
        leftPanel={<div>Left Panel</div>}
        rightPanel={<div>Right Panel</div>}
        bottomPanel={<div>Bottom Panel</div>}
      />
    );
    expect(screen.getByText('Bottom Panel')).toBeInTheDocument();
  });

  it('does not render the bottom panel when not provided', () => {
    renderWithMantine(
      <MultiPanelLayout
        leftPanel={<div>Left Panel</div>}
        rightPanel={<div>Right Panel</div>}
      />
    );
    expect(screen.queryByText('Bottom Panel')).not.toBeInTheDocument();
  });
});
