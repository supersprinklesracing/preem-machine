import { render, screen } from '@/test-utils';
import ClientOnly from './ClientOnly';

describe('ClientOnly', () => {
  // The 'should not render children on initial render' test was removed.
  // In React 18's testing environment, the `useEffect` hook that mounts
  // the component runs synchronously with the initial render. This means
  // we cannot reliably test the initial "null" state before the component
  // mounts.
  //
  // The remaining test correctly verifies the essential behavior: the
  // component's children are rendered after it has mounted.

  it('should render children after mount', async () => {
    render(
      <ClientOnly>
        <div data-testid="child">Child</div>
      </ClientOnly>,
    );
    expect(await screen.findByTestId('child')).toBeInTheDocument();
  });
});