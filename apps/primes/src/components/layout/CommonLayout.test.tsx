import { render, screen } from '@/test-utils';

import { CommonLayout } from './CommonLayout';

describe('CommonLayout', () => {
  it('renders children correctly', () => {
    render(
      <CommonLayout>
        <div>Child Content</div>
      </CommonLayout>,
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders title and breadcrumb when provided', () => {
    render(
      <CommonLayout title={<h1>My Title</h1>} breadcrumb={<p>My Breadcrumb</p>}>
        <div>Child Content</div>
      </CommonLayout>,
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Breadcrumb')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders without title and breadcrumb when not provided', () => {
    render(
      <CommonLayout>
        <div>Child Content</div>
      </CommonLayout>,
    );
    expect(screen.queryByText('My Title')).not.toBeInTheDocument();
    expect(screen.queryByText('My Breadcrumb')).not.toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
