import { render, screen } from '@/test-utils';
import { TwoColumnLayout } from './TwoColumnLayout';

describe('TwoColumnLayout', () => {
  it('renders the left and right panels', () => {
    render(
      <TwoColumnLayout
        leftPanel={<div>Left Panel</div>}
        rightPanel={<div>Right Panel</div>}
      />,
    );

    expect(screen.getByText('Left Panel')).toBeInTheDocument();
    expect(screen.getByText('Right Panel')).toBeInTheDocument();
  });

  it('renders the bottom panel if it is provided', () => {
    render(
      <TwoColumnLayout
        leftPanel={<div>Left Panel</div>}
        rightPanel={<div>Right Panel</div>}
        bottomPanel={<div>Bottom Panel</div>}
      />,
    );

    expect(screen.getByText('Bottom Panel')).toBeInTheDocument();
  });

  it('does not render the bottom panel if it is not provided', () => {
    render(
      <TwoColumnLayout
        leftPanel={<div>Left Panel</div>}
        rightPanel={<div>Right Panel</div>}
      />,
    );

    expect(screen.queryByText('Bottom Panel')).not.toBeInTheDocument();
  });
});
