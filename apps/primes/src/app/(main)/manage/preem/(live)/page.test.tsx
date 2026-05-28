import { NotFoundError } from '@/datastore/errors';
import { render, screen, setupMockDb } from '@/test-utils';

import { LivePreem } from './LivePreem';
import LivePreemPage from './page';

// Mock dependencies
jest.mock('./LivePreem', () => ({
  __esModule: true,
  LivePreem: jest.fn(() => <div>Mock LivePreem</div>),
}));

setupMockDb();

describe('LivePreemPage component', () => {
  it('should fetch preem data and render the LivePreem component', async () => {
    const searchParams = Promise.resolve({
      path: 'preems/first-lap',
    });
    const PageComponent = await LivePreemPage({ searchParams });
    render(PageComponent);

    expect(screen.getByText('Mock LivePreem')).toBeInTheDocument();

    const livePreemCalls = (LivePreem as jest.Mock).mock.calls;
    expect(livePreemCalls[0][0].preem.id).toBe('first-lap');
  });

  it('should throw NotFoundError when the preem does not exist', async () => {
    const searchParams = Promise.resolve({
      path: 'preems/does-not-exist',
    });
    await expect(LivePreemPage({ searchParams })).rejects.toThrow(
      NotFoundError,
    );
  });
});
