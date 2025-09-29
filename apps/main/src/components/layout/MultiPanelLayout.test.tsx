import { render, screen } from '@/test-utils';

import { MultiPanelLayout } from './MultiPanelLayout';

describe('MultiPanelLayout', () => {
  it('renders the left and right panels', () => {
    render(
      <MultiPanelLayout
        topLeft={<div>Left Panel</div>}
        topRight={<div>Right Panel</div>}
      />,
    );

    expect(screen.getByText('Left Panel')).toBeInTheDocument();
    expect(screen.getByText('Right Panel')).toBeInTheDocument();
  });

  it('renders the bottom panel if it is provided', () => {
    render(
      <MultiPanelLayout
        topLeft={<div>Left Panel</div>}
        topRight={<div>Right Panel</div>}
        children={<div>Bottom Panel</div>}
      />,
    );

    expect(screen.getByText('Bottom Panel')).toBeInTheDocument();
  });

  it('does not render the bottom panel if it is not provided', () => {
    render(
      <MultiPanelLayout
        topLeft={<div>Left Panel</div>}
        topRight={<div>Right Panel</div>}
      />,
    );

    expect(screen.queryByText('Bottom Panel')).not.toBeInTheDocument();
  });
});
