import { render, screen } from '@/test-utils';
import { Breadcrumbs } from './Breadcrumbs';
import * as useBreadcrumbs from './useBreadcrumbs';
import { Anchor } from '@mantine/core';
import Link from 'next/link';

jest.mock('./useBreadcrumbs');

describe('Breadcrumbs', () => {
  it('should render the breadcrumbs returned by the hook', () => {
    const mockItems = [
      <Anchor component={Link} href="/test1" key="1">
        Test 1
      </Anchor>,
      <Anchor component={Link} href="/test2" key="2">
        Test 2
      </Anchor>,
    ];
    (useBreadcrumbs.useBreadcrumbs as jest.Mock).mockReturnValue(mockItems);

    render(<Breadcrumbs />);

    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('Test 2')).toBeInTheDocument();
  });

  it('should render nothing when the hook returns an empty array', () => {
    (useBreadcrumbs.useBreadcrumbs as jest.Mock).mockReturnValue([]);

    render(<Breadcrumbs />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
